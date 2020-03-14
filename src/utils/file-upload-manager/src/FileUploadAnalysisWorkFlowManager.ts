import {
	ListType,
	ETargetType,
	IFTreeNode,
	getDefaultIFTreeNode
} from 'stsrc/type-define';
import { EventType } from 'stutils/event-emit';
import { ESourceType, getValidSourceType } from 'sttypedefine';
import { IFFileUploadResultInfo } from 'stsrc/utils/requests/file-server-requests';
// import FileUpload, { BlobUpdateResult } from 'ifvendors/utils/file-upload';
import TaskQueue, {
	TaskQueueItem,
	TaskQueueType
} from 'ifvendors/utils/task-queue';

import store from 'src/redux';
import {
	FileUploadActionCreators,
	IFUploadAndAnalysisProcessInfo,
	EUploadStatus,
	EUploadAndAnalysisStepType
} from 'stsrc/components/file-upload-analysis-panel';
import {
	CollectionAnalysisSourceRequest,
	IFAnalysisTaskInfo,
	IFAnalysisSourceProfileInfo,
	EAnalysisSourceStatus,
	IFAnalysisSourceDetailInfo,
	IFAnalysisTaskProgressInfo,
	EAnalysisUserType
} from 'stsrc/utils/requests/collection-request';
import eventEmiiter from 'stsrc/utils/event-emit';
import { FileUploadFlowTaskDelegate } from './FileUploadFlowTask';
import { guid } from 'ifvendors/utils/guid';
import FileUploadAndCreateAnalysisFlowTask from './FileUploadAndCreateAnalysisFlowTask';
import AnalysisSubUpdateTask from './AnalysisSubUpdateTask';

// 文件上传管理
let instance: FIleUploadAnalysisWorkFlowManager | null;

class FIleUploadAnalysisWorkFlowManager implements FileUploadFlowTaskDelegate {
	_taskQueue: TaskQueue; // 任务队列
	_taskQueueForAnalysisInfoUpdate: TaskQueue; // 用来处理分析任务更新的队列

	fileUploadInfos: Array<IFUploadAndAnalysisProcessInfo>; // 上传任务的信息

	// 用来保存临时的进度，这些进度最终会计算成一个进度，生成到fileUploadInfos里边去
	private loadTaskProcess: {
		// 任务id -> 加载的进度
		[taskId: string]: { md5Percent: number; uploadingPercent: number }; // [0, 100]
	};

	constructor() {
		this._taskQueue = new TaskQueue({
			maxParalleledCount: 5
		});

		this._taskQueueForAnalysisInfoUpdate = new TaskQueue({
			maxParalleledCount: 10
		});

		this.loadTaskProcess = {};
		this.fileUploadInfos = [];

		// 登出事件处理
		eventEmiiter.addListener(EventType.logout, () => {
			this._taskQueue.clearAll();
			this._taskQueueForAnalysisInfoUpdate.clearAll();
			this.loadTaskProcess = {};
			this.fileUploadInfos = [];
		});

		// 登录
		eventEmiiter.addListener(EventType.logIn, () => {
			this.getAllProcessingAnalysisTasks();
		});

		// 用户信息
		eventEmiiter.addListener(EventType.getUserInfo, () => {
			this.getAllProcessingAnalysisTasks();
		});

		eventEmiiter.addListener(
			EventType.activeAnalysisInfoTask,
			(info: IFUploadAndAnalysisProcessInfo) => {
				// 找到对应的任务
				let taskId = info.taskId;
				this._taskQueueForAnalysisInfoUpdate.activeTaskById(taskId);
			}
		);

		eventEmiiter.addListener(
			EventType.disactiveAnalysisInfoTask,
			(info: IFUploadAndAnalysisProcessInfo) => {
				let taskId = info.taskId;
				this._taskQueueForAnalysisInfoUpdate.pauseTaskById(taskId);
			}
		);

		eventEmiiter.addListener(
			EventType.deleteAnalysisingSource,
			(ids: string, from: string) => {
				if (from !== FIleUploadAnalysisWorkFlowManager.ownName()) {
					let allIds = String(ids).split(',');
					for (let id of allIds) {
						// 找id
						for (let i = 0; i < this.fileUploadInfos.length; i++) {
							// eslint-disable-next-line
							if (this.fileUploadInfos[i].id == id) {
								this.removeUploadTask(this.fileUploadInfos[i].taskId, true);
								break;
							}
						}
					}
				}
			}
		);
	}

	static ownName(): string {
		return 'file-upload-analysis-work-flow-mananger';
	}

	/**
	 * 获取未完成的记录
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 * @returns {void}
	 */
	getAllProcessingAnalysisTasks() {
		CollectionAnalysisSourceRequest.getAnalysisSourceList({
			page: 1,
			pageSize: 20,
			// TODO: 获取除了完成状态之外的所有的数据
			status: [
				EAnalysisSourceStatus.Waiting,
				EAnalysisSourceStatus.PAUSED,
				EAnalysisSourceStatus.STREAM,
				EAnalysisSourceStatus.CommonFailed,
				EAnalysisSourceStatus.ResourceUnvalid,
				EAnalysisSourceStatus.FileFormatError,
				EAnalysisSourceStatus.NoImageError,
				EAnalysisSourceStatus.WaitingFor,
				EAnalysisSourceStatus.STREAMISNORMAL,
				EAnalysisSourceStatus.STREAMISABNORMAL,
				EAnalysisSourceStatus.Analysising
			],
			sourceTypes: [ESourceType.Video, ESourceType.Zip],
			userType: EAnalysisUserType.MySelf
		})
			.then((result: ListType<IFAnalysisSourceDetailInfo>) => {
				for (let item of result.list) {
					// 实例化任务
					let newTask = this._createAnalysisInfoUpdateTask(
						item.sourceId,
						getValidSourceType(item.sourceType)
					);

					// 新增记录
					this.fileUploadInfos.push({
						taskId: newTask.getId(),
						uploadStatus: EUploadStatus.Succeed,
						uploadProcess: 100,
						tip: '',
						sourceType: item.sourceType,
						sourceId: item.sourceId,
						id: item.id,
						error: null,
						analysisProcess: 0,
						analysisTaskId: '',
						sourceStatus: item.status,
						size: item.sourceSize,
						name: item.sourceName,
						fileUniqueKey: guid(),
						stepType: EUploadAndAnalysisStepType.Analysising,
						targetTypes: [] // NOTE: 这个随便赋个值
					});

					// 加入到更新队列中去(加入激活队列，但是不自动从暂停->活动队列)
					this._taskQueueForAnalysisInfoUpdate.addItem(newTask, false);
				}

				// 通知更新
				this.refreshUploadInfos(this.fileUploadInfos);

				if (result.list.length > 0) {
					// 更新小红点
					this.increaseBadgeCount(result.list.length);
				}
			})
			.catch((error: Error) => {
				console.error(error);
			});
	}

	/**
	 * 生成无效的上传记录
	 * @param {File} file 文件
	 * @param {string} tip 提示
	 * @returns {IFUploadAndAnalysisProcessInfo} IFUploadAndAnalysisProcessInfo 记录
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 */
	generateUnvalidFildInfo(
		file: File,
		tip: string
	): IFUploadAndAnalysisProcessInfo {
		return {
			taskId: guid(),
			uploadStatus: EUploadStatus.Unvalid,
			uploadProcess: 0,
			tip: tip,
			name: file.name,
			size: file.size,
			sourceType: ESourceType.Unknown,
			sourceId: '',
			id: '',
			sourceStatus: EAnalysisSourceStatus.Unknown,
			analysisTaskId: '',
			analysisProcess: 0,
			error: new Error(tip),
			fileUniqueKey: this._getFileUniqueId(file),
			stepType: EUploadAndAnalysisStepType.Unknown,
			targetTypes: []
		};
	}

	/**
	 * 获得处于上传阶段的任务数量
	 * @returns {number} 数量
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 */
	getAllFileLoadTasksCount() {
		let count = 0;
		for (let task of this.fileUploadInfos) {
			if (task.stepType === EUploadAndAnalysisStepType.Uploading) {
				count++;
			}
		}

		return count;
	}

	/**
	 * 添加无效的上传文件记录
	 * @param {Array<IFUploadAndAnalysisProcessInfo>} [fileInfos=[]] 无效的文件 NOTE: 这个应不应该让外界去构造这个数据结构呢
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 * @returns {void}
	 */
	addUnvalidFileInfos(fileInfos: Array<IFUploadAndAnalysisProcessInfo> = []) {
		for (let item of fileInfos) {
			this.fileUploadInfos.push(item);
		}

		// 通知更新
		this.refreshUploadInfos(this.fileUploadInfos);
		this.increaseBadgeCount(fileInfos.length);
	}

	/**
	 * 新增上传任务
	 * @param {Array<File>} files 带上传的文件
	 * @param {ETargetType[]} targetTypes 解析任务类型
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 * @returns {void}
	 */
	addUploadTasks(files: Array<File>, targetTypes: ETargetType[] = []) {
		for (let file of files) {
			this.addUploadTask(file, targetTypes);
		}

		// 通知更新
		this.refreshUploadInfos(this.fileUploadInfos);
		this.increaseBadgeCount(files.length);
	}

	hasSameFile(file: File) {
		let uniqueId = this._getFileUniqueId(file);
		for (let info of this.fileUploadInfos) {
			if (uniqueId === info.fileUniqueKey) {
				return true;
			}
		}

		return false;
	}

	addUploadTask(file: File, targetTypes: ETargetType[] = []) {
		// 创建上传任务
		let task: TaskQueueItem = this._createUploadTask(file, targetTypes);

		// let guid = this._getFileUniqueId(file);
		// @ts-ignore
		this.loadTaskProcess[`${task.getId()}`] = {
			md5Percent: 0,
			uploadingPercent: 0
		};

		// 构建上传信息
		this.fileUploadInfos.push({
			taskId: task.getId(),
			uploadStatus: EUploadStatus.Waiting,
			uploadProcess: 0,
			tip: '',
			size: file.size,
			name: file.name,
			sourceType: ESourceType.Unknown,
			sourceId: '',
			id: '',
			error: null,
			analysisProcess: 0,
			analysisTaskId: '',
			sourceStatus: EAnalysisSourceStatus.Unknown,
			fileUniqueKey: this._getFileUniqueId(file),
			stepType: EUploadAndAnalysisStepType.Uploading,
			targetTypes: targetTypes
		});

		// 加入任务队列
		this._taskQueue.addItem(task);
	}

	/**
	 * 删除任务记录（显示）
	 * @param {string} taskId 任务id
	 * @param {boolean} [updateBadge=true] 是否更新badge
	 * @returns {void}
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 */
	removeFileInfo(taskId: string, updateBadge: boolean = true) {
		// 移除对应的上传信息
		for (let i = 0; i < this.fileUploadInfos.length; i++) {
			if (taskId === this.fileUploadInfos[i].taskId) {
				// 移除上传进度信息
				// let taskInfo = this.fileUploadInfos[i];
				// let fileId = this._getFileUniqueId(taskInfo.file);
				Reflect.deleteProperty(this.loadTaskProcess, taskId);

				this.fileUploadInfos.splice(i, 1);

				this.refreshUploadInfos(this.fileUploadInfos);

				if (updateBadge) {
					// 更新小红点
					this.decreaseBadgeCount();
				}

				break;
			}
		}
	}

	/**
	 * 从任务队列中删除任务，并从显示列表中删除
	 * @param {string} taskId 任务id
	 * @param {boolean} [updateBadge=true] 是否更新badge
	 * @returns {void}
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 */
	removeUploadTask(taskId: string, updateBadge: boolean = true) {
		this._taskQueue.removeAndCancelItemById(taskId, TaskQueueType.Suspend);
		this._taskQueue.removeAndCancelItemById(taskId, TaskQueueType.Waiting);
		this._taskQueue.removeAndCancelItemById(taskId, TaskQueueType.Active);

		this.removeFileInfo(taskId, true);
		// 通知更新
	}

	finishedAnalysisTask(item: IFUploadAndAnalysisProcessInfo) {
		// 删除对应的任务
		this.removeUploadTask(item.taskId, true);
	}

	/************************* md5 delegate START ************************/

	onMd5Process = (
		loaded: number,
		total: number,
		file: File,
		task: TaskQueueItem
	) => {
		// 更新进度
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		// 更新
		this._updateMd5Process(loaded, total, fileKey);
		let process = this._calculateProcess(fileKey);

		// 更新进度
		this._updateFileUploadInfo(task.getId(), EUploadStatus.Processing, process);
	};

	onMd5Finished = (hash: string, file: File, task: TaskQueueItem) => {
		// 计算进度
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		// 更新
		this._updateMd5Process(1, 1, fileKey);
		let process = this._calculateProcess(fileKey);

		this._updateFileUploadInfo(task.getId(), EUploadStatus.Processing, process);
	};

	onMd5Abort = (payload: any, file: File, task: TaskQueueItem) => {
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		let process = this._calculateProcess(fileKey);

		this.updateFileUploadInfo(task.getId(), {
			uploadStatus: EUploadStatus.Failed,
			uploadProcess: process,
			tip: '已取消',
			error: new Error('已取消')
		});
	};

	onMd5Error = (error: DOMException, file: File, task: TaskQueueItem) => {
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		let process = this._calculateProcess(fileKey);
		// this._updateFileUploadInfo(task.getId(), EUploadStatus.Failed, process);

		this.updateFileUploadInfo(task.getId(), {
			uploadStatus: EUploadStatus.Failed,
			uploadProcess: process,
			tip: error.message,
			error: error
		});
	};

	/************************* md5 delegate END ************************/

	/******************** file upload flow task Delegate Start ********/

	onUploadProgress = (
		progressEvent: ProgressEvent,
		preSlicesLoaded: number,
		file: File,
		task: TaskQueueItem
	) => {
		let loaded = progressEvent.loaded;
		// 计算进度
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		// 更新
		this._updateUploadProcess(preSlicesLoaded + loaded, file.size, fileKey);
		let process = this._calculateProcess(fileKey);
		// 更新进度
		this._updateFileUploadInfo(task.getId(), EUploadStatus.Processing, process);
	};

	onUploadFinished = (
		fileUploadInfo: IFFileUploadResultInfo,
		file: File,
		task: TaskQueueItem
	) => {
		// 计算进度
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		// 更新
		this._updateUploadProcess(1, 1, fileKey);

		this._updateFileUploadInfo(
			task.getId(),
			EUploadStatus.Succeed,
			100,
			fileUploadInfo
		);
	};

	onUploadFailed = (error: Error, file: File, task: TaskQueueItem) => {
		let fileKey = task.getId(); // this._getFileUniqueId(file);
		let processConfig = this.loadTaskProcess[fileKey];
		let process = 0;
		if (processConfig) {
			process = (processConfig.md5Percent + processConfig.uploadingPercent) / 2;
			// 更新进度
			// this._updateFileUploadInfo(task.getId(), EUploadStatus.Failed, process);
		}

		this.updateFileUploadInfo(task.getId(), {
			uploadStatus: EUploadStatus.Failed,
			uploadProcess: process,
			tip: error.message,
			error: error
		});
	};

	/******************** file upload flow task Delegate END ********/

	/******************** analysis info Delegate Start ********/

	onGetAnalysisInfoFinished = (
		analysisInfo: IFAnalysisTaskInfo,
		taskId: string,
		file: File,
		task: TaskQueueItem
	) => {
		let sourceInfo = analysisInfo.analyzeResource as IFAnalysisSourceProfileInfo;

		let newTask = this._createAnalysisInfoUpdateTask(
			sourceInfo.sourceId,
			getValidSourceType(sourceInfo.sourceType)
		);

		this.updateFileUploadInfo(task.getId(), {
			taskId: newTask.getId(), // IDEA: 修改taskId()
			sourceId: sourceInfo.sourceId,
			analysisTaskId: taskId,
			analysisProcess: 0,
			stepType: EUploadAndAnalysisStepType.Analysising, // NOTE: 放在这儿何不适合
			id: sourceInfo.id, // 记录
			sourceType: getValidSourceType(sourceInfo.sourceType),
			sourceStatus: analysisInfo.status
		});

		//  加入到更新队列中去(自动加入激活队列，但是不自动从暂停->活动队列)
		this._taskQueueForAnalysisInfoUpdate.addItem(newTask, true);

		let treeNode: IFTreeNode = {
			...getDefaultIFTreeNode<number>(0),
			id: sourceInfo.sourceId,
			name: sourceInfo.sourceName,
			value: 0,
			uuid: guid()
		};

		// 发送新增数据源事件
		eventEmiiter.emit(
			EventType.addNewAnalysisSource,
			treeNode,
			sourceInfo.sourceType
		);
	};

	onAnalysisInfoUpdated = (
		res: IFAnalysisTaskProgressInfo,
		task: TaskQueueItem
	) => {
		this.updateFileUploadInfo(task.getId(), {
			analysisProcess: res.analyzeProgress,
			sourceStatus: res.status
		});
	};

	onAnalysisInfoUpdateFinished = (
		res: IFAnalysisTaskProgressInfo,
		task: TaskQueueItem
	) => {
		this.updateFileUploadInfo(task.getId(), {
			analysisProcess: res.analyzeProgress,
			sourceStatus: res.status
		});

		// 删除记录
		this.removeUploadTask(task.getId(), true);
	};

	onAnalysisInfoUpdateFaild = (error: Error, task: TaskQueueItem) => {
		this.updateFileUploadInfo(task.getId(), {
			error: error,
			tip: error.message
		});
	};

	/************************** end ***********************************/

	/**
	 * 外部调用，发送删除事件
	 * @param {IFUploadAndAnalysisProcessInfo} item 数据源信息
	 * @returns {void} void
	 * @memberof FIleUploadAnalysisWorkFlowManager
	 */
	emitDeleteEvent = (item: IFUploadAndAnalysisProcessInfo) => {
		// 删除
		eventEmiiter.emit(
			EventType.deleteAnalysisingSource,
			item.id,
			FIleUploadAnalysisWorkFlowManager.ownName(),
			item
		);
	};

	private _createUploadTask(
		file: File,
		targetTypes: ETargetType[] = []
	): TaskQueueItem {
		return new FileUploadAndCreateAnalysisFlowTask(file, this, targetTypes);
	}

	private _createAnalysisInfoUpdateTask(
		sourceId: string,
		sourceType: ESourceType
	): TaskQueueItem {
		return new AnalysisSubUpdateTask(sourceId, sourceType, this);
	}

	// 新接口
	private updateFileUploadInfo(
		taskId: string,
		updated: Partial<IFUploadAndAnalysisProcessInfo>,
		group: Array<IFUploadAndAnalysisProcessInfo> = this.fileUploadInfos
	) {
		for (let i = 0; i < group.length; i++) {
			if (taskId === group[i].taskId) {
				// 移除上传进度信息
				let taskInfo = group[i];

				let keys = Object.keys(updated);
				for (let key of keys) {
					if (taskInfo.hasOwnProperty(key)) {
						taskInfo[key] = updated[key];
					}
				}
				// this.fileUploadInfos[i] = { ...taskInfo };
				// 通知更新
				this.refreshUploadInfos(this.fileUploadInfos);

				break;
			}
		}
	}

	// 旧接口
	private _updateFileUploadInfo(
		taskId: string,
		uploadStatus: EUploadStatus,
		uploadProcess: number,
		fileInfo?: IFFileUploadResultInfo
	) {
		this.updateFileUploadInfo(taskId, {
			uploadStatus: uploadStatus,
			uploadProcess: uploadProcess,
			fileUploadResult: fileInfo
		});
	}

	/**
	 * 获得文件的一个标志符（非md5)
	 * @private
	 * @param {File} file 文件
	 * @returns {string} string
	 * @memberof FilesUploadModal
	 */
	private _getFileUniqueId(file: File): string {
		return `${file.name}-${file.size}-${file.type}-${file.lastModified}`;
	}

	private _getDemandStr(str: string): string {
		let matched: RegExpMatchArray | null = str.match(/\d{1,}\.\d/);
		if (matched) {
			return matched[0];
		} else {
			return str;
		}
	}

	/**
	 * 更新md5进度
	 * @param {number} loaded  加载的数量
	 * @param {number} total 总量
	 * @param {string} filekey 附加的文件guid
	 * @returns {void}
	 */
	private _updateMd5Process(
		loaded: number,
		total: number,
		filekey: string
	): void {
		let processConfig = this.loadTaskProcess[filekey];
		if (processConfig) {
			let precent = Number.parseFloat(
				this._getDemandStr(String((100 * loaded) / total))
			);
			processConfig['md5Percent'] = precent;
		}
	}

	/**
	 * 计算上传进度
	 * @private
	 * @param {string} fileId 附加的文件guid
	 * @returns {number} 进度
	 * @memberof FilesUploadModal
	 */
	private _calculateProcess(fileId: string) {
		// 返回默认现有的进度
		let keys = Object.keys(this.loadTaskProcess);
		let md5Percent = 0;
		let uploadPercent = 0;
		for (let key of keys) {
			if (key === fileId) {
				let config = this.loadTaskProcess[key];
				md5Percent += config['md5Percent'] || 0;
				uploadPercent += config['uploadingPercent'] || 0;
			}
		}
		// 文件数量
		let fileCount = 1;

		return Math.min(
			100,
			Number.parseFloat(
				this._getDemandStr(
					String((100 * (md5Percent + uploadPercent)) / (200 * fileCount))
				)
			)
		);
	}

	/**
	 * 更新md5进度
	 * @param {number} loaded  加载的数量
	 * @param {number} total 总量
	 * @param {string} filekey 附加的文件guid
	 * @returns {void}
	 */
	private _updateUploadProcess(loaded: number, total: number, filekey: string) {
		let processConfig = this.loadTaskProcess[filekey];
		if (processConfig) {
			let precent = Number.parseFloat(
				this._getDemandStr(String((100 * loaded) / total))
			);
			processConfig['uploadingPercent'] = precent;
		}
	}

	/******************** redux 方法 ××××××××××××××××××××××*/

	private increaseBadgeCount(badge: number = 0) {
		if (badge > 0) {
			store.dispatch(
				FileUploadActionCreators.increaseFinishedBadgeCountActionCreator(badge)
			);
		}
	}

	private decreaseBadgeCount(badge: number = 1) {
		store.dispatch(
			FileUploadActionCreators.decreateFinishedBadgeCountActionCreator(badge)
		);
	}

	private refreshUploadInfos(infos: IFUploadAndAnalysisProcessInfo[] = []) {
		// 通知更新
		store.dispatch(
			FileUploadActionCreators.refreshUploadFilesActionCreator(infos)
		);
	}
}

/**
 * 单例
 * @returns {FIleUploadAnalysisWorkFlowManager} 实例的FileUploadInnerManager
 */
function getInstance() {
	if (!instance) {
		instance = new FIleUploadAnalysisWorkFlowManager();
	}

	return instance;
}
const FileUploadManager = {
	getInstance: getInstance
};
// 先运行一次
FileUploadManager.getInstance();
export default FileUploadManager;
