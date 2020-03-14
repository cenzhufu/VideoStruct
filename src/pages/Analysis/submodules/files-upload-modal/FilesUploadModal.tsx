import * as React from 'react';
import ModuleStyle from './index.module.scss';
import * as intl from 'react-intl-universal';
import * as ReactDOM from 'react-dom';
import { Modal, Progress, Button } from 'antd';
import TaskQueue from 'ifutils/task-queue';
import FileUpload, { BlobUpdateResult } from 'ifvendors/utils/file-upload';
import FileRequest, {
	IFFileUploadResultInfo
} from 'stutils/requests/file-server-requests';
import { CommonResponseDataType } from 'stsrc/type-define';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import STComponent from 'stcomponents/st-component';
type PropsType = {
	uploadFiles: Array<File>;
	onCancel: () => void;
	onError: (error: Error) => void;
	uploadSuccess: (fileInfo: IFFileUploadResultInfo) => void; // 单个文件上传成功的回调
};

type StateType = {
	process: number; // 进度
};

function noop() {}
class FilesUploadModal extends STComponent<PropsType, StateType> {
	static defaultProps = {
		uploadFiles: [],
		onCancel: noop,
		onError: noop,
		uploadSuccess: noop
	};

	_unmounted: boolean;

	private _taskQueue?: TaskQueue; // 任务队列
	private loadTaskProcess: {
		// 文件名 -> 加载的进度
		[fileName: string]: { md5Percent: number; uploadingPercent: number }; // [0, 100]
	};
	private startTime: number; // ms 开始时间

	constructor(props: PropsType) {
		super(props);
		// one by one
		this._taskQueue = new TaskQueue({
			maxParalleledCount: 1
		});

		this.state = {
			process: 0
		};

		this.loadTaskProcess = {};
		for (let file of this.props.uploadFiles) {
			// 在计算出md5之前，给file附加一个guid

			let guid = this._getFileUniqueId(file);
			// @ts-ignore
			this.loadTaskProcess[`${guid}`] = {
				md5Percent: 0,
				uploadingPercent: 0
			};
		}

		this._unmounted = false;
	}

	static show(props: PropsType) {
		let container = document.createElement('div');
		document.body.appendChild(container);
		let element = <FilesUploadModal {...props} />;

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	componentDidMount() {
		// 执行任务
		this.startTime = new Date().getTime();
		if (this._taskQueue) {
			let self = this;
			for (let file of this.props.uploadFiles) {
				// 添加任务
				this._taskQueue.addItem(
					new FileUpload({
						file: file,
						md5Process: function(loaded: number, total: number) {
							// 计算进度
							let fileKey = self._getFileUniqueId(file);
							// 更新
							self._updateMd5Process(loaded, total, fileKey);
							let process = self._calculateProcess();

							if (!self._unmounted) {
								self.setState({
									process: process
								});
							}
						},
						md5Finished: function md5Finished(loaded: number, total: number) {
							// 计算进度
							let fileKey = self._getFileUniqueId(file);
							// 更新
							self._updateMd5Process(loaded, total, fileKey);
							let process = self._calculateProcess();
							if (!self._unmounted) {
								self.setState({
									process: process
								});
							}
						},
						getFileStatusCheckRequestConfig: function getFileStatusCheckRequestConfig(
							md5: string
						) {
							return FileRequest.getFileStatusCheckRequestConfig(md5);
						},
						getFileSliceUploadRequestConfig: function getFileSliceUploadRequestConfig(
							sliceFile: Blob,
							currentChunk: number,
							chunkSize: number,
							fileSize: number,
							md5: string,
							file: File
						) {
							let config = FileRequest.getFileSliceUploadRequestConfig(
								sliceFile,
								currentChunk,
								chunkSize,
								fileSize,
								md5,
								file
							);
							// 附加进度
							let progressConfig = {
								onUploadProgress: function(progressEvent: ProgressEvent) {
									let loaded = progressEvent.loaded;
									// 计算进度
									let fileKey = self._getFileUniqueId(file);
									// 更新
									self._updateUploadProcess(
										currentChunk * chunkSize + loaded,
										fileSize,
										fileKey
									);
									let process = self._calculateProcess();

									if (!self._unmounted) {
										self.setState({
											process: process
										});
									}
								}
							};

							return { ...config, ...progressConfig };
						},
						checkFileSliceRequestResult: function checkFileSliceRequestResult(
							result: any
						) {
							// 考虑到请求的结构因后台实现的不同而不同，这儿设置其type为any
							if (result && result['fileUrl']) {
								// 表明传完了，更新进度
								let fileKey = self._getFileUniqueId(file);
								self._updateUploadProcess(1, 1, fileKey);
								let process = self._calculateProcess();

								if (!self._unmounted) {
									self.setState({
										process: process
									});
								}

								return BlobUpdateResult.AllFinished;
							}

							return BlobUpdateResult.Continue;
						},
						fileUploadFinished: function fileUploadFinished(
							result: CommonResponseDataType<IFFileUploadResultInfo>
						) {
							// @ts-ignore
							let fileInfo: IFFileUploadResultInfo = ValidateTool.getValidObject(
								result['data'],
								{}
							);
							// 文件上传成功
							self.props.uploadSuccess(fileInfo);
						},
						uploadError: function uploadError(error: Error) {
							self.cleanup();
							// 传给外界
							self.props.onError(error);
						}
					})
				);
			}
		}
	}

	componentWillUnmount() {
		this._unmounted = true;
		this.cleanup();
	}

	cleanup() {
		if (this._taskQueue) {
			this._taskQueue.cleanup(); // 取消任务管理器
		}
		this._taskQueue = undefined;
	}

	onCancel = () => {
		// 取消所有任务
		this.cleanup();

		this.props.onCancel();
	};

	render() {
		// 计算时间
		let now = new Date().getTime();
		// 过去的时间
		let past = now - this.startTime;
		// 当前的进度
		let percent = this.state.process;
		// 剩余时间
		let remain = '0';
		if (percent < 100) {
			let time = ((100 - percent) * past) / (percent * 1000); // s
			if (time < 60) {
				remain = time.toFixed(0) + intl.get('FILE_UPLOAD_MODAL_SECOND').d('秒');
			} else {
				remain =
					Number.parseInt(String(time / 60), 10).toFixed(0) +
					intl.get('FILE_UPLOAD_MODAL_MINUTES').d('分钟');
			}
		} else {
			remain = '0s';
		}

		return (
			<Modal visible={true} footer={null} closable={false} width={'26.7%'}>
				<div>{intl.get('FILE_UPLOAD_MODAL_LOADING').d('正在接入')}</div>
				<div className={ModuleStyle['progress-container']}>
					<Progress percent={this.state.process} />
					<div>{`${intl
						.get('FILE_UPLOAD_MODAL_PROCESSING')
						.d('正在导入资源')}，${intl
						.get('FILE_UPLOAD_MODAL_REMAIN_TIME')
						.d('大约剩余')}${remain}`}</div>
				</div>
				<div className={ModuleStyle['button-group']}>
					<Button
						className={ModuleStyle['cancel-button']}
						onClick={this.onCancel}
					>
						{intl.get('FILE_UPLOAD_MODAL_REMAIN_CANCEL').d('取消')}
					</Button>
				</div>
			</Modal>
		);
	}

	/**
	 * 计算上传进度
	 * @private
	 * @param {string} filekey 附加的文件guid
	 * @returns {number} 进度
	 * @memberof FilesUploadModal
	 */
	private _calculateProcess() {
		// 返回默认现有的进度
		let keys = Object.keys(this.loadTaskProcess);
		let md5Percent = 0;
		let uploadPercent = 0;
		for (let key of keys) {
			let config = this.loadTaskProcess[key];
			md5Percent += config['md5Percent'] || 0;
			uploadPercent += config['uploadingPercent'] || 0;
		}
		// 文件数量
		let fileCount = this.props.uploadFiles.length;
		// console.log(
		// 	'------ddddd--- 进度',
		// 	Number.parseFloat(
		// 		this._getDemandStr(
		// 			String((100 * (md5Percent + uploadPercent)) / (200 * fileCount))
		// 		)
		// 	)
		// );
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
		console.log('更新上传进度', loaded, filekey);
		let processConfig = this.loadTaskProcess[filekey];
		if (processConfig) {
			let precent = Number.parseFloat(
				this._getDemandStr(String((100 * loaded) / total))
			);
			processConfig['md5Percent'] = precent;
		}
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
}

export default FilesUploadModal;
