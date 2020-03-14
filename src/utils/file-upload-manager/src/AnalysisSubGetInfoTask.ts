// 开始任务
import {
	CollectionTaskRequest,
	IFAnalysisTaskInfo,
	IFAnalysisSourceProfileInfo
} from 'stsrc/utils/requests/collection-request';
import { TaskQueueStepTask, TaskQueueItem } from 'ifvendors/utils/task-queue';
import * as is from 'is';

export interface AnalysisSubGetInfoTaskDelegate {
	getTaskId: () => string;

	getAnalysisInfoFinished: (
		result: IFAnalysisTaskInfo,
		taskId: string,
		task: TaskQueueItem
	) => void;
	getAnalysisInfoFaild: (error: Error, task: TaskQueueItem) => void;
}

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class AnalysisSubGetInfoTask extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	private _taskId: string;

	// 执行一些回调的方法
	private _delegate: AnalysisSubGetInfoTaskDelegate;

	constructor(delegate: AnalysisSubGetInfoTaskDelegate) {
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
			return CollectionTaskRequest.getAnalysisTask(taskId)
				.then((result: IFAnalysisTaskInfo) => {
					let analysisInfo: IFAnalysisSourceProfileInfo | undefined =
						result.analyzeResource;
					if (analysisInfo) {
						this._isActive = false;
						this._isFinished = true;
						this._isError = false;

						if (
							this._delegate &&
							this._delegate.getAnalysisInfoFinished &&
							is.function(this._delegate.getAnalysisInfoFinished)
						) {
							this._delegate.getAnalysisInfoFinished(result, taskId, this);
						}
						// return analysisInfo;
					} else {
						this._isActive = false;
						this._isFinished = true;
						this._isError = true;

						let error = new Error('不存在的任务');
						if (
							this._delegate &&
							this._delegate.getAnalysisInfoFaild &&
							is.function(this._delegate.getAnalysisInfoFaild)
						) {
							this._delegate.getAnalysisInfoFaild(error, this);
						}
						// return Promise.reject(error);
					}
				})
				.catch((error: Error) => {
					// message.error(error.message);
					console.error(error);
					this._isActive = false;
					this._isError = true;
					this._isFinished = true;
					if (
						this._delegate &&
						this._delegate.getAnalysisInfoFaild &&
						is.function(this._delegate.getAnalysisInfoFaild)
					) {
						this._delegate.getAnalysisInfoFaild(error, this);
					}
					// return Promise.reject(error);
				});
		} else {
			this._isActive = false;
			this._isError = true;
			this._isFinished = true;

			let error = new Error('错误的参数(get info)');
			if (
				this._delegate &&
				this._delegate.getAnalysisInfoFaild &&
				is.function(this._delegate.getAnalysisInfoFaild)
			) {
				this._delegate.getAnalysisInfoFaild(error, this);
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

export default AnalysisSubGetInfoTask;
