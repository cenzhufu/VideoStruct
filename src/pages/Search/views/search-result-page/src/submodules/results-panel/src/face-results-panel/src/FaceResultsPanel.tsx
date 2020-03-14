import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import {
	IFStructuralLinkInfo,
	IFStructuralInfo,
	ETargetType,
	EMerge,
	DateFormat,
	IFAttributeProperty,
	EConfidenceValue,
	IFDeviceInfo,
	IFTreeNode
} from 'stsrc/type-define';

import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { IFCancelTokenSource } from 'ifvendors/utils/requests';
import FaceResultPresentationPanel from '../submodules/face-results-presentation-panel/src/FaceResultsPresentationPanel';
import { IFSearchStatisticInfo } from 'stsrc/utils/requests/search-service-requeests';
import * as H from 'history';
import { connect } from 'react-redux';
import AttributeFilterPanelActionCreators from 'stsrc/components/attribute-filter-panel/src/redux/actions/attribute-filter-panel.actions';
import { match } from 'react-router';
import { SearchResultPageActionsCreator } from 'src/pages/Search/views/search-result-page';
import BaseResultPanel from '../../BaseResultPanel';
import { Dispatch } from 'redux';

function noop() {}
interface PropsType {
	// 路由带过来的props(connect)
	match: match;
	history: H.History;
	location: H.Location;

	/************ 搜索参数 start ************/
	// currentTargetType: ETargetType;
	searchTargetList: Array<IFStructuralInfo>; // 搜索目标
	searchRange: Array<IFUniqueDataSource>; // 搜索范围
	searchRootRange: Array<IFUniqueDataSource>; // 搜索跟范围
	isSearchAllWhenSearchRangeEmpty: boolean; // 控制怎么解释searchTargetList为空的情况

	startDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	endDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	selectedAttributeList: Array<IFAttributeProperty>; // 选择的属性列表
	attributeAccuracy: EConfidenceValue; //属性精确度
	showBodyRelatedWithFace: boolean; // 是否显示人脸关联的人体信息
	showFaceRelatedWithBody: boolean; // 是否显示人体关联的人脸信息
	showVehicleRelatedWithFace: boolean; // 是否先是人脸关联的车辆信息
	faceThreshold: number; // 人脸相似度
	bodyThreshold: number; // 人体相似度
	// 是否精确匹配
	faceResultMergeType: EMerge;
	bodyResultMergeType: EMerge;
	/************ 搜索参数  end ************/
	allPointsArr: IFDeviceInfo[];
	isUploading: boolean;

	// v1.2.0 start
	currentSearchNode: IFTreeNode; // 当前选中的搜索范围节点
	currentSearchRootNode: IFTreeNode; // 当前选中的搜索的跟节点
	searchResultFilter: (item: IFStructuralLinkInfo) => boolean;
	updateSearchRangeRootNode: (node: IFTreeNode) => void;
	updateRootSearchRange: (range: IFUniqueDataSource[]) => void;
	updatedTime: number; // 更新的时间戳
	// v1.2.0 end

	// redux
	updateStatisticsInfos: (infos: Array<IFSearchStatisticInfo> | null) => void;
}

interface StateType {
	// resultsList: Array<IFStructuralLinkInfo>;

	currentTargetType: ETargetType;

	// page: number;
	// pageSize: number;

	// hasMore: boolean;
	// isFirstLoading: boolean; // 是否第一次加载
	// total: number;
	// isLoadingMore: boolean; // 是否加载更多

	// showRelative: boolean;
}

class FaceResultPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		startDate: '',
		endDate: '',
		searchTargetList: [],
		searchRange: [],
		searchRootRange: [],
		isSearchAllWhenSearchRangeEmpty: true,
		selectedAttributeList: [],
		attributeAccuracy: EConfidenceValue.Low,
		showBodyRelatedWithFace: false,
		showFaceRelatedWithBody: false,
		showVehicleRelatedWithFace: false,
		faceThreshold: 0,
		bodyThreshold: 0,
		faceResultMergeType: EMerge.Union,
		bodyResultMergeType: EMerge.Union,
		isUploading: false,

		currentSearchId: '',

		updateStatisticsInfos: noop,
		updateSearchRangeRootId: noop,
		updateRootSearchRange: noop,
		searchResultFilter: () => true,
		updatedTime: Date.now()
	};
	_source: IFCancelTokenSource | null; // 请求取消handle
	_isUnmounted: boolean;

	constructor(props: PropsType) {
		super(props);
		this.state = {
			currentTargetType: ETargetType.Face
		};

		this._source = null;
	}

	render() {
		const { allPointsArr } = this.props;
		return (
			<BaseResultPanel
				searchTargetList={this.props.searchTargetList}
				searchRange={this.props.searchRange}
				searchRootRange={this.props.searchRootRange}
				isSearchAllWhenSearchRangeEmpty={
					this.props.isSearchAllWhenSearchRangeEmpty
				}
				startDate={this.props.startDate}
				endDate={this.props.endDate}
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
				currentTargetType={this.state.currentTargetType}
				updateStatisticsInfos={this.props.updateStatisticsInfos}
				searchTargetTypes={[ETargetType.Face, ETargetType.Body]}
				// v1.2.0 start 用于搜索统计数字展示
				currentSearchNode={this.props.currentSearchNode}
				currentSearchRootNode={this.props.currentSearchRootNode}
				searchResultFilter={this.props.searchResultFilter}
				updateSearchRangeRootNode={this.props.updateSearchRangeRootNode}
				updateSearchRootRange={this.props.updateRootSearchRange}
				updatedTime={this.props.updatedTime}
				// v1.2.0 end
				// eslint-disable-next-line
				render={(
					resultsList: Array<IFStructuralLinkInfo>,
					showRelative: boolean,
					loadMore: () => void,
					hasMore: boolean,
					isFirstLoading: boolean,
					isLoadingMore: boolean,
					currentTargetType: ETargetType,
					searchTargetType: ETargetType
				) => {
					return (
						<FaceResultPresentationPanel
							resultsList={resultsList}
							showFaceRelative={showRelative}
							hasMore={hasMore}
							isFirstLoading={isFirstLoading}
							loadMore={loadMore}
							isLoadingMore={isLoadingMore}
							allPointsArr={allPointsArr}
							currentTargetType={currentTargetType}
							searchTargetType={searchTargetType}
							isUploading={this.props.isUploading}
						/>
					);
				}}
			/>
		);
	}

	/************************************** redux方法 start*************************************/

	/************************************** redux方法 end*************************************/
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
		allPointsArr:
			state[SearchResultPageActionsCreator.reducerName].allPointsArr,
		isUploading: state[SearchResultPageActionsCreator.reducerName].isUploading,

		// v1.2.0 start
		searchRootRange:
			state[SearchResultPageActionsCreator.reducerName].searchRootRange,
		currentSearchNode:
			state[SearchResultPageActionsCreator.reducerName].currentSearchNode, // 当前选中的节点
		currentSearchRootNode:
			state[SearchResultPageActionsCreator.reducerName].currentSearchRootNode, // 当前选中的跟节点
		searchResultFilter:
			state[SearchResultPageActionsCreator.reducerName].searchResultFilter, // 过滤函数
		updatedTime: state[SearchResultPageActionsCreator.reducerName].updatedTime // 更新的时间戳
		// v1.2.0 end
	};
}

function mapDispatchToProps(dispatch: Dispatch) {
	return {
		updateStatisticsInfos: function updateStatisticsInfos(
			infos: Array<IFSearchStatisticInfo> | null
		) {
			dispatch(SearchResultPageActionsCreator.updateStatisticsInfos(infos));
		},
		updateSearchRangeRootNode: function updateSearchRangeRootNode(
			node: IFTreeNode
		) {
			dispatch(SearchResultPageActionsCreator.updateSearchRangeRootNode(node));
		},
		updateRootSearchRange: function updateRootSearchRange(
			range: IFUniqueDataSource[]
		) {
			dispatch(SearchResultPageActionsCreator.updateRootSearchRange(range));
		}
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(FaceResultPanel);
