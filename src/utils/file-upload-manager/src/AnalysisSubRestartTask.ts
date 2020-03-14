import { TaskQueueItem, TaskQueueStepTask } from 'ifvendors/utils/task-queue';
// 开始任务
import { CollectionTaskRequest } from 'stsrc/utils/requests/collection-request';
import * as is from 'is';
export interface AnalysisSubRestartTaskDelegate {
	getTaskId: () => string;

	onRestartFinished: (task: TaskQueueItem) => void;
	onRestartFailed: (error: Error, task: TaskQueueItem) => void;
}

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class AnalysisSubRestartTask extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	private _taskId: string;

	// 执行一些回调的方法
	private _delegate: AnalysisSubRestartTaskDelegate;

	constructor(delegate: AnalysisSubRestartTaskDelegate) {
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
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;

		let taskId: string = '';
		if (
			this._delegate &&
			this._delegate.getTaskId &&
			is.function(this._delegate.getTaskId)
		) {
			taskId = this._delegate.getTaskId();
		}

		if (taskId && (is.string(taskId) || is.number(taskId))) {
			return CollectionTaskRequest.startAnalysisTask(taskId)
				.then(() => {
					console.log('开始任务成功');
					this._isActive = false;
					this._isFinished = true;
					this._isError = false;

					if (
						this._delegate &&
						this._delegate.onRestartFinished &&
						is.function(this._delegate.onRestartFinished)
					) {
						this._delegate.onRestartFinished(this);
					}

					// return true;
				})
				.catch((error: Error) => {
					// message.error(error.message);
					console.error(error);
					this._isActive = false;
					this._isError = true;
					this._isFinished = true;
					if (
						this._delegate &&
						this._delegate.onRestartFailed &&
						is.function(this._delegate.onRestartFailed)
					) {
						this._delegate.onRestartFailed(error, this);
					}

					// return Promise.reject(error);
				});
		} else {
			this._isActive = false;
			this._isError = true;
			this._isFinished = true;

			let error = new Error('错误的参数(restart)');
			if (
				this._delegate &&
				this._delegate.onRestartFailed &&
				is.function(this._delegate.onRestartFailed)
			) {
				this._delegate.onRestartFailed(error, this);
			}

			// return Promise.reject(error);
		}
	}

	pause() {
		return false;
	}

	continue() {
		this.start();
	}

	retry() {
		this.start();
	}

	cancel() {
		// NOTE: 暂时不想写取消
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

export default AnalysisSubRestartTask;
