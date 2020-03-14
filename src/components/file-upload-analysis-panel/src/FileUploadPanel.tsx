import * as React from 'react';

import ModuleStyle from './assets/styles/index.module.scss';
import * as intl from 'react-intl-universal';
import Config from 'stsrc/utils/config';
import { Icon, Button, message } from 'antd';
import FileSelect from 'ifvendors/utils/file-select';
import FileUploadManager from 'stsrc/utils/file-upload-manager/src/FileUploadAnalysisWorkFlowManager';
import FileUploadProcessItemContainer from 'stsrc/components/file-upload-process-item';
import { connect } from 'react-redux';
import FileUploadActionCreators from '../redux/actions/file-upload-analysis.actions';
import {
	IFUploadAndAnalysisProcessInfo,
	EUploadStatus,
	EUploadAndAnalysisStepType
} from '../redux/reduces/type';
import {
	isAnalysisSourceFinished,
	CollectionAnalysisSourceRequest
} from 'stsrc/utils/requests/collection-request';
import SelectedFilesConfirmDialog from 'stsrc/components/selected-file-confirm-dialog';
import { ETargetType } from 'stsrc/type-define';

interface PropType {
	uploadList: Array<IFUploadAndAnalysisProcessInfo>;
}

interface StateType {}

class FileUploadPanel extends React.Component<PropType, StateType> {
	static defaultProps = {
		uploadList: []
	};

	static ownName(): string {
		return 'file-upload-panel';
	}

	onAccessResource = () => {
		let self = this;
		FileSelect.showFileSelectDialog(
			{
				multiple: true,
				accept: [
					Config.getSupportedRarFormat(),
					Config.getSupportedVideoFormat()
				].join(','),
				applyValidateFilter: true
			},
			(files: Array<File>, unvalidFiles: Array<File>) => {
				let handle = SelectedFilesConfirmDialog.show({
					files: files,
					unvalidFiles: unvalidFiles,
					onDeleteFile: (file: File) => {
						// 删除文件
						for (let i = 0; i < files.length; i++) {
							if (file === files[i]) {
								files.splice(i, 1);
								handle.update({
									files: files
								});
								return;
							}
						}

						for (let i = 0; i < unvalidFiles.length; i++) {
							if (file === unvalidFiles[i]) {
								unvalidFiles.splice(i, 1);
								handle.update({
									unvalidFiles: unvalidFiles
								});
								return;
							}
						}
					},
					onCancel: () => {
						handle.destory();
					},
					onOk: (
						resultFiles: File[],
						resultUnvalidFiles: File[],
						targetTypes: ETargetType[]
					) => {
						// 大于20个文件
						if (resultFiles.length + resultUnvalidFiles.length > 20) {
							message.error(
								intl
									.get('FILE_UPLOAD_COUNT_MAX_COUNT', { count: 20 })
									.d('文件数量不能超过20个，请重新选择文件')
							);
							return;
						}
						let validFiles: Array<File> = [...resultFiles];
						let unvalidFileInfos: IFUploadAndAnalysisProcessInfo[] = resultUnvalidFiles.map(
							(file: File) => {
								return FileUploadManager.getInstance().generateUnvalidFildInfo(
									file,
									intl.get('FILE_UPLOAD_UNVALID_TYPE_FILE').d('文件类型无效')
								);
							}
						);
						for (let i = validFiles.length - 1; i >= 0; i--) {
							let tip = self.isValidateFile(validFiles[i], i); //
							if (tip) {
								unvalidFileInfos.push(
									FileUploadManager.getInstance().generateUnvalidFildInfo(
										validFiles[i],
										tip
									)
								);
								validFiles.splice(i, 1);
							}
						}
						handle.destory();

						// 获得正确的文件;
						FileUploadManager.getInstance().addUploadTasks(
							validFiles,
							targetTypes
						);
						FileUploadManager.getInstance().addUnvalidFileInfos(
							unvalidFileInfos
						); // 文件格式不一致
					}
				});
			}
		);
	};

	isValidateFile(file: File, order: number): string {
		// 文件大小
		let fileSizeTip = this._isValidateFileSize(file, order);
		if (fileSizeTip) {
			return fileSizeTip;
		}

		let fileNameTip = this._isValidateFileName(file, order);
		if (fileNameTip) {
			return fileNameTip;
		}

		// 是否是重复的文件
		if (FileUploadManager.getInstance().hasSameFile(file)) {
			return intl.get('FILE_UPLOAD_REPEAT_FILE').d('重复的文件');
		}

		return '';
	}

	_isValidateFileSize(file: File, order: number): string {
		if (file.size / (1024 * 1024 * 1024) > 5) {
			return intl
				.get('FILE_UPLOAD_FILE_NO_BIG_THAN', { size: '5G' })
				.d('文件大小应小于5G');
		} else {
			return '';
		}
	}

	_isValidateFileName(file: File, order: number): string {
		if (file.name.length > 100) {
			return intl
				.get('FILE_UPLOAD_FILE_NAME_NO_MORE_THAN', { count: 100 })
				.d('文件名长度应小于100个字符');
		} else {
			return '';
		}
	}

	_isValidateFileOrder(file: File, order: number): string {
		if (order > 20) {
			return intl
				.get('ANALYSIS_FILE_COUNT_MAX_COUNT', { count: 20 })
				.d('最多选择20个文件');
		} else {
			return '';
		}
	}

	onFinishAnalysisTask = (item: IFUploadAndAnalysisProcessInfo) => {
		if (item.id) {
			// 创建了解析任务
			FileUploadManager.getInstance().finishedAnalysisTask(item);
		}
	};

	onDelete = (item: IFUploadAndAnalysisProcessInfo) => {
		// TODO: 删除
		if (item.stepType === EUploadAndAnalysisStepType.Analysising) {
			if (!isAnalysisSourceFinished(item.sourceStatus)) {
				CollectionAnalysisSourceRequest.deleteAnalysisSource(item.id)
					.then(() => {
						console.log('删除数据源成功');
						// 删除upload info 列表
						FileUploadManager.getInstance().removeUploadTask(item.taskId, true);
						// 发送删除事件
						FileUploadManager.getInstance().emitDeleteEvent(item);
					})
					.catch((error: Error) => {
						message.error('删除数据源失敗');
						console.error(error);
					});
			} else {
				// 删除upload info 列表
				FileUploadManager.getInstance().removeUploadTask(item.taskId, true);
			}
		} else {
			if (item.uploadStatus !== EUploadStatus.Unvalid) {
				// 删除文件上传
				FileUploadManager.getInstance().removeUploadTask(item.taskId, true);
			} else {
				// 删除无效文件
				FileUploadManager.getInstance().removeFileInfo(item.taskId, true);
			}
		}
	};

	render() {
		return (
			<div className={ModuleStyle['file-upload-panel']}>
				<div className={ModuleStyle['file-source-container']}>
					<div className={ModuleStyle['file-source-title']}>
						{intl.get('FILE_UPLOAD_PANEL_ACCESS_SOURCE').d('资源接入')}
					</div>
					<div className={ModuleStyle['file-source-type']}>
						{`${intl
							.get('FILE_UPLOAD_PANEL_SUPPORTED_FILE_FORMAT')
							.d('文件格式：mp4、zip(仅含jpg/jpeg/png/bmp图片)')}`}
					</div>
				</div>

				<div className={ModuleStyle['file-source-action']}>
					<div className={ModuleStyle['file-source-upload']}>
						<Button
							className={ModuleStyle['file-btn']}
							type="primary"
							onClick={this.onAccessResource}
						>
							<Icon type="upload" />
							{intl.get('FILE_UPLOAD_PANEL_UPLOAD_FILE').d('上传文件')}
						</Button>
					</div>
				</div>

				<div className={ModuleStyle['file-source-list']}>
					{this.props.uploadList.map((item: IFUploadAndAnalysisProcessInfo) => {
						return (
							<FileUploadProcessItemContainer
								onDelete={this.onDelete}
								key={item.taskId}
								uploadInfo={item}
								onFinishAnalysisTask={this.onFinishAnalysisTask}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}

// 导出一个厉害的组件
function mapStateToProps(state) {
	return {
		uploadList:
			state[FileUploadActionCreators.reducerName.toString()].totalUploadTasks
	};
}
let FileUploadPanelContainer = connect(mapStateToProps)(FileUploadPanel);
export default FileUploadPanelContainer;
