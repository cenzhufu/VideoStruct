import * as React from 'react';
import {
	IFAnalysisSourceDetailInfo,
	EAnalysisSourceStatus
} from 'stsrc/utils/requests/collection-request';
import { CameraBlueSpecialIconComponent } from 'stcomponents/icons/camera-icon';
import { VideoCameraSpecialGreenIconComponent } from 'stcomponents/icons/video-camera-icon';
import { ZipRedIconSpecialComponent } from 'stcomponents/icons/zip-icon';
import ModuleStyle from './index.module.scss';
import { Checkbox } from 'antd';
import { ESourceType } from 'sttypedefine';
import * as intl from 'react-intl-universal';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	anylysisSourceInfo: IFAnalysisSourceDetailInfo;
	isSelected: boolean;
	className: string;
	selectSource: (sourceInfo: IFAnalysisSourceDetailInfo) => void;
	unselectSource: (sourceInfo: IFAnalysisSourceDetailInfo) => void;

	disabled: boolean;
};

type StateType = {};

function noop() {}
class AnaylysisResultDetailListitem extends STComponent<PropsType, StateType> {
	// 默认参数
	static defaultProps = {
		className: '',
		isSelected: false,
		disabled: false,
		selectSource: noop,
		unselectSource: noop
	};

	onChange = (e: CheckboxChangeEvent) => {
		if (e.target.checked) {
			this.props.selectSource(this.props.anylysisSourceInfo);
		} else {
			this.props.unselectSource(this.props.anylysisSourceInfo);
		}
	};

	render() {
		let SourceIcon: React.ComponentClass | null = null;
		let className = '';
		if (this.props.anylysisSourceInfo.sourceType === ESourceType.Camera) {
			SourceIcon = CameraBlueSpecialIconComponent;
		} else if (this.props.anylysisSourceInfo.sourceType === ESourceType.Video) {
			SourceIcon = VideoCameraSpecialGreenIconComponent;
		} else if (this.props.anylysisSourceInfo.sourceType === ESourceType.Zip) {
			SourceIcon = ZipRedIconSpecialComponent;
		}

		switch (this.props.anylysisSourceInfo.status) {
			case EAnalysisSourceStatus.Analysising:
				className = ModuleStyle['processing-status'];
				break;

			case EAnalysisSourceStatus.Finished:
				className = ModuleStyle['finished-status'];
				break;

			case EAnalysisSourceStatus.RealTimeAnalysis:
				className = ModuleStyle['real-time-status'];
				break;

			default:
				break;
		}
		return (
			<li className={`${ModuleStyle['source-detail-item']}`}>
				<Checkbox
					className={ModuleStyle['check-box']}
					checked={this.props.isSelected}
					onChange={this.onChange}
					disabled={this.props.disabled}
				/>
				{SourceIcon && (
					// @ts-ignore
					<SourceIcon className={ModuleStyle['icon']} />
				)}
				<div className={ModuleStyle['info--container']}>
					<div
						className={ModuleStyle['souce-name']}
						title={this.props.anylysisSourceInfo.sourceName}
					>
						{this.props.anylysisSourceInfo.sourceName}
					</div>
					<div className={ModuleStyle['status']}>
						<div className={ModuleStyle['status-label']}>
							{intl.get('status====').d('状态')}
							&nbsp;:&nbsp;
						</div>
						<div
							className={`${className} ${ModuleStyle['status-tip']}`}
							title={this.props.anylysisSourceInfo.statusTip}
						>
							{this.props.anylysisSourceInfo.statusTip}
						</div>
					</div>
				</div>
			</li>
		);
	}
}

export default AnaylysisResultDetailListitem;
