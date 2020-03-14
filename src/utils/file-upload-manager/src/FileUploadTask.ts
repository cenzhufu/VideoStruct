import { BlobUpdateResult } from 'ifvendors/utils/file-upload';
import {
	IFFileUploadResultInfo,
	FileStatusType
} from 'stutils/requests/file-server-requests/file-request';
// 文件状态检查任务
import FileRequest from 'stsrc/utils/requests/file-server-requests';
import { TaskQueueStepTask, TaskQueueItem } from 'ifvendors/utils/task-queue';
import * as is from 'is';
import { CancelTokenSource } from 'axios';
import IFRequest from 'ifvendors/utils/requests';

export interface FileUploadTaskDelegate {
	getLoadMd5: () => string | null;
	getLoadFile: () => File | null;

	getFileCheckResult: (
		file: File,
		task: TaskQueueItem
	) => FileStatusType | null;

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

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class FileUploadTask extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;
	private _chunkSize: number; // 分片的大小(byte))，默认为10*1024*1024(10m)
	private _currentChunkOrder: number; // 当前分片的顺序，从0开始

	// 执行一些回调的方法
	private _delegate: FileUploadTaskDelegate;

	private _cancelSource?: CancelTokenSource;

	constructor(delegate: FileUploadTaskDelegate) {
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

		this._currentChunkOrder = 0;
		this._chunkSize = 10 * 1024 * 1024;
	}

	/**
	 * 文件上传
	 * @private
	 * @param {string} md5 md5值
	 * @param {File} file 文件
	 * @memberof FileUpload
	 * @returns {Promise<boolean>} 结果
	 */
	async _uploadFile(md5: string, file: File): Promise<any> {
		let result: any;

		// 获取检查的结果
		let statusResult: FileStatusType | null = null;
		if (
			this._delegate &&
			this._delegate.getFileCheckResult &&
			is.function(this._delegate.getFileCheckResult)
		) {
			statusResult = this._delegate.getFileCheckResult(file, this);
		}

		// 重新设置currentChunkOrder
		if (
			statusResult &&
			statusResult.currChunk &&
			is.number(statusResult.currChunk)
		) {
			this._currentChunkOrder = statusResult.currChunk;
		} else {
			this._currentChunkOrder = 0;
		}

		// 每次上传的blob数量
		let blobCountPerBatch = 1;
		do {
			// let blobs: Array<Blob> = [];
			// 添加blob数组

			let start = this._currentChunkOrder * this._chunkSize;
			let end = Math.min(start + this._chunkSize, file.size);
			let fileSlice = file.slice(start, end, file.type);

			this._cancelSource = IFRequest.getCancelSource();
			console.log(`传输第${this._currentChunkOrder}块开始`, file.name);

			let result: IFFileUploadResultInfo = await FileRequest.fileSplitChunkUpload(
				fileSlice,
				md5,
				file.size,
				Math.ceil(file.size / this._chunkSize),
				this._currentChunkOrder,
				file,
				{
					cancelToken: this._cancelSource.token,
					onUploadProgress: (progressEvent: ProgressEvent) => {
						if (
							this._delegate &&
							is.function(this._delegate.onUploadProgress)
						) {
							this._delegate.onUploadProgress(
								progressEvent,
								this._currentChunkOrder * this._chunkSize,
								file,
								this
							);
						}
					}
				}
			);
			// 如果出错了，while还会循环么？答：不会
			console.log(`传输第${this._currentChunkOrder}块完成`, file.name, result);

			// 重置source
			if (this._cancelSource) {
				this._cancelSource.cancel();
				this._cancelSource = undefined;
			}

			let checkResult = BlobUpdateResult.Continue;
			// 提供给外界诶判断结构

			// @ts-ignore
			checkResult = this._checkResult(result);

			if (checkResult === BlobUpdateResult.AllFinished) {
				return result;
			} else if (checkResult === BlobUpdateResult.Failed) {
				return Promise.reject(new Error('upload error'));
			}

			this._currentChunkOrder += blobCountPerBatch;
		} while (this._currentChunkOrder * this._chunkSize < file.size);

		// @ts-ignore
		return result;
	}

	_checkResult(result: IFFileUploadResultInfo): BlobUpdateResult {
		// 考虑到请求的结构因后台实现的不同而不同，这儿设置其type为any
		if (result && result['fileUrl']) {
			return BlobUpdateResult.AllFinished;
		}

		return BlobUpdateResult.Continue;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;

		// 获取参数md5
		let md5: string | null = '';
		if (this._delegate && is.function(this._delegate.getLoadMd5)) {
			md5 = this._delegate.getLoadMd5();
		}

		let file: File | null = null;
		if (this._delegate && is.function(this._delegate.getLoadFile)) {
			file = this._delegate.getLoadFile();
		}

		if (md5 && is.string(md5) && file && file instanceof File) {
			try {
				let result: IFFileUploadResultInfo = await this._uploadFile(md5, file);
				this._isActive = false;
				this._isError = false;
				this._isFinished = true;
				// 传递给外边
				if (this._delegate && this._delegate.onUploadFinished) {
					this._delegate.onUploadFinished(result, file, this);
				}
			} catch (error) {
				this._isActive = false;
				this._isError = true;
				this._isFinished = true;

				// 传递给外边
				if (this._delegate && this._delegate.onUploadFailed) {
					this._delegate.onUploadFailed(error, file, this);
				}
			}
		} else {
			this._isActive = false;
			this._isError = true;
			this._isFinished = true;

			let error = new Error('错误的参数(upload)');

			// 传递给外边
			if (this._delegate && this._delegate.onUploadFailed) {
				this._delegate.onUploadFailed(error, file, this);
			}
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

export default FileUploadTask;
