import * as React from 'react';
import {
	// EUploadStatus,
	ESourceType
	// ETargetType
} from 'stsrc/type-define';
import FileUploadProcessItem from './FileUploadProcessItem';
import { EAnalysisSourceStatus } from 'stsrc/utils/requests/collection-request';

import { IFUploadAndAnalysisProcessInfo } from 'stsrc/components/file-upload-analysis-panel';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
// import { message } from 'antd';

interface PropType {
	uploadInfo: IFUploadAndAnalysisProcessInfo;
	onDelete: (item: IFUploadAndAnalysisProcessInfo) => void;
	onFinishAnalysisTask: (item: IFUploadAndAnalysisProcessInfo) => void;
}

interface StateType {
	isCreateAnalysisTask: boolean;
}

function none() {}

export enum FileSourceType {
	ZipFile = '.zip',
	videoFile = '.mp4',
	UnknownFile = 'unKnown'
}

class FileUploadProcessItemContainer extends React.Component<
	PropType,
	StateType
> {
	static defaultProps = {
		onDelete: none,
		onFinishAnalysisTask: none
	};
	_timeHandler: number | null; // 定时器handel
	constructor(props: PropType) {
		super(props);

		this.state = {
			isCreateAnalysisTask: false
		};
		this._timeHandler = null;
	}

	componentDidMount() {
		eventEmiiter.emit(EventType.activeAnalysisInfoTask, this.props.uploadInfo);
	}

	componentWillUnmount() {
		eventEmiiter.emit(
			EventType.disactiveAnalysisInfoTask,
			this.props.uploadInfo
		);
		this.cleanTimer();
	}

	cleanTimer() {
		if (this._timeHandler) {
			window.clearTimeout(this._timeHandler);
			this._timeHandler = null;
		}
	}

	_needRefresh(status: EAnalysisSourceStatus) {
		return status && status !== EAnalysisSourceStatus.Finished;
	}
	/**
	 * 获取文件类型
	 * @param {IFUploadInfo} item item
	 * @returns {ESourceType} type
	 */
	_getFileType = (item: IFUploadAndAnalysisProcessInfo) => {
		let type: ESourceType = ESourceType.All;
		const name = item.name;
		const extName = name.substring(name.lastIndexOf('.')).toLowerCase();
		switch (extName) {
			case FileSourceType.ZipFile:
				type = ESourceType.Zip;
				break;
			case FileSourceType.videoFile:
				type = ESourceType.Video;
				break;
			default:
				type = ESourceType.Unknown;
				break;
		}
		return type;
	};

	render() {
		const { uploadInfo, onDelete } = this.props;

		return (
			<FileUploadProcessItem
				onDelete={onDelete}
				uploadInfo={uploadInfo}
				fileType={this._getFileType(uploadInfo)}
			/>
		);
	}
}

export default FileUploadProcessItemContainer;
