import AnalysisSubGetInfoTask, {
	AnalysisSubGetInfoTaskDelegate
} from './AnalysisSubGetInfoTask';
import { ESourceType, ETargetType } from 'sttypedefine';
import AnalysisSubCreateTask, {
	AnalysisSubCreateDelegate
} from './AnalysisSubCreateTask';
import {
	TaskQueueDecorateItem,
	TaskQueueStepTask,
	TaskQueueItem
} from 'ifvendors/utils/task-queue';
import {
	IFFileUploadResultInfo,
	FileStatusType
} from 'stsrc/utils/requests/file-server-requests';

import * as is from 'is';

import AnalysisSubRestartTask, {
	AnalysisSubRestartTaskDelegate
} from './AnalysisSubRestartTask';
import FileSelect from 'ifvendors/utils/file-select';
import Config from 'stsrc/utils/config';
import {
	EAnalysisSourceType,
	FileType,
	IFAnalysisTaskProfileInfo,
	IFAnalysisTaskInfo
} from 'stsrc/utils/requests/collection-request';
import FileUploadFlowTask from './FileUploadFlowTask';

export interface FileUploadFlowTaskDelegate {
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

	onUploadProgress: (
		progressEvent: ProgressEvent,
		preSlicesLoaded: number, // 之前总共加载完的大小（字节）
		file: File,
		task: TaskQueueItem
	) => void;
	onUploadFinished: (
		fileUploadInfo: IFFileUploadResultInfo,
		file: File,
		task: TaskQueueItem
	) => void;
	onUploadFailed: (error: Error, file: File, task: TaskQueueItem) => void;

	onGetAnalysisInfoFinished: (
		analysisInfo: IFAnalysisTaskInfo,
		taskId: string,
		file: File,
		task: TaskQueueItem
	) => void;
}

class FileUploadAndCreateAnalysisFlowTask extends TaskQueueDecorateItem
	implements
		AnalysisSubCreateDelegate,
		AnalysisSubRestartTaskDelegate,
		AnalysisSubGetInfoTaskDelegate {
	private _file: File;

	private _md5: string;
	private _fileCheckResult: FileStatusType;
	private _fileUploadInfo: IFFileUploadResultInfo;
	private _createResult: IFAnalysisTaskProfileInfo;

	private delegate: FileUploadFlowTaskDelegate;

	constructor(
		file: File,
		delegate: FileUploadFlowTaskDelegate,
		targets: ETargetType[] = []
	) {
		super();

		let uploadFlowTask = new FileUploadFlowTask(file, this);
		let createAnalysisTask = new AnalysisSubCreateTask(this, targets);
		let restartAnalysisTask = new AnalysisSubRestartTask(this);
		let getAnalysisInfoTask = new AnalysisSubGetInfoTask(this);

		this._file = file;
		this.delegate = delegate;

		// 顺序执行
		this.setTasks(
			uploadFlowTask,
			createAnalysisTask,
			restartAnalysisTask,
			getAnalysisInfoTask
		);
	}

	/************************* md5 delegate START ************************/

	onMd5Process = (
		loaded: number,
		total: number,
		file: File,
		task: TaskQueueItem
	) => {
		if (this.delegate && is.function(this.delegate.onMd5Process)) {
			// @ts-ignore
			this.delegate.onMd5Process(loaded, total, file, this);
		}
	};

	onMd5Finished = (hash: string, file: File, task: TaskQueueItem) => {
		this._md5 = hash;
		if (this.delegate && is.function(this.delegate.onMd5Finished)) {
			// @ts-ignore
			this.delegate.onMd5Finished(hash, file, this);
		}
	};

	onMd5Abort = (payload: any, file: File, task: TaskQueueItem) => {
		if (this.delegate && is.function(this.delegate.onMd5Abort)) {
			// @ts-ignore
			this.delegate.onMd5Abort(payload, file, this);
		}
	};

	onMd5Error = (error: DOMException, file: File, task: TaskQueueItem) => {
		if (this.delegate && is.function(this.delegate.onMd5Error)) {
			// @ts-ignore
			this.delegate.onMd5Error(error, file, this);
		}
	};

	/************************* md5 delegate END ************************/

	/**************************** Upload Delete Start  **********************/

	getFileCheckResult = (file: File, task: TaskQueueItem) => {
		return this._fileCheckResult;
	};

	onUploadProgress = (
		progressEvent: ProgressEvent,
		preSlicesLoaded: number, // 之前总共加载完的大小（字节）
		file: File,
		task: TaskQueueItem
	) => {
		if (
			this.delegate &&
			this.delegate.onUploadProgress &&
			is.function(this.delegate.onUploadProgress)
		) {
			this.delegate.onUploadProgress(
				progressEvent,
				preSlicesLoaded,
				file,
				this
			);
		}
	};

	onUploadFinished = (
		fileUploadInfo: IFFileUploadResultInfo,
		file: File,
		task: TaskQueueItem
	) => {
		this._fileUploadInfo = fileUploadInfo;
		if (
			this.delegate &&
			this.delegate.onUploadFinished &&
			is.function(this.delegate.onUploadFinished)
		) {
			this.delegate.onUploadFinished(fileUploadInfo, file, this);
		}
	};

	onUploadFailed = (error: Error, file: File, task: TaskQueueItem) => {
		if (
			this.delegate &&
			this.delegate.onUploadFailed &&
			is.function(this.delegate.onUploadFailed)
		) {
			this.delegate.onUploadFailed(error, file, this);
		}
	};

	/**************************** Upload Delete End  **********************/

	/**************************** create Start  **********************/

	getChannelName = () => {
		return this._file.name;
	};

	getSourceType = () => {
		return EAnalysisSourceType.OffLineFile;
	};

	getFileUrl = () => {
		return this._fileUploadInfo.fileUrl;
	};

	getFileType = () => {
		let isZipFile = FileSelect.isValidFile(
			this._file,
			Config.getSupportedRarFormat().join(',')
		);

		let isVideoFile = FileSelect.isValidFile(
			this._file,
			Config.getSupportedVideoFormat().join(',')
		);

		let sourceType = isZipFile
			? ESourceType.Zip
			: isVideoFile
			? ESourceType.Video
			: ESourceType.Unknown;

		return sourceType === ESourceType.Zip
			? FileType.Zip
			: FileType.OffLineVideo;
	};

	getFileSize = () => {
		return this._file.size;
	};

	onCreateFinished = (
		result: IFAnalysisTaskProfileInfo,
		task: TaskQueueItem
	) => {
		// TODO:
		this._createResult = result;
	};

	onCreateFailed = (error: Error, task: TaskQueueItem) => {
		if (
			this.delegate &&
			this.delegate.onUploadFailed &&
			is.function(this.delegate.onUploadFailed)
		) {
			this.delegate.onUploadFailed(error, this._file, this);
		}
	};

	/**************************** create  End  **********************/

	/**************************** restart End  **********************/

	// NOTE: 两处地方使用到了
	getTaskId = () => {
		return this._createResult.id;
	};

	onRestartFinished = (task: TaskQueueItem) => {};

	onRestartFailed = (error: Error, task: TaskQueueItem) => {
		if (
			this.delegate &&
			this.delegate.onUploadFailed &&
			is.function(this.delegate.onUploadFailed)
		) {
			this.delegate.onUploadFailed(error, this._file, this);
		}
	};

	/**************************** restart  End  **********************/

	/**************************** get info  Start  **********************/

	getAnalysisInfoFinished = (result: IFAnalysisTaskInfo, taskId: string) => {
		if (
			this.delegate &&
			this.delegate.onGetAnalysisInfoFinished &&
			is.function(this.delegate.onGetAnalysisInfoFinished)
		) {
			this.delegate.onGetAnalysisInfoFinished(result, taskId, this._file, this);
		}
	};

	getAnalysisInfoFaild = (error: Error, task: TaskQueueItem) => {
		if (
			this.delegate &&
			this.delegate.onUploadFailed &&
			is.function(this.delegate.onUploadFailed)
		) {
			this.delegate.onUploadFailed(error, this._file, this);
		}
	};

	/**************************** get info  End  **********************/
}

export default FileUploadAndCreateAnalysisFlowTask;
