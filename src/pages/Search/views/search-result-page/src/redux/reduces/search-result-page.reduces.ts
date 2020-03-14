import { handleActions } from 'redux-actions';
import SearchResultPageActionsCreator from '../actions/search-result-page.actions';
import {
	IFStructuralInfo,
	IFDeviceInfo,
	IFTreeNode,
	getDefaultIFTreeNode,
	IFStructuralLinkInfo
} from 'stsrc/type-define';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { IFSearchStatisticInfo } from 'stsrc/utils/requests/search-service-requeests';
import { EStructuralItemResultsViewMode } from 'stsrc/pages/Search/views/search-result-page/src/submodules/target-type-nav-bar/src/TargetTypeNavBar';

const CSearchAllId = 'search-all-id'; // 搜索全部的节点id
const CSearchLiveCameraId = 'search-live-video-id'; // 搜索实时视频的节点id
const CSearchOfflineVideoId = 'search-offline-video-id'; // 搜索离线视频的节点id
const CSearchZipFileId = 'search-zip-file-id'; // 搜索压缩包节点的id

const CSearchLiveCameraNode: IFTreeNode<number> = {
	...getDefaultIFTreeNode<number>(0),
	id: CSearchLiveCameraId,
	parentId: CSearchAllId,
	name: '实时视频',
	value: 0,
	children: [],
	parent: null,
	uuid: CSearchLiveCameraId
};

const CSearchOfflineVideoNode: IFTreeNode<number> = {
	...getDefaultIFTreeNode<number>(0),
	id: CSearchOfflineVideoId,
	parentId: CSearchAllId,
	name: '离线视频',
	value: 0,
	children: [],
	parent: null,
	uuid: CSearchOfflineVideoId
};

const CSearchZipFileNode: IFTreeNode<number> = {
	...getDefaultIFTreeNode<number>(0),
	id: CSearchZipFileId,
	parentId: CSearchAllId,
	name: '压缩图片',
	value: 0,
	children: [],
	parent: null,
	uuid: CSearchZipFileId
};

const CSearchAllNode: IFTreeNode<number> = {
	...getDefaultIFTreeNode<number>(0),
	id: CSearchAllId,
	parentId: '',
	parent: null,
	name: '全部',
	value: 0,
	children: [
		CSearchLiveCameraNode,
		CSearchOfflineVideoNode,
		CSearchZipFileNode
	],
	uuid: CSearchAllId
};

// 修改parent, children
CSearchLiveCameraNode.parent = CSearchAllNode;
CSearchLiveCameraNode.parentId = CSearchAllNode.id;
CSearchOfflineVideoNode.parent = CSearchAllNode;
CSearchOfflineVideoNode.parentId = CSearchAllNode.id;
CSearchZipFileNode.parent = CSearchAllNode;
CSearchZipFileNode.parentId = CSearchAllNode.id;

export {
	CSearchAllNode,
	CSearchLiveCameraNode,
	CSearchOfflineVideoNode,
	CSearchZipFileNode
};

interface IRSearchResultPageStateType {
	updatedTime: number; // 更新的时间戳(可以用于强制刷新)

	searchTargetList: Array<IFStructuralInfo>;
	searchRange: Array<IFUniqueDataSource>; // 当前的搜索范围
	searchRootRange: Array<IFUniqueDataSource>; // v1.2.0 根节点的搜索范围
	isSearchAllWhenSearchRangeEmpty: boolean; // 当searchRange字段为空数组时，是否表示搜索全部文件还是空(true表示搜索全部，false表示搜索void)

	// NOTE: 检索的数据源的统计结果(搜索模式下为结果的统计量，采集模式则统计的是摄像头下边的统计量)
	statisticsInfos: IFSearchStatisticInfo[] | null;
	allPointsArr: IFDeviceInfo[];
	resultsViewMode: EStructuralItemResultsViewMode;
	isUploading: boolean; // 是否是文件上传检测中

	currentSearchRootNode: IFTreeNode; // 本轮搜索的根节点  v1.2.0
	currentSearchNode: IFTreeNode; // 本轮搜索的节点  v1.2.0
	searchResultFilter: (item: IFStructuralLinkInfo) => boolean; // v1.2.0 用于过滤搜索的数据
}

const initState: IRSearchResultPageStateType = {
	searchRange: [], // NOTE: 这儿需要注意，全部文件是这个参数，那么没有文件呢？
	searchRootRange: [],
	isSearchAllWhenSearchRangeEmpty: true, // 搜索全部

	searchTargetList: [],
	statisticsInfos: null,
	allPointsArr: [],
	resultsViewMode: EStructuralItemResultsViewMode.ListMode,
	isUploading: false,
	currentSearchRootNode: CSearchAllNode,
	currentSearchNode: CSearchAllNode,
	searchResultFilter: () => true,
	updatedTime: Date.now()
};

let searchResultPageReducers = handleActions(
	{
		// 更新搜索目标列表
		[SearchResultPageActionsCreator.updateSearchTargetList.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				searchTargetList: [...action.payload.searchTargetList]
			};
		},
		// 更新搜素范围
		[SearchResultPageActionsCreator.updateSearchRange.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				searchRange: [...action.payload.searchRange],
				isSearchAllWhenSearchRangeEmpty: true // 搜索全部
			};
		},
		// 更新根节点的搜素范围
		[SearchResultPageActionsCreator.updateRootSearchRange.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				searchRootRange: [...action.payload.searchRootRange],
				isSearchAllWhenSearchRangeEmpty: true // 搜索全部
			};
		},
		// 更新搜素范围
		[SearchResultPageActionsCreator.updateSearchEmptyRange.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				searchRange: [],
				searchRootRange: [],
				isSearchAllWhenSearchRangeEmpty: false // 搜索空
			};
		},
		// 更新搜素范围的根node
		[SearchResultPageActionsCreator.updateSearchRangeRootNode.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				currentSearchRootNode: action.payload.currentSearchRootNode
			};
		},
		// 更新搜素范围node
		[SearchResultPageActionsCreator.updateSearchNode.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				currentSearchNode: action.payload.currentSearchNode,
				searchResultFilter: action.payload.searchResultFilter
			};
		},
		[SearchResultPageActionsCreator.updateStatisticsInfos.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				statisticsInfos: action.payload.statisticsInfos
			};
		},
		[SearchResultPageActionsCreator.getAllCameraInfos.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				allPointsArr: action.payload.allPointsArr
			};
		},
		[SearchResultPageActionsCreator.setResultsViewMode.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				resultsViewMode: action.payload.resultsViewMode
			};
		},
		[SearchResultPageActionsCreator.setIsUploading.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				isUploading: action.payload.isUploading
			};
		},
		[SearchResultPageActionsCreator.forceUpdate.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				updatedTime: Math.max(state.updatedTime + 1, Date.now())
			};
		},
		[SearchResultPageActionsCreator.resetActionCreator.toString()]: (
			state,
			action
		) => {
			return {
				...initState
			};
		},
		[SearchResultPageActionsCreator.resetToLatest.toString()]: (
			state,
			action
		) => {
			return {
				...initState,
				updatedTime: Math.max(state.updatedTime + 1, Date.now())
			};
		}
	},
	initState
);

searchResultPageReducers.toString = function() {
	return SearchResultPageActionsCreator.reducerName;
};

export default searchResultPageReducers;
