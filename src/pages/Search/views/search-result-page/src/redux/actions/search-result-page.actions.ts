import { createActions } from 'redux-actions';
import {
	IFStructuralInfo,
	IFDeviceInfo,
	IFTreeNode,
	// eslint-disable-next-line
	IFStructuralLinkInfo
} from 'stsrc/type-define';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { IFSearchStatisticInfo } from 'stsrc/utils/requests/search-service-requeests';
import { EStructuralItemResultsViewMode } from 'stsrc/pages/Search/views/search-result-page/src/submodules/target-type-nav-bar/src/TargetTypeNavBar';

const _searchResultPageActionsCreator = createActions({
	APP: {
		COMPONENTS: {
			SEARCH_RESULT_PAGE: {
				// 更新搜索目标
				UPDATE_SEARCH_TARGET_LIST: (
					searchTargetList: Array<IFStructuralInfo>
				) => ({
					searchTargetList: searchTargetList
				}),
				// 更新搜索范围
				UPDATE_SEARCH_RANGE: (searchRange: Array<IFUniqueDataSource>) => ({
					searchRange: searchRange
				}),
				// 更新根节点的搜索范围
				UPDATE_ROOT_SEARCH_RANGE: (searchRange: Array<IFUniqueDataSource>) => ({
					searchRootRange: searchRange
				}),
				// 更新本次搜索根节点的id v1.2.0
				UPDATE_SEARCH_RANGE_ROOT_NODE: (node: IFTreeNode) => ({
					currentSearchRootNode: node
				}),
				// 更新本次搜索节点的id v1.2.0
				UPDATE_SEARCH_NODE: (
					node: IFTreeNode,
					filter: (item: IFStructuralLinkInfo) => boolean = () => true
				) => ({
					currentSearchNode: node,
					searchResultFilter: filter
				}),
				// 更新搜索范围为空的情况
				UPDATE_SEARCH_EMPTY_RANGE: undefined,
				// 更新统计结果
				UPDATE_STATISTICS_INFOS: (
					statisticsInfos: IFSearchStatisticInfo[] | null
				) => ({
					statisticsInfos: statisticsInfos
				}),
				// 更新统计结果
				GET_ALL_CAMERA_INFOS: (allPointsArr: IFDeviceInfo[]) => ({
					allPointsArr: allPointsArr
				}),
				// 设置查看模式
				SET_RESULTS_VIEW_MODE: (
					resultsViewMode: EStructuralItemResultsViewMode
				) => ({
					resultsViewMode: resultsViewMode
				}),
				// 判断是否有图片正在上传，目前用于解决查看大图点击小图快速检索出现两个loading问题
				SET_IS_UPLOADING: (isUploading: boolean) => ({
					isUploading
				}),
				// 强制刷新
				FORCE_UPDATE: undefined,
				RESET: undefined,
				RESET_TO_LATEST: undefined
			}
		}
	}
});

const SearchResultPageActionsCreator = {
	reducerName: 'APP/COMPONENTS/SEARCH_RESULT_PAGE',
	updateSearchTargetList:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateSearchTargetList,
	updateSearchRange:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateSearchRange,
	updateRootSearchRange:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateRootSearchRange,
	updateSearchRangeRootNode:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateSearchRangeRootNode,
	updateSearchNode:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateSearchNode,
	updateSearchEmptyRange:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateSearchEmptyRange,
	updateStatisticsInfos:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.updateStatisticsInfos,
	getAllCameraInfos:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.getAllCameraInfos,
	setResultsViewMode:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.setResultsViewMode,
	setIsUploading:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.setIsUploading,
	forceUpdate:
		_searchResultPageActionsCreator.app.components.searchResultPage.forceUpdate,
	resetActionCreator:
		_searchResultPageActionsCreator.app.components.searchResultPage.reset,
	resetToLatest:
		_searchResultPageActionsCreator.app.components.searchResultPage
			.resetToLatest
};

export default SearchResultPageActionsCreator;
