import {
	TaskQueueDecorateItem,
	TaskQueueStepTask,
	TaskQueueItem
} from 'ifvendors/utils/task-queue';
import {
	IFFileUploadResultInfo,
	FileStatusType
} from 'stsrc/utils/requests/file-server-requests';
import Md5Task, { Md5TaskDelegate } from './Md5Task';
import * as is from 'is';
import FileStatusCheckTask, {
	FileStatusCheckTaskDelegate
} from './FileStatusCheckTask';
import FileUploadTask, { FileUploadTaskDelegate } from './FileUploadTask';

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
}

class FileUploadFlowTask extends TaskQueueDecorateItem
	implements
		Md5TaskDelegate,
		FileStatusCheckTaskDelegate,
		FileUploadTaskDelegate {
	private _md5: string;
	private _file: File;
	private _fileCheckResult: FileStatusType;

	private delegate: FileUploadFlowTaskDelegate;

	constructor(file: File, delegate: FileUploadFlowTaskDelegate) {
		super();

		let md5Task = new Md5Task(file, this);
		let fileStatusCheckTask = new FileStatusCheckTask(this);
		let fileUploadTask = new FileUploadTask(this);

		this._file = file;
		this.delegate = delegate;

		// 顺序执行
		this.setTasks(md5Task, fileStatusCheckTask, fileUploadTask);
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

	/**************************** Check Status Delete Start  **********************/

	onCheckFinished = (result: FileStatusType) => {
		this._fileCheckResult = result;
	};

	onCheckFailed = (error: Error, task: TaskQueueItem) => {
		if (
			this.delegate &&
			this.delegate.onUploadFailed &&
			is.function(this.delegate.onUploadFailed)
		) {
			this.delegate.onUploadFailed(error, this._file, this);
		}
	};

	/**************************** Check Status Delete  End  **********************/

	/**************************** Upload Delete Start  **********************/

	getCheckMd5 = () => {
		return this._md5;
	};

	getLoadMd5 = () => {
		return this._md5;
	};

	getLoadFile = () => {
		return this._file;
	};

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
}

export default FileUploadFlowTask;
