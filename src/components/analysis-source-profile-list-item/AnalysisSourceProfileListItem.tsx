import * as React from 'react';
import ModuleStyle from './index.module.scss';
import {
	IFAnalysisSourceDetailInfo,
	TaskUserType,
	EAnalysisSourceStatus
} from 'stutils/requests/collection-request';
import { StructuralItem } from 'stcomponents/structural-item';
import { Checkbox, Tabs } from 'antd';
import {
	ZipRedIconComponent,
	CameraBlueIconComponent,
	VideoCameraGreenIconComponent,
	MoreIconComponent
} from 'stcomponents/icons';

import * as intl from 'react-intl-universal';
import { ESourceType, IFStructuralInfo, ETargetType } from 'stsrc/type-define';

import SourceVideoPlayer from './submodules/source-video-player';
import AnalysisTaskResultMultiThumbnail from 'stcomponents/analysis-task-result-multi-thumbnail';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { TabsProps } from 'antd/lib/tabs';
import { ImageDisplayMode } from 'ifvendors/image-view';
import STComponent from 'stcomponents/st-component';

const TabPane = Tabs.TabPane;

type PropsType = {
	className: string;
	style: Object;
	analysisSourceInfo: IFAnalysisSourceDetailInfo;
	resultInfos: Array<IFStructuralInfo>;
	selected: boolean;
	onSelected: (analysisSourceInfo: IFAnalysisSourceDetailInfo) => void;
	onUnselected: (analysisSourceInfo: IFAnalysisSourceDetailInfo) => void;
	onShowMore: (analysisSourceInfo: IFAnalysisSourceDetailInfo) => void;
	onClickItem: (
		structuralItemInfo: IFStructuralInfo,
		analysisSourceInfo: IFAnalysisSourceDetailInfo,
		index: number,
		infoList: Array<IFStructuralInfo>
	) => void;

	stream: string; // 视频流地址
	onStartPlay: () => void; // 准备播放，外边可以去获取数据源了

	onDragStart: (structuralItemInfo: IFStructuralInfo) => void;
	onDragEnd: () => void;

	faceCount: number;
	bodyCount: number;

	onChangeTaskType: (taskType: ETargetType) => void;

	targetType: ETargetType;
};

function noop() {}
class AnalysisSourceProfileListItem extends STComponent<PropsType> {
	static defaultProps = {
		className: '',
		style: {},
		selected: false,
		resultInfos: [],
		onSelected: noop,
		onUnselected: noop,
		onShowMore: noop,
		onClickItem: noop,
		onDragStart: noop,
		onDragEnd: noop,
		onChangeTaskType: noop,
		onStartPlay: noop,

		stream: '',

		faceCount: -1,
		bodyCount: -1,

		targetType: ETargetType.All
	};

	onChange = (event: CheckboxChangeEvent) => {
		if (event.target.checked) {
			this.props.onSelected(this.props.analysisSourceInfo);
		} else {
			this.props.onUnselected(this.props.analysisSourceInfo);
		}
	};

	onClickMore = () => {
		this.props.onShowMore(this.props.analysisSourceInfo);
	};

	onClick = (
		structuralItemInfo: IFStructuralInfo,
		index: number,
		list: Array<IFStructuralInfo>
	) => {
		this.props.onClickItem(
			structuralItemInfo,
			this.props.analysisSourceInfo,
			index,
			list
		);
	};

	onDragStart = (structuralItemInfo: IFStructuralInfo) => {
		this.props.onDragStart(structuralItemInfo);
	};

	onDragEnd = () => {
		this.props.onDragEnd();
	};

	onStartPlay = () => {
		this.props.onStartPlay();
	};

	onChangeTaskType = (activeKey: string) => {
		// @ts-ignore
		this.props.onChangeTaskType(activeKey);
	};

	renderTargetTab = (props: TabsProps, DefaultTabBar: React.ReactNode) => {
		return (
			// @ts-ignore
			<DefaultTabBar {...props} className={ModuleStyle['target-tab-pane']} />
		);
	};

	render() {
		let IconTag = null;
		let ContentMetaElement = null;

		if (this.props.analysisSourceInfo.sourceType === ESourceType.Camera) {
			IconTag = CameraBlueIconComponent;
			ContentMetaElement = this.props.stream ? (
				<SourceVideoPlayer
					sourceType={this.props.analysisSourceInfo.sourceType}
					url={this.props.stream}
					className={`${ModuleStyle['content-meta-info']}`}
				/>
			) : (
				<div
					className={`${ModuleStyle['content-meta-info']} video-js`}
					onClick={this.onStartPlay}
				>
					<button
						className="vjs-big-play-button"
						type="button"
						title="Play Video"
						aria-disabled="false"
					>
						<span aria-hidden="true" className="vjs-icon-placeholder" />
						<span className="vjs-control-text" aria-live="polite">
							Play Video
						</span>
					</button>
				</div>
			);
		} else if (this.props.analysisSourceInfo.sourceType === ESourceType.Zip) {
			IconTag = ZipRedIconComponent;
			ContentMetaElement = (
				<AnalysisTaskResultMultiThumbnail
					className={`${ModuleStyle['content-meta-info']}`}
				/>
			);
		} else if (this.props.analysisSourceInfo.sourceType === ESourceType.Video) {
			IconTag = VideoCameraGreenIconComponent;
			ContentMetaElement = (
				<SourceVideoPlayer
					sourceType={this.props.analysisSourceInfo.sourceType}
					url={this.props.analysisSourceInfo.sourceUrl}
					className={`${ModuleStyle['content-meta-info']}`}
				/>
			);
		}

		// status
		let statusClass = '';
		switch (this.props.analysisSourceInfo.status) {
			case EAnalysisSourceStatus.Analysising:
			case EAnalysisSourceStatus.Waiting:
				statusClass = ModuleStyle['status__processing'];
				break;

			case EAnalysisSourceStatus.Finished:
				statusClass = ModuleStyle['status__finished'];
				break;

			case EAnalysisSourceStatus.RealTimeAnalysis:
				statusClass = ModuleStyle['status__real-time'];
				break;
		}

		let totalCountTip = '---';
		let faceCountTip = '---';
		let bodyCountTip = '---';

		if (this.props.faceCount !== -1 && this.props.bodyCount !== -1) {
			totalCountTip = `(${this.props.faceCount +
				this.props.bodyCount}${intl.get('COMMON_COUNT').d('张')})
			`;
		}

		if (this.props.faceCount !== -1) {
			faceCountTip = `(${this.props.faceCount}${intl
				.get('COMMON_COUNT')
				.d('张')})`;
		}

		if (this.props.bodyCount !== -1) {
			bodyCountTip = `(${this.props.bodyCount}${intl
				.get('COMMON_COUNT')
				.d('张')})`;
		}

		// 实时则不显示
		if (this.props.analysisSourceInfo.sourceType === ESourceType.Camera) {
			totalCountTip = '';
			faceCountTip = '';
			bodyCountTip = '';
		}

		let filterList: Array<IFStructuralInfo> = this.props.resultInfos.filter(
			(item: IFStructuralInfo, index: number) => {
				return index < 17;
			}
		);

		return (
			<div
				className={`${ModuleStyle['analysis-source-profile-item']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				<div className={ModuleStyle['header']}>
					<div className={ModuleStyle['tip-info-panel']}>
						{this.props.selected && (
							<Checkbox
								className={ModuleStyle['tip-info-panel--item']}
								onChange={this.onChange}
							/>
						)}
						<div
							className={`${ModuleStyle['tip-info-panel--item']}
							}`}
						>
							{// @ts-ignore
							IconTag && (
								<IconTag
									className={ModuleStyle['tip-info-panel--item--icon']}
								/>
							)}
							<div
								className={
									ModuleStyle['top-info-panel--item--value__important']
								}
								title={this.props.analysisSourceInfo.sourceName}
							>
								{this.props.analysisSourceInfo.sourceName}
							</div>
						</div>
						<div
							className={`${ModuleStyle['tip-info-panel--item']} ${
								ModuleStyle['status']
							}`}
						>
							<div className={`${ModuleStyle['tip-info-panel--item--tip']}`}>
								{intl.get('ANALYSIS_INFO_STATUS').d('状态') + ' : '}
							</div>
							<div
								className={`${
									ModuleStyle['tip-info-panel--item--value']
								} ${statusClass}`}
							>
								{this.props.analysisSourceInfo.statusTip}
							</div>
						</div>
						<div className={`${ModuleStyle['tip-info-panel--item']}`}>
							<div className={`${ModuleStyle['tip-info-panel--item--tip']}`}>
								{intl.get('ANALYSIS_INFO_SIZE').d('大小') + ' : '}
							</div>
							<div
								className={`${ModuleStyle['tip-info-panel--item--value']} ${
									ModuleStyle['size']
								}`}
								title={this.props.analysisSourceInfo.sourceSizeTip}
							>
								{this.props.analysisSourceInfo.sourceSizeTip}
							</div>
						</div>
						<div className={`${ModuleStyle['tip-info-panel--item']}`}>
							<div className={`${ModuleStyle['tip-info-panel--item--tip']}`}>
								{intl.get('ANALYSIS_INFO_UPLOADER').d('上传人') + ' : '}
							</div>
							<div
								className={`${ModuleStyle['tip-info-panel--item--value']}  ${
									ModuleStyle['uploader']
								}`}
								title={this.getUserNames()}
							>
								{this.getUserNames()}
							</div>
						</div>
						<div className={`${ModuleStyle['tip-info-panel--item']}`}>
							<div className={`${ModuleStyle['tip-info-panel--item--tip']}`}>
								{intl.get('ANALYSIS_INFO_ORGANATION').d('单位') + ' : '}
							</div>
							<div
								className={`${ModuleStyle['tip-info-panel--item--value']}  ${
									ModuleStyle['orgination']
								}`}
								title={this.getUserOrganizationNames()}
							>
								{this.getUserOrganizationNames()}
							</div>
						</div>
						<div className={ModuleStyle['tip-info-panel--item']}>
							<div className={`${ModuleStyle['tip-info-panel--item--tip']}`}>
								{intl.get('ANALYSIS_UPLOAD_TIME').d('上传时间') + ' : '}
							</div>
							<div
								className={`${ModuleStyle['tip-info-panel--item--value']} ${
									ModuleStyle['date']
								}`}
							>
								{this.props.analysisSourceInfo.createTimeTip}
							</div>
						</div>
					</div>

					<Tabs
						activeKey={this.props.targetType}
						className={ModuleStyle['type-filter-panel']}
						onChange={this.onChangeTaskType}
						renderTabBar={this.renderTargetTab}
					>
						<TabPane
							tab={
								<div
									className={ModuleStyle['target-type']}
									title={totalCountTip}
								>
									{
										<span>
											{intl.get('ANALYSIS_INFO_TARGET_ALL').d('全部')}
										</span>
									}
									&nbsp;
									{<span>{`${totalCountTip}`}</span>}
								</div>
							}
							key={ETargetType.All}
						/>
						<TabPane
							tab={
								<div
									className={ModuleStyle['target-type']}
									title={faceCountTip}
								>
									{
										<span>
											{intl.get('ANALYSIS_INFO_TARGET_FACE').d('人脸')}
										</span>
									}
									&nbsp;
									{<span>{`${faceCountTip}`}</span>}
								</div>
							}
							key={ETargetType.Face}
						/>
						<TabPane
							tab={
								<div
									className={ModuleStyle['target-type']}
									title={bodyCountTip}
								>
									{
										<span>
											{intl.get('ANALYSIS_INFO_TARGET_BODY').d('人体')}
										</span>
									}
									&nbsp;
									{<span>{`${bodyCountTip}`}</span>}
								</div>
							}
							key={ETargetType.Body}
						/>
						<TabPane
							tab={
								<div className={ModuleStyle['target-type-disable']}>
									{
										<span>
											{intl.get('ANALYSIS_INFO_TARGET_CAR').d('车辆')}
										</span>
									}
									&nbsp;
								</div>
							}
							disabled
							key={ETargetType.Vehicle}
						/>
					</Tabs>
				</div>

				<div className={ModuleStyle['content']}>
					{ContentMetaElement}
					<div className={ModuleStyle['result-list']}>
						{filterList.map((item: IFStructuralInfo, index: number) => {
							let className = `${ModuleStyle['structural-item']} ${
								item.targetType === ETargetType.Face
									? ModuleStyle['face']
									: ModuleStyle['body']
							}`;
							return (
								<StructuralItem
									className={className}
									// contentClassName={`${ModuleStyle['structural-item']}`}
									key={`${item.uuid}`}
									structuralItemInfo={item}
									draggableData={item}
									clickable={true}
									onClick={(info: IFStructuralInfo) => {
										this.onClick(info, index, filterList);
									}}
									onDragStart={this.onDragStart}
									onDragEnd={this.onDragEnd}
									displayMode={ImageDisplayMode.ScaleAspectFit}
								/>
							);
						})}
					</div>
					<div
						className={ModuleStyle['more-icon-indicator']}
						onClick={this.onClickMore}
					>
						<MoreIconComponent />
					</div>
				</div>
			</div>
		);
	}
	/*******************辅助方法 ****************************/

	getUserNames() {
		let users: Array<TaskUserType> = this.props.analysisSourceInfo.operateUsers;
		let result = [];
		for (let user of users) {
			result.push(user.name);
		}

		if (result.length > 0) {
			return result.join(',');
		} else {
			return intl.get('COMMON_NONE').d('无');
		}
	}

	getUserOrganizationNames() {
		let users: Array<TaskUserType> = this.props.analysisSourceInfo.operateUsers;
		let result = [];
		for (let user of users) {
			result.push(user.organization);
		}
		if (result.length > 0) {
			return result.join(',');
		} else {
			return intl.get('COMMON_NONE').d('无');
		}
	}
}

export default AnalysisSourceProfileListItem;
