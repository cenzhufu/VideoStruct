import { IFResponse } from 'ifvendors/utils/requests';
import { CommonResponseDataType } from 'sttypedefine';
import IFRequest from 'ifutils/requests';
import { TaskQueueItem } from 'ifutils/task-queue';
import { Md5, GetMd5Options } from 'ifutils/md5-file';
import axios, { CancelTokenSource, AxiosRequestConfig } from 'axios';
import { guid } from 'ifutils/guid';
import { TypeValidate, ValidateTool } from 'ifutils/validate-tool';
import { FileStatusType } from 'stutils/requests/file-server-requests';
import * as intl from 'react-intl-universal';

export enum BlobUpdateResult {
	AllFinished = 'finished',
	Continue = 'continue',
	Failed = 'failed'
}

export interface FileUploadConfigType {
	file: Required<File>;
	chunkSize?: number; // 分片大小，不传的话默认10M
	currentChunkOrder?: number; // 当前分片顺序

	md5Process?: (loaded: number, total: number, task: FileUpload) => void;
	md5Finished?: (loaded: number, total: number, task: FileUpload) => void;
	uploadError?: (error: Error, task: FileUpload) => void;
	// 获得文件状态检查请求的配置
	getFileStatusCheckRequestConfig?: (
		md5: string,
		task: FileUpload
	) => Partial<AxiosRequestConfig>;
	getFileSliceUploadRequestConfig?: (
		sliceFile: Blob,
		currentChunk: number,
		chunkSize: number,
		fileSize: number,
		md5: string,
		file: File,
		task: FileUpload
	) => Partial<AxiosRequestConfig>;
	checkFileSliceRequestResult?: (
		result: any,
		task: FileUpload
	) => BlobUpdateResult;
	// 上传完成的回调
	fileUploadFinished?: (result: any, task: FileUpload) => void;
}
/**
 * 状态
 * 1. active
 * 	*. 获取md5中
 * 	*. check
 * 	*. upload...
 * 2. waiting
 * 3. suspend
 * 	*. pause
 *  *. error
 * 	*. abort
 */
class FileUpload implements TaskQueueItem {
	private _config: FileUploadConfigType;
	private _file: File;
	private _chunkSize: number; // 分片的大小(byte))，默认为10*1024*1024(10m)
	private _currentChunkOrder: number; // 当前分片的顺序，从0开始
	private _guid: string;

	// 获取md5的状态
	private _md5: string;
	private _inMd5ing: boolean;
	private _md5Loader?: FileReader;

	// 上传前检查的状态
	private _inChecking: boolean;
	// 上传状态
	private _inUploading: boolean;
	// 暂停状态
	private _paused: boolean;
	// 错误的状态
	private _error?: Error;
	// 取消状态
	private _inAbort: boolean;
	// 完成状态
	private _inFinished: boolean;

	// 取消handle
	private _cancelSource?: CancelTokenSource;

	constructor(config: FileUploadConfigType) {
		// TODO: 参数判断
		this._guid = guid();
		this._file = config.file;
		this._config = config;
		this.reset();
	}

	// TaskQueueItem
	getId() {
		return this._guid;
	}

	/**
	 * 开始任务
	 * @memberof FileUpload
	 * @returns {void}
	 */
	start(): void {
		this._resetStatus();

		if (this._md5) {
			// 上传
			console.log(
				'已经获得md5, 直接上传',
				'file: ',
				this._file.name,
				'md5:',
				this._md5
			);
			if (TypeValidate.isFunction(this._config.md5Finished)) {
				// @ts-ignore
				this._config.md5Finished(this._file.size, this._file.size);
			}
			this._start();
		} else {
			let self = this;
			this._md5Loader = this._getFileMd5(this._file, {
				onMd5Process: function(loaded: number, total: number) {
					self._changeToMd5Status(true);
					if (TypeValidate.isFunction(self._config.md5Process)) {
						// @ts-ignore
						self._config.md5Process(loaded, total, self);
					}
				},
				onMd5Finished: function(hash: string) {
					// NOTE: 加上文件名
					self._md5 = hash + self._file.name;

					if (TypeValidate.isFunction(self._config.md5Finished)) {
						// @ts-ignore
						self._config.md5Finished(self._file.size, self._file.size, self);
					}
					// 上传开始
					self._start();
				},
				onMd5Abort: function(payload: any) {
					let error = new Error(intl.get('FILE_MD5_ABORT').d('已取消'));
					self._changeToAbortStatus(true);

					console.log('md5计算取消', 'file: ', self._file.name);
					if (
						TypeValidate.isFunction(self._config.uploadError) &&
						// false表示错误事件是从上层传过来的，我们不需要再传回去
						payload !== false
					) {
						// @ts-ignore
						self._config.uploadError(error);
					}
				},
				onMd5Error: function(error: DOMException) {
					console.error('on load file md5 error', error);
					self._changeToErrorStatus(error, true);
					if (TypeValidate.isFunction(self._config.uploadError)) {
						// @ts-ignore
						self._config.uploadError(error);
					}
				}
			});
		}
	}

	/**
	 * 暂停任务
	 * @memberof FileUpload
	 * @returns {void}
	 */
	pause(): void {
		//
		if (!this._paused) {
			this.cancel();
			// 状态改变
			this._changeToPauseStatus(true);
		}
	}

	continue() {
		this.start();
	}

	retry() {
		if (this._error || this._inAbort) {
			this.reset();

			// 其他操作
			this.start();
		} else {
			console.log('不需要retry');
		}
	}

	/**
	 * 取消任务（手动）
	 * @memberof FileUpload
	 * @returns {void}
	 */
	cancel(): void {
		this._resetStatus();

		if (this._md5Loader) {
			// NOTE: 不触发之前的onMd5Abort? why?,
			// 如果触发了onAbort，则会引起循环调用（onAbort->onMd5Abort->config.uploadError() -> _taskQueue.cancel() -> fileUpload.cancel(自己)）
			this._md5Loader.abort();
			// 我们改写了onabort, 可以查看md5File  onabort(为了防止循环的调用，传入false)
			this._md5Loader.onabort(null, false); // 会带到onMd5Abort的参数里边去
			this._md5Loader = undefined;
		}

		if (this._cancelSource) {
			this._cancelSource.cancel();
			this._cancelSource = undefined;
		}
	}

	// 状态查询函数
	isFinished(): boolean {
		return this._inFinished;
	}

	isActive(): boolean {
		return this._inUploading || this._inMd5ing || this._inChecking;
	}

	isError(): boolean {
		// eslint-disable-next-line
		return this._error != undefined;
	}

	isSuspended(): boolean {
		return this.isError() || this._inAbort || this._paused;
	}

	reset() {
		this._currentChunkOrder = 0;
		this._chunkSize = 10 * 1024 * 1024;

		this._resetStatus();
	}

	/**
	 * 获得文件的md5值
	 * @private
	 * @param {File} file 文件
	 * @param {GetMd5Options} [options] 配置
	 * @memberof FileUpload
	 * @returns {Md5FileReader} md5 file reader实例
	 */
	private _getFileMd5(file: File, options?: GetMd5Options): FileReader {
		let loader = Md5.getFileMd5(file, options);
		return loader;
	}

	private async _start() {
		this._checkUploadedSlice()
			.then((sliceRecord: FileStatusType) => {
				this._changeToUploadingStatus();

				// NOTE: 目前只检查currentChunk
				// 重新设置currentChunk
				this._currentChunkOrder = sliceRecord.currChunk || 0;
				// 文件上传
				this._uploadFile()
					.then((result) => {
						this._chageToFinishedStatus(true);
						if (TypeValidate.isFunction(this._config.fileUploadFinished)) {
							// @ts-ignore
							let serverData: CommonResponseDataType<
								any
							> = ValidateTool.getValidObject(result['data'], {});
							// @ts-ignore  原封不动的返回服务器数据
							this._config.fileUploadFinished(serverData, this);
						}
					})
					.catch((error: Error) => {
						if (!IFRequest.isCancel(error)) {
							this.cancel();
							this._changeToErrorStatus(error, true);
							if (TypeValidate.isFunction(this._config.uploadError)) {
								// @ts-ignore
								this._config.uploadError(error, this);
							}
						}
					});
			})
			.catch((error: Error) => {
				if (!IFRequest.isCancel(error)) {
					this._changeToErrorStatus(error, true);
					this.cancel();
					if (TypeValidate.isFunction(this._config.uploadError)) {
						// @ts-ignore
						this._config.uploadError(error, this);
					}
				}
			});
	}

	/**
	 * 检查已上传的分片信息
	 * @private
	 * @memberof FileUpload
	 * @returns {Promise<FileSliceRecode>} 分片信息
	 */
	private async _checkUploadedSlice(): Promise<FileStatusType> {
		this._changeToCheckingStatus();
		this._inChecking = true;

		let config = {};
		if (TypeValidate.isFunction(this._config.getFileStatusCheckRequestConfig)) {
			// @ts-ignore
			config = this._config.getFileStatusCheckRequestConfig(this._md5, this);
		}
		// 添加取消
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		this._cancelSource = source;
		// 数据请求
		// @ts-ignore
		let result: IFResponse<
			CommonResponseDataType<FileStatusType>
		> = await IFRequest.request({ ...config, cancelToken: source.token });

		// @ts-ignore
		let serverData: CommonResponseDataType<
			FileStatusType
		> = ValidateTool.getValidObject(result['data']);

		// @ts-ignore
		return ValidateTool.getValidObject(serverData['data']);
	}

	/**
	 * 文件上传
	 * @private
	 * @memberof FileUpload
	 * @returns {Promise<boolean>} 结果
	 */
	private async _uploadFile(): Promise<any> {
		let result: any;

		// 每次上传的blob数量
		let blobCountPerBatch = 1;
		do {
			// let blobs: Array<Blob> = [];
			// 添加blob数组

			let start = this._currentChunkOrder * this._chunkSize;
			let end = Math.min(start + this._chunkSize, this._file.size);
			let fileSlice = this._file.slice(start, end, this._file.type);

			let config = {};
			if (
				TypeValidate.isFunction(this._config.getFileSliceUploadRequestConfig)
			) {
				// @ts-ignore
				config = this._config.getFileSliceUploadRequestConfig(
					fileSlice,
					this._currentChunkOrder,
					this._chunkSize,
					this._file.size,
					this._md5,
					this._file,
					this
				);
			}
			// 添加取消
			const CancelToken = axios.CancelToken;
			const source = CancelToken.source();
			this._cancelSource = source;

			console.log(`传输第${this._currentChunkOrder}块开始`, this._file.name);
			// 如果出错了，while还会循环么？答：不会
			result = await IFRequest.request({
				...config,
				cancelToken: source.token
			});
			console.log(`传输第${this._currentChunkOrder}块完成`, this._file.name);

			// 重置source
			if (this._cancelSource) {
				this._cancelSource.cancel();
				this._cancelSource = undefined;
			}

			let checkResult = BlobUpdateResult.Continue;
			// 提供给外界诶判断结构
			if (TypeValidate.isFunction(this._config.checkFileSliceRequestResult)) {
				// @ts-ignore
				checkResult = this._config.checkFileSliceRequestResult(result, this);
			}

			if (checkResult === BlobUpdateResult.AllFinished) {
				return result;
			} else if (checkResult === BlobUpdateResult.Failed) {
				return Promise.reject(new Error('upload error'));
			}

			this._currentChunkOrder += blobCountPerBatch;
		} while (this._currentChunkOrder * this._chunkSize < this._file.size);

		// @ts-ignore
		return result;
	}

	/*********************状态管理 ***************************/

	private _resetStatus() {
		this._inMd5ing = false;
		this._inChecking = false;
		this._inUploading = false;
		this._paused = false;
		this._error = undefined;
		this._inAbort = false;
		this._inFinished = false;
	}

	private _changeToMd5Status(reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}

		this._inMd5ing = true;
	}

	private _changeToCheckingStatus(reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}
		this._inChecking = true;
	}

	private _changeToUploadingStatus(reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}
		this._inUploading = true;
	}

	private _changeToPauseStatus(reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}
		this._paused = true;
	}

	private _changeToErrorStatus(error: Error, reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}
		this._error = error;
	}

	private _changeToAbortStatus(reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}
		this._inAbort = true;
	}

	private _chageToFinishedStatus(reset: boolean = false) {
		if (reset) {
			this._resetStatus();
		}
		this._inFinished = true;
	}
}

export default FileUpload;
