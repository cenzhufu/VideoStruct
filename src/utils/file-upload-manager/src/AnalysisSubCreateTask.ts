import { ETargetType } from './../../../type-define/types/target-type';
import {
	EAnalysisSourceType,
	CollectionAnalysisSourceRequest,
	FileType,
	IFAnalysisTaskProfileInfo,
	convertToSpecialTarget
} from 'stsrc/utils/requests/collection-request';
import { TaskQueueStepTask, TaskQueueItem } from 'ifvendors/utils/task-queue';
import * as is from 'is';
interface AnalysisSubTaskCreateOption {
	channelName: string;
	sourceType: EAnalysisSourceType;
	fileUrl: string;
	fileType: FileType;
	fileSize: number; // 字节
}

export interface AnalysisSubCreateDelegate {
	//
	getChannelName: () => string;
	getSourceType: () => EAnalysisSourceType;
	getFileUrl: () => string;
	getFileType: () => FileType;
	getFileSize: () => number;

	onCreateFinished: (
		result: IFAnalysisTaskProfileInfo,
		task: TaskQueueItem
	) => void;
	onCreateFailed: (error: Error, task: TaskQueueItem) => void;
}

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class AnalysisSubCreateTask extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	private _options: AnalysisSubTaskCreateOption;

	// 执行一些回调的方法
	private _delegate: AnalysisSubCreateDelegate;

	private _targetTypes: ETargetType[];

	constructor(
		delegate: AnalysisSubCreateDelegate,
		targetTypes: ETargetType[] = []
	) {
		super({
			update: 1 * 1000
		});

		this._delegate = delegate;
		this._targetTypes = targetTypes;
		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
	}

	setOptions(options: AnalysisSubTaskCreateOption) {
		this._options = options;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;

		// 获取参数
		let channelName: string = '';
		if (
			this._delegate &&
			this._delegate.getChannelName &&
			is.function(this._delegate.getChannelName)
		) {
			channelName = this._delegate.getChannelName();
		}

		let fileUrl: string = '';
		if (
			this._delegate &&
			this._delegate.getFileUrl &&
			is.function(this._delegate.getFileUrl)
		) {
			fileUrl = this._delegate.getFileUrl();
		}

		let fileType: FileType = FileType.OffLineVideo;
		if (
			this._delegate &&
			this._delegate.getFileType &&
			is.function(this._delegate.getFileType)
		) {
			fileType = this._delegate.getFileType();
		}

		//
		let fileSize: number = 0;
		if (
			this._delegate &&
			this._delegate.getFileSize &&
			is.function(this._delegate.getFileSize)
		) {
			fileSize = this._delegate.getFileSize();
		}

		//
		let sourceType: EAnalysisSourceType = EAnalysisSourceType.OffLineFile;
		if (
			this._delegate &&
			this._delegate.getSourceType &&
			is.function(this._delegate.getSourceType)
		) {
			sourceType = this._delegate.getSourceType();
		}
		if (
			channelName &&
			fileUrl &&
			fileSize &&
			!is.undefined(sourceType) &&
			is.string(channelName) &&
			is.string(fileUrl) &&
			is.number(fileSize)
		) {
			let convertedTypes: string = this._targetTypes
				.map((target: ETargetType) => {
					return convertToSpecialTarget(target);
				})
				.filter((item: string) => {
					return !!item;
				})
				.join(',');

			return CollectionAnalysisSourceRequest.createAnalysissTask({
				channelName: channelName,
				fileParam: {
					fileUrl: fileUrl,
					fileType: fileType,
					fileSize: fileSize
				},
				sourceType: sourceType,
				imageUploadJson: {
					targetType: convertedTypes
				},
				transType: 0
			})
				.then((result: IFAnalysisTaskProfileInfo) => {
					// 执行完了
					this._isActive = false;
					this._isFinished = true;
					this._isError = false;

					if (
						this._delegate &&
						this._delegate.onCreateFinished &&
						is.function(this._delegate.onCreateFinished)
					) {
						this._delegate.onCreateFinished(result, this);
					}
					// return result;
				})
				.catch((error: Error) => {
					this._isActive = false;
					this._isError = true;
					this._isFinished = true;

					if (
						this._delegate &&
						this._delegate.onCreateFailed &&
						is.function(this._delegate.onCreateFailed)
					) {
						this._delegate.onCreateFailed(error, this);
					}

					// return Promise.reject(error);
				});
		} else {
			this._isActive = false;
			this._isError = true;
			this._isFinished = true;

			let error = new Error('错误的参数(create)');
			if (
				this._delegate &&
				this._delegate.onCreateFailed &&
				is.function(this._delegate.onCreateFailed)
			) {
				this._delegate.onCreateFailed(error, this);
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

export default AnalysisSubCreateTask;
