import { FileStatusType } from 'stutils/requests/file-server-requests/file-request';
// 文件状态检查任务
import FileRequest from 'stsrc/utils/requests/file-server-requests';
import { TaskQueueStepTask, TaskQueueItem } from 'ifvendors/utils/task-queue';
import * as is from 'is';
import { CancelTokenSource } from 'axios';
import IFRequest from 'ifvendors/utils/requests';

export interface FileStatusCheckTaskDelegate {
	getCheckMd5: (task: TaskQueueStepTask) => string | null;
	onCheckFinished: (result: FileStatusType) => void;
	onCheckFailed: (error: Error, task: TaskQueueItem) => void;
}

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class FileStatusCheckTask extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	// 执行一些回调的方法
	private _delegate: FileStatusCheckTaskDelegate;

	private _cancelSource?: CancelTokenSource;

	constructor(delegate: FileStatusCheckTaskDelegate) {
		super({
			update: 1 * 1000
		});

		this._delegate = delegate;

		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
		this._cancelSource = undefined;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;

		// 获取参数md5
		let md5: string | null = '';
		if (this._delegate && is.function(this._delegate.getCheckMd5)) {
			md5 = this._delegate.getCheckMd5(this);
		}

		if (md5 && is.string(md5)) {
			this._cancelSource = IFRequest.getCancelSource();
			return FileRequest.fileStatusCheck(md5, {
				cancelToken: this._cancelSource.token
			})
				.then((result: FileStatusType) => {
					this._isActive = false;
					this._isError = false;
					this._isFinished = true;

					if (
						this._delegate &&
						this._delegate.onCheckFinished &&
						is.function(this._delegate.onCheckFinished)
					) {
						this._delegate.onCheckFinished(result);
					}
					// return result;
				})
				.catch((error: Error) => {
					this._isActive = false;
					this._isError = true;
					this._isFinished = false;

					if (
						this._delegate &&
						this._delegate.onCheckFailed &&
						is.function(this._delegate.onCheckFailed)
					) {
						this._delegate.onCheckFailed(error, this);
					}
					// return Promise.reject(error);
				});
		} else {
			this._isActive = false;
			this._isError = true;
			this._isFinished = true;

			let error = new Error('无效的md5值');
			if (
				this._delegate &&
				this._delegate.onCheckFailed &&
				is.function(this._delegate.onCheckFailed)
			) {
				this._delegate.onCheckFailed(error, this);
			}

			// return Promise.reject(error);
		}
	}

	pause() {
		this.cancel();
	}

	continue() {
		this.cancel();
		this.start();
	}

	retry() {
		this.cancel();
		this.start();
	}

	cancel() {
		if (this._cancelSource) {
			this._cancelSource.cancel();
			this._cancelSource = undefined;
		}

		this.reset();
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

export default FileStatusCheckTask;
