import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import ModuleStyle from './assets/styles/index.module.scss';
import { StructuralItem } from '../../structural-item';
import { IFStructuralInfo, IFDeviceInfo, ETargetType } from 'sttypedefine';
import { ETaskType } from 'stsrc/type-define';
import * as intl from 'react-intl-universal';
import Map from 'src/vendors/react-leaflet';
import { connect } from 'react-redux';
import SearchResultPageActionsCreator from 'stsrc/pages/Search/views/search-result-page/src/redux/actions/search-result-page.actions';
import { EStructuralItemResultsViewMode } from 'stsrc/pages/Search/views/search-result-page/src/submodules/target-type-nav-bar/src/TargetTypeNavBar';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
import StructuralSpinner from 'stsrc/components/spinner';
import { EThumbFlag } from 'stsrc/utils/requests/tools';

const { DeviceMarkerCluster } = Map;
const isEqual = require('lodash/isEqual');

enum LoadStatus {
	unknown = 'unknown',
	loading = 'loading', // 加载中
	failed = 'failed', // 失败
	finished = 'finished' // 成功
}
interface PropsType {
	taskType: ETaskType; // 任务类型
	structuralItemList: Array<IFStructuralInfo>;
	guid: string;
	onSelect: (item: IFStructuralInfo) => void;
	sourcePoint: IFDeviceInfo | null;
	sourceTime: string;
	sourceName: string;
	onClose: () => void;
	isStructuralInfo: boolean;
	status: LoadStatus;
}

function noop() {}

interface StateType {
	mapPoints: Array<IFDeviceInfo>;
	structuralItemList: Array<IFStructuralInfo>;
}

const mapDefaultOpt = {
	dragging: false,
	doubleClickZoom: false,
	scrollWheelZoom: false
};

class StructuralDetailPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		taskType: ETaskType.Unknown,
		structuralItemList: [],
		guid: '',
		onSelect: noop,
		sourceName: '',
		onClose: noop,
		isStructuralInfo: true,
		sourcePoint: null,
		status: LoadStatus.unknown
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			structuralItemList: this.props.structuralItemList,
			mapPoints: []
		};
	}

	static getDerivedStateFromProps(
		props: PropsType,
		state: StateType
	): Partial<StateType> | null {
		if (!isEqual(state.structuralItemList, props.structuralItemList)) {
			return {
				structuralItemList: props.structuralItemList
			};
		}
		return null;
	}

	changeToMapMode = () => {
		this.props[SearchResultPageActionsCreator.setResultsViewMode](
			EStructuralItemResultsViewMode.MapMode
		);
		eventEmiiter.emit(EventType.previewerJumpMapPoint, this.props.sourcePoint);
		this.props.onClose();
	};

	render() {
		const { structuralItemList } = this.state;
		const { sourcePoint, sourceTime, isStructuralInfo } = this.props;
		const filterLists = isStructuralInfo
			? structuralItemList.filter(
					(item: IFStructuralInfo, index: number) =>
						item.guid === this.props.guid
			  )
			: structuralItemList;
		const newStructuralItemList = filterLists;
		// filterLists.length > 2 ? filterLists.slice(0, 2) : filterLists;

		const mapOpt = sourcePoint
			? {
					...mapDefaultOpt,
					zoom: 16,
					center: [sourcePoint.lat, sourcePoint.lng]
			  }
			: mapDefaultOpt;
		return (
			<div className={ModuleStyle['detail-panel-container']}>
				<span className={ModuleStyle['detail-panel-detail-header']}>
					{intl.get('SOURCE_INFORMATION').d('来源信息')}
				</span>
				{this.props.taskType === ETaskType.AnalysisTask ? (
					<section className={ModuleStyle['analysis-detail']}>
						<span className={ModuleStyle['detail-file-name']}>
							{this.props.sourceName}
						</span>
						<span className={ModuleStyle['detail-info']}>
							<span>{intl.get('DETAIL_PANEL_TIME').d('时间')}:</span>
							<span>{sourceTime}</span>
						</span>
					</section>
				) : (
					<section className={ModuleStyle['capture-detail']}>
						<div
							className={ModuleStyle['detail-map-container']}
							onClick={this.changeToMapMode}
						>
							<Map options={mapOpt}>
								{sourcePoint ? (
									<DeviceMarkerCluster
										devices={[sourcePoint]}
										isInPreviewer={true}
									/>
								) : null}
							</Map>
						</div>
						<span className={ModuleStyle['detail-info']}>
							<span className={ModuleStyle['detail-info-label']}>
								{intl.get('DETAIL_PANEL_TIME').d('时间')}：
							</span>
							<span className={ModuleStyle['detail-info-content']}>
								{sourceTime}
							</span>
						</span>
						<span className={ModuleStyle['detail-info']}>
							<span className={ModuleStyle['detail-info-label']}>
								{intl.get('DETAIL_PANEL_CAMERA').d('摄像头')}：
							</span>
							<span className={ModuleStyle['detail-info-content']}>
								{sourcePoint ? sourcePoint.name : ''}
							</span>
						</span>
					</section>
				)}
				<section>
					<h1 className={ModuleStyle['related-img-title']}>
						{intl.get('DETAIL_PANEL_RELATED_IMAGE').d('相关图片')}
					</h1>
					<div className={ModuleStyle['related-img-container']}>
						{this.props.status === LoadStatus.failed ||
						this.props.status === LoadStatus.finished ? (
							newStructuralItemList.length ? (
								newStructuralItemList.map(
									(item: IFStructuralInfo, index: number) => {
										return (
											<StructuralItem
												className={`${ModuleStyle['detail-item']} ${
													item.targetType === ETargetType.Body
														? ModuleStyle['detail-item-body']
														: ModuleStyle['detail-item-face']
												}`}
												clickable={true}
												// displayMode={ImageDisplayMode.ScaleAspectFill}
												structuralItemInfo={item}
												key={item.uuid}
												thumbFlag={
													item.targetType === ETargetType.Body
														? EThumbFlag.Thumb140x280
														: EThumbFlag.Thumb100x100
												}
											/>
										);
									}
								)
							) : (
								intl.get('DETAIL_PANEL_NO_DATA').d('暂未检测到数据')
							)
						) : (
							<div className={ModuleStyle['detail-spinner-wrapper']}>
								<StructuralSpinner />
							</div>
						)}
					</div>
				</section>
			</div>
		);
	}
}

const mapDispatchToProps = {
	[SearchResultPageActionsCreator.setResultsViewMode]:
		SearchResultPageActionsCreator.setResultsViewMode
};

export default connect(
	null,
	mapDispatchToProps
)(StructuralDetailPanel);
