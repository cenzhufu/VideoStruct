// md5任务
import { Md5, GetMd5Options } from 'ifutils/md5-file';
import { TaskQueueStepTask } from 'ifvendors/utils/task-queue';
import * as is from 'is';

export interface Md5TaskDelegate {
	onMd5Process?: (
		loaded: number,
		total: number,
		file: File,
		task: TaskQueueStepTask
	) => void;
	onMd5Finished?: (hash: string, file: File, task: TaskQueueStepTask) => void;
	onMd5Error?: (
		error: DOMException,
		file: File,
		task: TaskQueueStepTask
	) => void;
	onMd5Abort?: (payload: any, file: File, task: TaskQueueStepTask) => void;
}

/**
 * md5任务
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class Md5Task extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	// 执行一些回调的方法
	private _delegate: Md5TaskDelegate;
	private _file: File;
	private _md5Loader?: FileReader;

	constructor(file: File, delegate: Md5TaskDelegate) {
		super({
			update: 1 * 1000
		});

		this._delegate = delegate;
		this._file = file;

		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
	}

	/**
	 * 获得文件的md5值
	 * @private
	 * @param {File} file 文件
	 * @param {GetMd5Options} [options] 配置
	 * @memberof FileUpload
	 * @returns {Md5FileReader} md5 file reader实例
	 */
	getFileMd5(file: File, options?: GetMd5Options): FileReader {
		let loader = Md5.getFileMd5(file, options);
		return loader;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;

		let self = this;
		this._md5Loader = this.getFileMd5(this._file, {
			onMd5Process: (loaded: number, total: number) => {
				console.log('md5 -------------------------------', loaded, total);
				// 交由delegate
				if (self._delegate && is.function(self._delegate.onMd5Process)) {
					// @ts-ignore
					self._delegate.onMd5Process(loaded, total, self._file, self);
				}
			},
			onMd5Finished: (hash: string) => {
				self._isFinished = true;
				self._isActive = false;
				self._isError = false;

				// 加上文件名(产品要求)
				let md5 = hash + self._file.name;
				if (self._delegate && is.function(self._delegate.onMd5Finished)) {
					// @ts-ignore
					self._delegate.onMd5Finished(md5, self._file, self);
				}
			},
			onMd5Error: (error: DOMException) => {
				self._isFinished = false;
				self._isActive = false;
				self._isError = true;

				if (self._delegate && is.function(self._delegate.onMd5Error)) {
					// @ts-ignore
					self._delegate.onMd5Error(error, self._file, self);
				}
			},
			onMd5Abort: (payload: any) => {
				self._isFinished = false;
				self._isActive = false;
				self._isError = true;

				if (self._delegate && is.function(self._delegate.onMd5Abort)) {
					// @ts-ignore
					self._delegate.onMd5Abort(null, self._file, self);
				}
			}
		});
	}

	pause() {
		if (this._md5Loader) {
			// @ts-ignore
			this._md5Loader.onabort();
			this._md5Loader = undefined;
		}
		return false;
	}

	continue() {
		this.pause();
		this.reset();
		this.start();
	}

	retry() {
		this.continue();
	}

	cancel() {
		this.pause();
	}

	isActive() {
		return this._isActive;
	}

	isError() {
		return this._isError;
	}

	isSuspended() {
		return this._isError;
	}

	isFinished() {
		return this._isFinished;
	}

	update(deltaTime: number) {
		// do nothing
	}
}

export default Md5Task;
