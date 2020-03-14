import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import {
	IFDeviceInfo,
	ETargetType,
	ESourceType,
	IFStructuralInfo,
	EMerge,
	EConfidenceValue,
	DateFormat,
	IFAttributeProperty,
	IFStructuralLinkInfo
} from 'sttypedefine';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { IFSearchStatisticInfo } from 'stutils/requests/search-service-requeests';

import MapContent from '../submodules/map-contant/MapContent';
import BaseResultPanel from '../../results-panel/src/BaseResultPanel';
import { connect } from 'react-redux';
import SearchResultPageActionsCreator from '../../../redux/actions/search-result-page.actions';
import { AttributeFilterPanelActionCreators } from 'stsrc/components/attribute-filter-panel';
import { Dispatch } from 'redux';

interface PropsType {
	showBodyRelatedWithFace: boolean; // 是否显示人脸关联的人体信息
	showFaceRelatedWithBody: boolean; // 是否显示人体关联的人脸信息
	showVehicleRelatedWithFace: boolean; // 是否先是人脸关联的车辆信息
	statisticsInfos: IFSearchStatisticInfo[] | null; // 右侧的结果树
	searchTargetList: Array<IFStructuralInfo>; // 搜索目标
	currentTargetType: ETargetType; // 当前选择的target type
	searchRange: Array<IFUniqueDataSource>; // 搜索范围（数据源）
	isSearchAllWhenSearchRangeEmpty: boolean; // 指示当earchRange为[]时是搜索全部还是不搜索（true表示搜索全部）
	attributeAccuracy: EConfidenceValue; //属性精确度
	faceThreshold: number; // 人脸相似度
	bodyThreshold: number; // 人体相似度
	startDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	endDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	// 是否精确匹配
	faceResultMergeType: EMerge;
	bodyResultMergeType: EMerge;
	selectedAttributeList: Array<IFAttributeProperty>; // 选择的属性列表
	allPoints: Array<IFDeviceInfo>; // 所有的摄像头信息（没有统计信息的也算上）
	centerPointOpt: L.MapOptions | null;

	updateStatisticsInfos: (value: Array<IFSearchStatisticInfo> | null) => void;
	onViewLive: (deviceId: string) => void;
}
interface StateType {
	mapPoints: Array<IFDeviceInfo>; // NOTE: 无用的变量
	mapSearchPoints: Array<IFDeviceInfo>; // 所有有统计数据的摄像头信息（显示的摄像头是它的一个子集）
	statisticsInfoArr: IFSearchStatisticInfo[] | null;
}
// function noop() {}
class MapViewContainer extends STComponent<PropsType, StateType> {
	static defaultProps = {
		currentTargetType: ETargetType.Unknown,
		// updateStaticInfos: noop,
		faceResultMergeType: EMerge.Union,
		bodyResultMergeType: EMerge.Union,
		showBodyRelatedWithFace: false,
		showFaceRelatedWithBody: false,
		showVehicleRelatedWithFace: false,
		faceThreshold: 0,
		bodyThreshold: 0,
		startDate: '',
		endDate: '',
		searchTargetList: [],
		searchRange: [],
		isSearchAllWhenSearchRangeEmpty: true,
		selectedAttributeList: [],
		attributeAccuracy: EConfidenceValue.Low,
		allPointsArr: []
	};

	onViewLive = (deviceId: string) => {
		this.props.onViewLive(deviceId);
	};

	/**
	 * 过滤需要显示的摄像头
	 * 条件：
	 * * 当前搜索范围下的摄像头
	 * * 搜索模式下有统计数据/采集模式下都显示
	 * @param {Array<IFDeviceInfo>} allPoints 所有的摄像头
	 * @param {(IFSearchStatisticInfo[] | null)} statisticsInfos 统计数据
	 * @param {boolean} [isSearchMode=false] 是否是搜索模式
	 * @param {ETargetType} [currentTargetType=ETargetType.Unknown] target type
	 * @param {IFUniqueDataSource[]} searchRange 当前搜索范围
	 * @returns {IFDeviceInfo[]} 需要显示的设想头
	 * @memberof ResultsShowInMap
	 */
	getAllCamerasWithCount(
		allPoints: Array<IFDeviceInfo>,
		statisticsInfos: IFSearchStatisticInfo[] | null,
		isSearchMode: boolean = false,
		currentTargetType: ETargetType = ETargetType.Unknown,
		searchRange: IFUniqueDataSource[]
	): IFDeviceInfo[] {
		if (!statisticsInfos) {
			return [];
		}

		// 摄像头的统计信息
		let cameraStatisticsInfos: IFSearchStatisticInfo[] = statisticsInfos.filter(
			(statisticsInfo: IFSearchStatisticInfo) => {
				return statisticsInfo.sourceType === ESourceType.Camera;
			}
		);

		// 在搜索范围内的摄像头
		let selectedDevices: IFDeviceInfo[] = [];
		for (let device of allPoints) {
			if (searchRange.length === 0) {
				selectedDevices.push(device);
			} else {
				// 某一类型
				for (let source of searchRange) {
					if (!source.sourceId && source.sourceType === ESourceType.Camera) {
						selectedDevices.push(device);
					} else {
						// 某一节点
						if (
							// eslint-disable-next-line
							device.id == source.sourceId &&
							source.sourceType === ESourceType.Camera
						) {
							selectedDevices.push(device);
						}
					}
				}
			}
		}

		let results: IFDeviceInfo[] = [];
		for (let device of selectedDevices) {
			for (let statisticsInfo of cameraStatisticsInfos) {
				if (
					// eslint-disable-next-line
					statisticsInfo.sourceId == device.id &&
					currentTargetType === statisticsInfo.targetType
				) {
					results.push({
						...device,
						// NOTE: 采集模式下我们故意不显示，采集模式下不需要显示数量
						count: isSearchMode ? statisticsInfo.count : 0
					});
				}
			}
		}

		return results;
	}

	render() {
		let searchTypes: ETargetType[] = [];
		switch (this.props.currentTargetType) {
			case ETargetType.Face:
				searchTypes = [ETargetType.Face, ETargetType.Body];
				break;

			case ETargetType.Body:
				searchTypes = [ETargetType.Face, ETargetType.Body];
				break;

			case ETargetType.Vehicle:
				searchTypes = [ETargetType.Face, ETargetType.Vehicle];
				break;
		}

		return (
			<React.Fragment>
				<BaseResultPanel
					searchTargetList={this.props.searchTargetList}
					searchRange={this.props.searchRange}
					isSearchAllWhenSearchRangeEmpty={
						this.props.isSearchAllWhenSearchRangeEmpty
					}
					startDate={this.props.startDate}
					endDate={this.props.endDate}
					autoUpdate={false}
					selectedAttributeList={this.props.selectedAttributeList}
					attributeAccuracy={this.props.attributeAccuracy}
					showBodyRelatedWithFace={this.props.showBodyRelatedWithFace}
					showFaceRelatedWithBody={this.props.showFaceRelatedWithBody}
					showVehicleRelatedWithFace={this.props.showVehicleRelatedWithFace}
					faceThreshold={this.props.faceThreshold}
					bodyThreshold={this.props.bodyThreshold}
					// 是否精确匹配
					faceResultMergeType={this.props.faceResultMergeType}
					bodyResultMergeType={this.props.bodyResultMergeType}
					// 通用之后新增的props
					currentTargetType={this.props.currentTargetType}
					updateStatisticsInfos={this.props.updateStatisticsInfos}
					searchTargetTypes={searchTypes}
					onlyNeedStatisticsInfoRequest={true}
					// eslint-disable-next-line
					render={(
						resultsList: Array<IFStructuralLinkInfo>,
						showRelative: boolean,
						loadMore: () => void,
						hasMore: boolean,
						isFirstLoading: boolean,
						isLoadingMore: boolean,
						currentTargetType: ETargetType,
						searchTargetType: ETargetType,
						isSearchMode: boolean
					) => {
						// 计算摄像头的信息
						let cameraPoints: IFDeviceInfo[] = this.getAllCamerasWithCount(
							this.props.allPoints,
							this.props.statisticsInfos,
							isSearchMode,
							this.props.currentTargetType,
							this.props.searchRange
						);

						return (
							<MapContent
								centerPointOpt={this.props.centerPointOpt}
								attributeAccuracy={this.props.attributeAccuracy}
								mapPoints={cameraPoints}
								currentTargetType={this.props.currentTargetType}
								searchRange={this.props.searchRange}
								selectedAttributeList={this.props.selectedAttributeList}
								bodyThreshold={this.props.bodyThreshold}
								faceThreshold={this.props.faceThreshold}
								startDate={this.props.startDate}
								endDate={this.props.endDate}
								faceResultMergeType={this.props.faceResultMergeType}
								bodyResultMergeType={this.props.bodyResultMergeType}
								searchTargetList={this.props.searchTargetList}
								statisticsInfos={this.props.statisticsInfos}
								allPointsArr={this.props.allPoints}
								onViewLive={this.onViewLive}
							/>
						);
					}}
				/>
			</React.Fragment>
		);
	}
}

// 监听redux中的属性
function mapStateToProps(state) {
	return {
		// 参数
		startDate: state[AttributeFilterPanelActionCreators.reducerName].startDate,
		endDate: state[AttributeFilterPanelActionCreators.reducerName].endDate,
		selectedAttributeList:
			state[AttributeFilterPanelActionCreators.reducerName].selectedAttributes,
		attributeAccuracy:
			state[AttributeFilterPanelActionCreators.reducerName].attributeAccuracy,
		showBodyRelatedWithFace:
			state[AttributeFilterPanelActionCreators.reducerName]
				.showBodyRelatedWithFace,
		showFaceRelatedWithBody:
			state[AttributeFilterPanelActionCreators.reducerName]
				.showFaceRelatedWithBody,
		showVehicleRelatedWithFace:
			state[AttributeFilterPanelActionCreators.reducerName]
				.showVehicleRelatedWithFace,
		faceThreshold:
			state[AttributeFilterPanelActionCreators.reducerName].faceThreshold,
		bodyThreshold:
			state[AttributeFilterPanelActionCreators.reducerName].bodyThreshold,
		faceResultMergeType:
			state[AttributeFilterPanelActionCreators.reducerName].faceResultMergeType,
		bodyResultMergeType:
			state[AttributeFilterPanelActionCreators.reducerName].bodyResultMergeType,

		// 搜索范围和搜索目标
		searchRange: state[SearchResultPageActionsCreator.reducerName].searchRange,
		isSearchAllWhenSearchRangeEmpty:
			state[SearchResultPageActionsCreator.reducerName]
				.isSearchAllWhenSearchRangeEmpty,
		searchTargetList:
			state[SearchResultPageActionsCreator.reducerName].searchTargetList,
		allPointsArr: state[SearchResultPageActionsCreator.reducerName].allPointsArr
	};
}

function mapDispatchToProps(disptach: Dispatch) {
	return {
		updateStatisticsInfos: (infos: IFSearchStatisticInfo[] | null) => {
			disptach(SearchResultPageActionsCreator.updateStatisticsInfos(infos));
		}
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MapViewContainer);
