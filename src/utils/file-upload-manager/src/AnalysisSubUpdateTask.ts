import { IFRequest } from 'ifutils/requests';
import {
	IFAnalysisTaskProgressInfo,
	isAnalysisSourceFinished,
	isAnalysisSourceFailed,
	getAnalysisStatusTip,
	isAnalysisSourceProcessing,
	isAnalysisPaused,
	isAnalysisSourceWaiting
} from 'stutils/requests/collection-request';
// 开始任务
import { CollectionTaskRequest } from 'stsrc/utils/requests/collection-request';
import { TaskQueueStepTask, TaskQueueItem } from 'ifvendors/utils/task-queue';
import { ESourceType, ETaskType } from 'stsrc/type-define';
import * as is from 'is';
import { IFCancelTokenSource } from 'ifvendors/utils/requests';

export interface AnalysisSubUpdateTaskDelegate {
	onAnalysisInfoUpdated: (
		res: IFAnalysisTaskProgressInfo,
		task: TaskQueueItem
	) => void;
	onAnalysisInfoUpdateFinished: (
		res: IFAnalysisTaskProgressInfo,
		task: TaskQueueItem
	) => void;
	onAnalysisInfoUpdateFaild: (error: Error, task: TaskQueueItem) => void;
}

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class AnalysisSubUpdateTask extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	private _sourceId: string;
	private _sourceType: ESourceType;

	private _isInPreviousUpdating: boolean; // 是否还在上一次的更新当中

	private _delegate: AnalysisSubUpdateTaskDelegate;

	private _source: IFCancelTokenSource | null; // 请求取消handle

	constructor(
		sourceId: string,
		sourceType: ESourceType,
		delegate: AnalysisSubUpdateTaskDelegate
	) {
		super({
			update: 10 * 1000 // 10s更新一次
		});

		this._sourceId = sourceId;
		this._sourceType = sourceType;

		this._delegate = delegate;
		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
		this._isInPreviousUpdating = false;
	}

	/************** 重载方法 ************************/

	async start() {
		this._isActive = true;
		// do nothing
	}

	pause() {
		return false;
	}

	continue() {
		this.start();
	}

	retry() {
		this.reset();
		this.start();
	}

	cancel() {
		if (this._source) {
			this._source.cancel();
			this._source = null;
		}
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
		this._updateIfNeeded();
	}

	_updateIfNeeded() {
		if (this._isInPreviousUpdating) {
			return;
		}

		this._isInPreviousUpdating = true;
		this._isActive = false;

		this._source = IFRequest.getCancelSource();
		CollectionTaskRequest.queryTaskProgressInfo(
			ETaskType.AnalysisTask,
			this._sourceId,
			{
				cancelToken: this._source.token
			}
		)
			.then((res: IFAnalysisTaskProgressInfo) => {
				this._isInPreviousUpdating = false;

				if (res) {
					// 完成
					if (isAnalysisSourceFinished(res.status)) {
						this._isError = false;
						this._isFinished = true;
						if (
							this._delegate &&
							this._delegate.onAnalysisInfoUpdateFinished &&
							is.function(this._delegate.onAnalysisInfoUpdateFinished)
						) {
							this._delegate.onAnalysisInfoUpdateFinished(res, this);
						}
					}

					// 失败
					if (isAnalysisSourceFailed(res.status)) {
						this._isError = true;
						this._isFinished = true;
						if (
							this._delegate &&
							this._delegate.onAnalysisInfoUpdateFaild &&
							is.function(this._delegate.onAnalysisInfoUpdateFaild)
						) {
							this._delegate.onAnalysisInfoUpdateFaild(
								new Error(getAnalysisStatusTip(res.status)),
								this
							);
						}
					}

					// 加入paused状态
					if (
						isAnalysisSourceProcessing(res.status) ||
						isAnalysisPaused(res.status) ||
						isAnalysisSourceWaiting(res.status)
					) {
						if (
							this._delegate &&
							this._delegate.onAnalysisInfoUpdated &&
							is.function(this._delegate.onAnalysisInfoUpdated)
						) {
							this._delegate.onAnalysisInfoUpdated(res, this);
						}
					}
				} else {
					this._isError = true;
					this._isFinished = true;
					if (
						this._delegate &&
						this._delegate.onAnalysisInfoUpdateFaild &&
						is.function(this._delegate.onAnalysisInfoUpdateFaild)
					) {
						this._delegate.onAnalysisInfoUpdateFaild(
							new Error('未知的数据源'),
							this
						);
					}
				}
			})
			.catch((error: Error) => {
				this._isInPreviousUpdating = false;
				this._isError = true;
				this._isActive = false;
				this._isFinished = true;

				if (
					this._delegate &&
					this._delegate.onAnalysisInfoUpdateFaild &&
					is.function(this._delegate.onAnalysisInfoUpdateFaild)
				) {
					this._delegate.onAnalysisInfoUpdateFaild(error, this);
				}
			});
	}
}

export default AnalysisSubUpdateTask;
