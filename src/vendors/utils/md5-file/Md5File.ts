import { TypeValidate } from 'ifutils/validate-tool';
import { hex, md5cycle, md51_array, md5blk_array } from './md5';
import { EventEmitter } from 'events';

class Md5FileArrayBuffer {
	private _buff: Uint8Array;
	private _length: number;
	private _state: Array<number>;
	private _eventEmit: EventEmitter;

	constructor() {
		// call reset to init the instance
		this.reset();
	}

	static hash(arr: ArrayBuffer, raw: boolean): String | Array<number> {
		let hash = md51_array(new Uint8Array(arr));

		return raw ? hash : hex(hash);
	}

	append(arr: Uint8Array) {
		// TODO: we could avoid the concatenation here but the algorithm would be more complex
		//       if you find yourself needing extra performance, please make a PR.
		let buff = this._concatArrayBuffer(this._buff, arr);
		let length = buff.length;
		let i;

		this._length += arr.byteLength;

		for (i = 64; i <= length; i += 64) {
			md5cycle(this._state, md5blk_array(buff.subarray(i - 64, i)));
		}

		// Avoids IE10 weirdness (documented above)
		this._buff = i - 64 < length ? buff.subarray(i - 64) : new Uint8Array(0);
	}

	end(raw: boolean = false) {
		let buff = this._buff;
		let length = buff.length;
		let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let i;
		let ret;

		for (i = 0; i < length; i += 1) {
			tail[i >> 2] |= buff[i] << (i % 4 << 3);
		}

		this._finish(tail, length);
		ret = raw ? this._state : hex(this._state);

		this.reset();

		return ret;
	}

	// eslint-disable-next-line
	_finish(tail: Array<number>, length: number) {
		let i = length;
		let tmp;
		let lo;
		let hi;

		tail[i >> 2] |= 0x80 << (i % 4 << 3);
		if (i > 55) {
			md5cycle(this._state, tail);
			for (i = 0; i < 16; i += 1) {
				tail[i] = 0;
			}
		}

		// Do the final computation based on the tail and length
		// Beware that the final length may not fit in 32 bits so we take care of that
		tmp = this._length * 8;
		tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
		if (tmp) {
			lo = parseInt(tmp[2], 16);
			hi = parseInt(tmp[1], 16) || 0;

			tail[14] = lo;
			tail[15] = hi;
			md5cycle(this._state, tail);
		}
	}

	reset() {
		this._buff = new Uint8Array(0);
		this._length = 0;
		this._state = [1732584193, -271733879, -1732584194, 271733878];
		this._eventEmit = new EventEmitter();
	}

	// eslint-disable-next-line
	destroy() {
		delete this._state;
		delete this._buff;
		delete this._length;
		delete this._eventEmit;
	}

	_concatArrayBuffer(first: Uint8Array, second: Uint8Array): Uint8Array {
		let firstLength = first.length;
		let result = new Uint8Array(firstLength + second.byteLength);

		result.set(first);
		result.set(new Uint8Array(second), firstLength);

		return result;
	}
}

export interface GetMd5Options {
	onMd5Process?: (loaded: number, total: number) => void;
	onMd5Finished?: (hash: string) => void;
	onMd5Error?: (error: DOMException) => void;
	onMd5Abort?: (payload: any) => void;
}

function getFileMd5(file: Blob, options?: GetMd5Options) {
	// let blob = file.getSource();
	let blob = file;
	let chunkSize = 2 * 1024 * 1024;
	let chunks = Math.ceil(blob.size / chunkSize);
	let chunk = 0;
	// let owner = this.owner,
	let spark = new Md5FileArrayBuffer();
	// me = this,
	let blobSlice = blob.slice;

	let fr = new FileReader();

	let timeHandle: NodeJS.Timer;

	let loadNext = function() {
		let start = chunk * chunkSize;
		let end = Math.min(start + chunkSize, blob.size);

		fr.onload = function(e: ProgressEvent) {
			if (e.target) {
				// @ts-ignore
				spark.append(e.target.result);
			}

			if (options && TypeValidate.isFunction(options.onMd5Process)) {
				// @ts-ignore
				options.onMd5Process(end, file.size);
			}
			// 发送md5进度事件
			// fr.emitProgress(end, file.size);
		};

		fr.onloadend = function() {
			fr.onloadend = fr.onload = null;

			if (!fr.error) {
				if (++chunk < chunks) {
					timeHandle = setTimeout(loadNext, 1);
				} else {
					timeHandle = setTimeout(function() {
						if (options && TypeValidate.isFunction(options.onMd5Finished)) {
							// @ts-ignore
							options.onMd5Finished(spark.end());
						}
						// 发送md5完成事件
						// fr.emitFinished(spark.end());
					}, 50);
				}
			}
		};

		fr.readAsArrayBuffer(blobSlice.call(blob, start, end));
	};

	fr.onerror = function onerror(event: ProgressEvent) {
		let fileReder = event.target as FileReader;
		if (timeHandle) {
			clearTimeout(timeHandle);
		}

		if (fileReder.error) {
			// 发送md5错误事件
			if (options && TypeValidate.isFunction(options.onMd5Error)) {
				// @ts-ignore
				options.onMd5Error(fileReder.error);
			}
			// fr.emitError(fileReder.error);
		} else {
			console.error('md5 error');
		}
	};

	fr.onabort = function(event: ProgressEvent, payload: any) {
		if (timeHandle) {
			clearTimeout(timeHandle);
		}
		// 发送md5取消事件
		// fr.emitAbort();
		if (options && TypeValidate.isFunction(options.onMd5Abort)) {
			// @ts-ignore
			options.onMd5Abort(payload);
		}
	};

	loadNext();

	return fr;
}

export { getFileMd5 };
// export default Md5File;
