import * as React from 'react';
import { ESourceType } from 'stsrc/type-define';
import { Progress, Icon, Tooltip } from 'antd';
import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/styles/index.module.scss';
// import { ReactComponent as RealTimeIcon } from './assets/images/real-time.svg';
import { ReactComponent as OfflineVideoIcon } from './assets/images/offline-video.svg';
import { ReactComponent as BatchPicsIcon } from './assets/images/batch-pics.svg';
import StringTool from 'stutils/foundations/string';
import {
	IFAnalysisSourceDetailInfo,
	EAnalysisSourceStatus,
	getAnalysisStatusTip
} from 'stsrc/utils/requests/collection-request';
import {
	IFUploadAndAnalysisProcessInfo,
	EUploadStatus,
	EUploadAndAnalysisStepType
} from 'stsrc/components/file-upload-analysis-panel';

interface PropType {
	uploadInfo: IFUploadAndAnalysisProcessInfo; // 上传任务信息
	onDelete: (item: IFUploadAndAnalysisProcessInfo) => void;
	analysisStatus: EAnalysisSourceStatus | null; //借此状态
	fileType: ESourceType;
	// onChangeUploadStatus: (status: EUploadStatus) => void;
}

interface StateType {
	analysisInfo: IFAnalysisSourceDetailInfo; // 解析任务信息
}

function none() {}

class FileUploadProcessItem extends React.Component<PropType, StateType> {
	static defaultProps = {
		onDelete: none,
		analysisStatus: null,
		fileType: ESourceType.All
	};

	isUploadFinished() {
		return this.props.uploadInfo && this.props.uploadInfo.uploadProcess >= 100;
	}

	/**
	 *删除上传任务
	 * @param {IFUploadInfo}  item item
	 * @return {void}
	 */
	handClickDelete = (item: IFUploadAndAnalysisProcessInfo) => {
		if (this.props.onDelete) {
			this.props.onDelete(item);
		}
	};

	render() {
		const { uploadInfo, fileType } = this.props;

		let errorClass = this.props.uploadInfo.error
			? ModuleStyle['upload-eror']
			: '';

		let tip: React.ReactNode = '';
		if (this.props.uploadInfo.error) {
			tip = this.props.uploadInfo.tip;
		} else {
			if (
				this.props.uploadInfo.stepType ===
				EUploadAndAnalysisStepType.Analysising
			) {
				// 分析阶段
				tip = getAnalysisStatusTip(this.props.uploadInfo.sourceStatus);
			} else if (
				this.props.uploadInfo.stepType === EUploadAndAnalysisStepType.Uploading
			) {
				// 上传阶段
				switch (this.props.uploadInfo.uploadStatus) {
					case EUploadStatus.Waiting:
						tip = intl.get('FILE_UPLOAD_PROCESS_UPLOAD_WATING').d(`等待上传`);
						break;

					case EUploadStatus.Processing:
						tip = (
							<div>
								<span>
									{intl.get('FILE_UPLOAD_PROCESS_UPLOAD_FISHED').d(`已完成`)}
								</span>
								<span className={ModuleStyle['file-source-item-finished']}>
									{uploadInfo.uploadProcess}
								</span>
								<span>%</span>
							</div>
						);
						break;

					case EUploadStatus.Succeed:
						tip = intl
							.get('FILE_UPLOAD_PROCESS_UPLOAD_SUCCESSED')
							.d(`上传成功`);
						break;

					case EUploadStatus.Failed:
						tip = intl.get('FILE_UPLOAD_PROCESS_UPLOAD_FAIL').d(`上传失败`);
						break;
				}
			}
		}

		let iconElment = BatchPicsIcon;
		switch (fileType) {
			case ESourceType.Zip:
				iconElment = BatchPicsIcon;
				break;
			case ESourceType.Video:
				iconElment = OfflineVideoIcon;
				break;
			default:
				iconElment = OfflineVideoIcon;
				break;
		}

		return (
			<div className={ModuleStyle['file-source-item-container']}>
				<div className={ModuleStyle['file-source-item-type']}>
					<Icon
						style={{ width: '40px', height: '40px' }}
						component={iconElment}
					/>
				</div>
				<div className={ModuleStyle['file-source-item-progress']}>
					<div className={ModuleStyle['file-source-item-info']}>
						<span
							title={uploadInfo.name}
							className={ModuleStyle['file-source-item-name']}
						>
							{uploadInfo.name}
						</span>
						<span
							className={ModuleStyle['file-source-item-delete']}
							onClick={this.handClickDelete.bind(this, uploadInfo)}
						>
							<Tooltip
								placement="top"
								title={
									<span>
										{intl.get('FILE_ANALYSIS_PROCESS_UPLOAD_CENCLE').d(`取消`)}
									</span>
								}
							>
								<Icon
									type="close"
									style={{ color: '#F0382B', marginRight: 0 }}
								/>
							</Tooltip>
						</span>
					</div>
					<Progress
						style={{ paddingRight: '16px' }}
						size={'small'}
						showInfo={false}
						percent={uploadInfo.uploadProcess}
					/>
					<div className={ModuleStyle['file-source-item-status']}>
						<span className={ModuleStyle['file-source-item-size']}>
							{StringTool.getFileSizeTip(uploadInfo.size)}{' '}
						</span>
						<div
							className={`${
								ModuleStyle['file-source-item-percent']
							} ${errorClass}`}
						>
							<span>{tip}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default FileUploadProcessItem;
