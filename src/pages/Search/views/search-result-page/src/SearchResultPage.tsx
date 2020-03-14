import * as React from 'react';
import { Layout, message } from 'antd';
import * as intl from 'react-intl-universal';

import AttributeFilterPanel from 'stcomponents/attribute-filter-panel';
import SearchUploadPanel from '../../search-target-panel-container';
import SearchSourceRangePanel from '../../search-source-range-panel';

import Loading from 'stcomponents/loading';
import {
	ETargetType,
	IFStructuralInfo,
	IFStructuralLinkInfo,
	EMerge,
	IFAttributeProperty,
	IFDeviceInfo,
	DateFormat,
	EConfidenceValue,
	ListType,
	IFTreeNode,
	ESourceType,
	getDefaultIFTreeNode,
	getStructuralLinkInfoSourceType,
	getStructuralLinkInfoSourceId
} from 'sttypedefine';
import ModuleStyle from './assets/styles/index.module.scss';
// import SourcePreviewer from 'stcontainers/source-previewer';
import MultiStructuralUploadPreviewer from 'stcontainers/multi-structural-upload-previewer';

import { match, Switch, Route, Redirect } from 'react-router-dom';
import AuthVerifyRoute from 'stcomponents/auth-verify-route';

import TargetTypeNavigationBar from './submodules/target-type-nav-bar';
import MapViewContainer from './submodules/map-view';

import { IFSearchStatisticInfo } from 'stutils/requests/search-service-requeests';
import { IFCancelTokenSource } from 'ifvendors/utils/requests';
import STComponent from 'stcomponents/st-component';

import {
	IFDetectedStructualInfo,
	CollectionResourceRequest,
	IFUniqueDataSource,
	IFAnalysisSourceDetailInfo,
	CollectionTaskRequest
} from 'stsrc/utils/requests/collection-request';
import { IFDetectOptions } from '../../search-target-panel-container/src/SearchUploadImagePanel';
import { ESourceRangeViewMode } from '../../search-source-range-panel/src/SearchSourceRangePanel';

import * as H from 'history';

import FaceResultsPanel from './submodules/results-panel/src/face-results-panel';
import BodyResultsPanel from './submodules/results-panel/src/body-results-panel';
import VehicleResultsPanel from './submodules/results-panel/src/vehicle-results-panel';
import { EStructuralItemResultsViewMode } from './submodules/target-type-nav-bar/src/TargetTypeNavBar';
// import { DeviceRequests } from 'stsrc/utils/requests/basic-server-request';

import eventEmiiter, { EventType } from 'stutils/event-emit';
// import { saveStructuralInfoMemo } from '../index';
import SearchResultPageActionsCreator from './redux/actions/search-result-page.actions';
import { connect } from 'react-redux';
import AttributeFilterPanelActionCreators from 'stsrc/components/attribute-filter-panel/src/redux/actions/attribute-filter-panel.actions';
import {
	DeviceRequests,
	IRGetDeviceListPayload
} from 'stsrc/utils/requests/basic-server-request';

import { isSearchMode } from 'stsrc/utils/search-utils';

const { Content, Sider } = Layout;
// const TabPane = Tabs.TabPane;

const DEFAULTOTAL: string = '0';
const DEFAULT_SEARCH_TYPE = [ETargetType.Body]; // NOTE: 默认人体
interface PropsType {
	// router带过来的属性
	match: match;
	history: H.History;
	location: H.Location;

	searchTargetList: Array<IFStructuralInfo>;

	searchRange: Array<IFUniqueDataSource>; // 搜索范围（数据源）
	statisticsInfos: IFSearchStatisticInfo[] | null;

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

	allPointsArr: IFDeviceInfo[];
	resultsViewMode: EStructuralItemResultsViewMode;

	// v1.2.0 start
	currentSearchNode: IFTreeNode; // 当前选中的节点
	// v1.2.0 end
}

interface StateType {
	maxStructuralCount: number;

	isNoData: boolean;
	uploading: boolean;
	searchTypes: ETargetType[]; // @deprecated

	resultsList: Array<IFStructuralLinkInfo>;

	page: number;
	pageSize: number;

	hasMore: boolean;
	loading: boolean;
	total: string;
	isLoadingMore: boolean; // 是否加载更多

	mergeType: EMerge; //精确匹配 或者模糊匹配

	viewMode: ESourceRangeViewMode;
	selectedSourceRange: Array<IFAnalysisSourceDetailInfo>;

	/*** 二期增加 ****/
	supportedTaskList: ETargetType[]; // 支持的解析类型
	currentSelectedType: ETargetType;
	resultsViewMode: EStructuralItemResultsViewMode;
	/*******/
	centerPointOpt: L.MapOptions | null;
	carDragFace: boolean; // 是否是从车辆拖拽人脸
}

// 备忘录对应的关键字
const _structural_info_memo_key = 'SearchResultPage_structural_memo_key'; // 检索目标
const _strutural_info_range_key = '_strutural_info_range_key'; // 检索范围

class SearchResultPage extends STComponent<PropsType, StateType> {
	scrollDomRef: React.RefObject<HTMLDivElement>;

	showedMultiplySelectModal: boolean; // 是否显示了多图选择的弹层
	_source: IFCancelTokenSource | null; // 请求取消handle
	memoTemp: Array<IFStructuralInfo>; // 记录快速搜索新页面打开后的上传记录，用于跳到对应tab

	constructor(props: PropsType) {
		super(props);
		this.scrollDomRef = React.createRef<HTMLDivElement>();
		this.showedMultiplySelectModal = false;

		// 接受外界的参数
		let memos = SearchResultPage.getStructuralInfoMemo() || [];
		this.memoTemp = memos; //因为下一步直接把localStorage清了，所以要记录下来
		SearchResultPage.clearSearchTargetsMemo();

		//获取跳转过来的搜索图片类型
		let searchTypes: ETargetType[] = [];
		let uniqSearchTypes = new Set();

		let validSearchTargets: Array<IFStructuralInfo> = [];
		if (memos.length > 0) {
			for (const structuralInfo of memos) {
				switch (structuralInfo.targetType) {
					case ETargetType.Face:
					case ETargetType.Body:
					case ETargetType.Unknown:
						validSearchTargets.push(structuralInfo);
						break;

					default:
						break;
				}
				uniqSearchTypes.add(structuralInfo.targetType);
			}
			searchTypes = Array.from(uniqSearchTypes);
		} else {
			searchTypes = DEFAULT_SEARCH_TYPE;
		}

		// 选择范围
		let rangeMemos = SearchResultPage.getSearchRangeMemo() || [];
		SearchResultPage.clearRangeMemo();

		let viewMode = ESourceRangeViewMode.Normal;
		if (rangeMemos.length > 0) {
			// 在有外界数据源的情况下才更新searchRange
			viewMode = ESourceRangeViewMode.OutControlDataSource;
			let searchRangeList = [];

			for (const item of rangeMemos) {
				searchRangeList.push({
					sourceId: item.sourceId,
					sourceType: item.sourceType
				});
			}

			this.updateRootSearchRange(searchRangeList);
			this.updateSearchRange(searchRangeList);
		} else {
			// do nothing
		}

		//
		this.updateSearchTargetList([
			...props.searchTargetList,
			...validSearchTargets
		]);

		if (validSearchTargets.length < memos.length) {
			message.warn(
				intl
					.get('SEARCH_RESULT_SUPPORTED_TARGET_TYPE')
					.d(`只能搜索人脸/人体图片`)
			);
		}

		this.state = {
			maxStructuralCount: 5,

			searchTypes: searchTypes, //搜素类型
			resultsList: [], //搜索结果
			page: 1,
			pageSize: 250,
			hasMore: true,
			loading: false,
			isNoData: false, //是否有搜索结果

			total: DEFAULTOTAL,
			isLoadingMore: false,
			uploading: false,

			mergeType: EMerge.Intersection,

			viewMode: viewMode,
			selectedSourceRange: rangeMemos, // 选择的数据源

			supportedTaskList: [],
			currentSelectedType: ETargetType.Unknown,
			resultsViewMode: EStructuralItemResultsViewMode.Unknown,
			centerPointOpt: null,
			carDragFace: false
		};
	}

	static getDerivedStateFromProps(props: PropsType, state: StateType) {
		let result: Partial<StateType> = {};
		if (props.resultsViewMode !== state.resultsViewMode) {
			result = {
				...result,
				resultsViewMode: props.resultsViewMode
			};
		}

		// if (props.currentSearchNode.value)

		if (Object.keys(result).length > 0) {
			return result;
		} else {
			return null;
		}
	}

	/****************** 暂存在storage中的东西 begin*******************************/

	/**
	 * 获得memo
	 * @static
	 * @memberof SearchUploadImagePanel
	 * @returns {IFStructuralInfo[] | null} memo
	 */
	static getStructuralInfoMemo(): IFStructuralInfo[] | null {
		let result: IFStructuralInfo[] | null = null;
		try {
			let memo: string | null = localStorage.getItem(_structural_info_memo_key);
			if (memo) {
				result = JSON.parse(memo);
			}
		} catch (error) {
			console.error(error);
		}

		return result;
	}
	/**
	 * 清空memo
	 * @static
	 * @memberof SearchUploadImagePanel
	 * @returns {void}
	 */
	static clearSearchTargetsMemo() {
		localStorage.removeItem(_structural_info_memo_key);
	}

	static getSearchRangeMemo(): Array<IFAnalysisSourceDetailInfo> | null {
		let result: IFAnalysisSourceDetailInfo[] | null = null;
		try {
			let memo: string | null = localStorage.getItem(_strutural_info_range_key);
			if (memo) {
				result = JSON.parse(memo);
			}
		} catch (error) {
			console.error(error);
		}

		return result;
	}

	static clearRangeMemo() {
		localStorage.removeItem(_strutural_info_range_key);
	}

	/*********************** 暂存在storage中的东西 end*******************************/

	/*********************** 生命周期 begin ******************************/

	componentDidMount() {
		this.getSupportedAnalysisTasks().then(() => {
			// 初始化当前选中的type
			let currentSelectedType = ETargetType.Face;
			// if (this.isFaceItemActive()) {
			// 	currentSelectedType = ETargetType.Face;
			// } else if (this.isBodyItemActive()) {
			// 	currentSelectedType = ETargetType.Body;
			// } else if (this.isVehicleItemActive()) {
			// 	currentSelectedType = ETargetType.Vehicle;
			// }
			if (this.memoTemp.length) {
				currentSelectedType = this.memoTemp[0].targetType;
				this.autoTabIfNeed(this.memoTemp);
			} else {
				this.onChangeTaskType(currentSelectedType);
			}
			this.setState({
				currentSelectedType: currentSelectedType
			});
		});

		// 监听事件
		eventEmiiter.addListener(
			EventType.draggedNewStrucutralItem,
			this.onDropStructuralInfo
		);
		eventEmiiter.addListener(
			EventType.previewerJumpMapPoint,
			this.setMapCenter
		);
		// 获取全部摄像头
		this.getCameraList();
	}

	// 目前用来判断从车辆拖拽人脸的方法
	componentDidUpdate(prevProps: PropsType) {
		if (
			prevProps.searchTargetList.length === 0 &&
			this.props.searchTargetList.length
		) {
			this.setState(
				{
					carDragFace: this.state.currentSelectedType === 'car',
					currentSelectedType: this.props.searchTargetList[0].targetType
				},
				() => {
					this.autoTabIfNeed(this.props.searchTargetList);
				}
			);
		}
	}

	componentWillUnmount() {
		eventEmiiter.removeListener(
			EventType.draggedNewStrucutralItem,
			this.onDropStructuralInfo
		);
		eventEmiiter.removeListener(
			EventType.previewerJumpMapPoint,
			this.setMapCenter
		);
	}

	/*********************** 生命周期 end ******************************/

	// 中心点
	setMapCenter = (deviceNodeInfo: IFDeviceInfo) => {
		if (deviceNodeInfo && deviceNodeInfo.lat && deviceNodeInfo.lng) {
			// 因为地图上所有的摄像头展示存在延时（要获得统计数据），为了进去就显示某个摄像头的详情，我们需要先设置
			this.setState({
				centerPointOpt: {
					zoom: 16,
					center: [deviceNodeInfo.lat, deviceNodeInfo.lng],
					id: deviceNodeInfo.id
				}
			});
			// 修改选中的数据源
			this.updateSearchRange([
				{
					sourceId: deviceNodeInfo.id,
					sourceType: ESourceType.Camera
				}
			]);
			let treeNode: IFTreeNode = {
				...getDefaultIFTreeNode<any>(0),
				parent: deviceNodeInfo.parent,
				parentId: deviceNodeInfo.areaId,
				name: deviceNodeInfo.name,
				id: deviceNodeInfo.id,
				uuid: deviceNodeInfo.uuid
			};
			this.updateSearchRangeNode(treeNode, (item: IFStructuralLinkInfo) => {
				let type: ESourceType = getStructuralLinkInfoSourceType(item);
				let sourceId: string = getStructuralLinkInfoSourceId(item);
				return type === ESourceType.Camera && deviceNodeInfo.id === sourceId;
			});
		}
	};

	/**
	 * 获取所有的摄像头信息（非层级结构）
	 * @returns {void} void
	 * @memberof SearchResultPage
	 */
	getCameraList = () => {
		const requestJson: IRGetDeviceListPayload = {
			pageNo: 1,
			pageSize: 10000,
			orderBy: 'updated desc',
			applyCameraOffset: true
		};
		// 获取摄像头
		DeviceRequests.getDeviceList(requestJson)
			.then((result: ListType<IFDeviceInfo>) => {
				let allPointsArr = result.list;
				this.props[SearchResultPageActionsCreator.getAllCameraInfos](
					allPointsArr
				);
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	isFaceItemActive() {
		return this.props.location.pathname.match(/search\/result\/face/) !== null;
	}

	isBodyItemActive() {
		return this.props.location.pathname.match(/search\/result\/body/) !== null;
	}

	isVehicleItemActive() {
		return this.props.location.pathname.match(/search\/result\/car/) !== null;
	}

	/*********************** 请求相关 begin ******************************/

	getSupportedAnalysisTasks() {
		return CollectionTaskRequest.getSupportedAnalysisTasks()
			.then((supportedList: Array<ETargetType>) => {
				this.setState({
					supportedTaskList: supportedList
				});
				// Config.initSupportedAnalysisTasks(supportedList);
				// const resultsViewMode =
				// 	supportedList.length > 0
				// 		? EStructuralItemResultsViewMode.ListMode
				// 		: EStructuralItemResultsViewMode.MapMode;
				// this.props[SearchResultPageActionsCreator.setResultsViewMode](
				// 	resultsViewMode
				// );
				// @NOTE: 只有在没有支持的情况下，才修改显示模式
				if (supportedList.length === 0) {
					this.props[SearchResultPageActionsCreator.setResultsViewMode](
						EStructuralItemResultsViewMode.MapMode
					);
				}
			})
			.catch((error: Error) => {
				console.error(error);
				// 显示默认
			});
	}

	/**
	 *用state设置和 请求
	 *@returns {void}
	 * @param {any} states states
	 */
	_commonSetStates = (states: any) => {
		this.setState(states);
	};

	//--------------------target type nav 组件回调  begin-------------------//
	onChangeTaskType = (selectedType: ETargetType) => {
		this.setState(
			{
				currentSelectedType: selectedType
			},
			() => {
				this.props.history.push({
					pathname: `${this.props.match.url}/${selectedType}`
				});
			}
		);
	};

	onChangeViewMode = (viewMode: EStructuralItemResultsViewMode) => {
		// this.setState({
		// 	resultsViewMode: viewMode
		// });
		this.props[SearchResultPageActionsCreator.setResultsViewMode](viewMode);
		const { centerPointOpt } = this.state;
		if (centerPointOpt) {
			this.setState({
				centerPointOpt: null
			});
		}
	};

	//--------------------target type nav 组件回调  end-------------------//

	//--------------------以上是组件state更新以及请求数据方法-------------------//

	/**
	 * 取消上一页面的批量选择查看
	 * @returns {void}
	 */
	handleCancelSelectedFiles = () => {
		//
	};

	/**
	 * 选择source 类型 实时视频、离线视频、批量图下的某个文件
	 * @param {Array<IFUniqueDataSource>} searchRange searchRange
	 * @param {IFTreeNode} node 当前节点
	 * @param {Function} filter 过滤函数
	 * @returns {void}
	 */
	handleSelectedFile = (
		searchRange: Array<IFUniqueDataSource>,
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.updateSearchRangeNode(node, filter);
		this.updateSearchRange(searchRange);
	};

	/**
	 * 选择source 类型 实时视频、离线视频、批量图片
	 *@returns {void}
	 * @param {Array<IFUniqueDataSource>} searchRange searchRange
	 * @param {IFTreeNode<any>} node 节点
	 * @param {Function} filter 过滤函数
	 * @param {boolean} isNull 是否为空
	 */
	handleSelectedSourceType = (
		searchRange: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.updateSearchRangeNode(node, filter);
		this.updateSearchRange(searchRange);
	};

	/**
	 * 选择某个类型为空的回调
	 * @param {IFTreeNode} node node
	 * @param {Function} filter 过滤函数
	 * @memberof SearchResultPage
	 * @returns {void}
	 */
	selectedEmptyType = (
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.updateSearchRangeNode(node, filter);
		this.updateSearchEmptyRange();
	};

	/**
	 * 点击删除上传照片
	 * @param {IFStructuralInfo} fileInfo fileInfo
	 * @param {number} index index
	 * @returns {void}
	 * @memberof SearchResultPage
	 */
	handleDeleteimage = (fileInfo: IFStructuralInfo, index: number) => {
		let copy = [...this.props.searchTargetList];
		copy.splice(index, 1);
		this.updateSearchTargetList(copy);
	};

	/**
	 * 获得有效的搜索目标列表（排除了unknown)
	 * @param {*} [list=this.props.searchTargetList] 全部的搜索目标列表
	 * @returns {Array<IFStructuralInfo>} 有效的搜索目标列表
	 * @memberof SearchResultPage
	 */
	getValidSearchTargetList(
		list = this.props.searchTargetList
	): Array<IFStructuralInfo> {
		let result: Array<IFStructuralInfo> = [];
		for (let target of list) {
			if (target.targetType !== ETargetType.Unknown) {
				result.push(target);
			}
		}

		return result;
	}

	/**
	 *获取页面拖拽文件
	 * @param {IFStructuralInfo} structuralInfo structuralInfo
	 * @returns {void}
	 */
	onDropStructuralInfo = (structuralInfo: IFStructuralInfo) => {
		switch (structuralInfo.targetType) {
			case ETargetType.Face:
			case ETargetType.Body:
			case ETargetType.Unknown:
				break;

			default: {
				message.warn(
					intl
						.get('SEARCH_RESULT_SUPPORTED_TARGET_TYPE')
						.d(`只能搜索人脸/人体图片`)
				);
				return;
			}
		}

		if (this.props.searchTargetList.length >= this.state.maxStructuralCount) {
			// 打开新的一个页面
			// saveStructuralInfoMemo([structuralInfo]);
			// window.open(`${this.props.match.url}/search/result`);
			message.warn(
				intl
					.get('SEARCH_RESULT_MAX_TARGETS_TIP', {
						count: this.state.maxStructuralCount
					})
					.d(`最多只能同时搜索${this.state.maxStructuralCount}张图片`)
			);
		} else {
			let validTargetLists: Array<
				IFStructuralInfo
			> = this.getValidSearchTargetList();
			// 判断一下类型是否一致
			if (
				this.props.searchTargetList.length === 0 ||
				validTargetLists.length === 0
			) {
				// TODO: 更新
				this.updateSearchTargetList([structuralInfo]);
			} else {
				let type = validTargetLists[0].targetType;
				if (type !== structuralInfo.targetType) {
					message.warn(
						intl
							.get('SEARCH_RESULT_UNCOMPANTABLE_TARGETLIST')
							.d('搜索目标的类型不一致')
					);
				} else {
					let targetList = [...this.props.searchTargetList];
					targetList.unshift(structuralInfo);
					this.updateSearchTargetList(targetList);
				}
			}
		}
	};

	/*************************** 搜索目标组件的回调 begin ***************************/

	/**
	 * 开始上传
	 * @returns {void}
	 */
	startUpload = () => {
		this.setState({
			uploading: true,
			isNoData: false
		});
		this.props[SearchResultPageActionsCreator.setIsUploading](true);
	};
	/**
	 * 上传成功
	 * @returns {void}
	 */
	uploadSuccess = () => {
		this.setState({
			uploading: false
		});
		this.props[SearchResultPageActionsCreator.setIsUploading](false);
	};
	/**
	 * 上传失败
	 * @param {Error} error error
	 * @returns {void}
	 */
	uploadFail = (error: Error) => {
		this.setState({
			uploading: false
			// isNoData: true
		});

		message.error(error.message);
		console.error(error);

		this.props[SearchResultPageActionsCreator.setIsUploading](false);
	};

	autoTabIfNeed(newStructuralList: Array<IFStructuralInfo> = []) {
		let allStructuralList = [...this.props.searchTargetList];
		allStructuralList.unshift(...newStructuralList);
		let validTargetLists: Array<
			IFStructuralInfo
		> = this.getValidSearchTargetList(allStructuralList);

		if (newStructuralList.length === 0) {
			return;
		}

		let structuralInfo: IFStructuralInfo = newStructuralList[0];
		// 切换到对应的tab

		//
		if (
			this.props.searchTargetList.length === 0 || // 采集 -> 搜索
			validTargetLists.length !== allStructuralList.length || // 是否有无效类型的图片
			this.memoTemp.length || // this.memoTemp 针对点击大图快速检索情况
			this.state.carDragFace
		) {
			if (
				structuralInfo.targetType !== ETargetType.Unknown &&
				this.state.supportedTaskList.indexOf(structuralInfo.targetType) !== -1
			) {
				switch (structuralInfo.targetType) {
					case ETargetType.Face: {
						// if (!this.isFaceItemActive()) {
						this.onChangeTaskType(structuralInfo.targetType);
						// }
						break;
					}

					case ETargetType.Body: {
						// if (!this.isBodyItemActive()) {
						this.onChangeTaskType(structuralInfo.targetType);
						// }
						break;
					}

					default:
						break;
				}
			} else {
				// 其他情况默认当作人脸
				this.onChangeTaskType(ETargetType.Face);
			}
		}
	}

	/**
	 * 上传图片检测
	 * @return {void}
	 * @param {IFDetectedStructualInfo} detectResult detectResult
	 * @param {Partial<IFDetectOptions>} options options
	 */
	onDetectStructuralInfo = (
		detectResult: IFDetectedStructualInfo,
		options: Partial<IFDetectOptions>
	) => {
		if (
			detectResult.faces + detectResult.bodys > 1 ||
			detectResult.faces + detectResult.bodys === 0 // 二期强制搜索逻辑
		) {
			// 多结构对象
			let handle = MultiStructuralUploadPreviewer.show({
				originalImageId: detectResult.id,
				originalImageUrl: detectResult.uri,
				title: options.title || '',
				maxCount:
					this.state.maxStructuralCount - this.props.searchTargetList.length,
				onClose: function onClose() {
					handle.destory();
				},
				onOk: (list: Array<IFStructuralInfo>) => {
					let validSearchTargets: IFStructuralInfo[] = this.getValidSearchTargetList();
					if (
						validSearchTargets.length === 0 ||
						validSearchTargets[0].targetType === list[0].targetType
					) {
						if (list.length === 0) {
							message.warn(intl.get('sssssssssss').d('没有检测到数据'));
							return;
						}

						this.autoTabIfNeed(list);

						this.addNewStructuralList(list);

						handle.destory();
					} else {
						message.warn(
							intl
								.get('ONLIY_ONE_IMAGE_TYPE')
								.d('只能上传与第一张类型相同的的人脸图或人体图')
						);
					}
				}
			});
		} else if (detectResult.faces + detectResult.bodys === 1) {
			CollectionResourceRequest.getStructuralInfoFromOriginalImageId(
				detectResult.id,
				[ETargetType.Face, ETargetType.Body]
			)
				.then((list: Array<IFStructuralInfo>) => {
					let validSearchTargets: IFStructuralInfo[] = this.getValidSearchTargetList();
					if (
						validSearchTargets.length === 0 ||
						validSearchTargets[0].targetType === list[0].targetType
					) {
						if (list.length === 0) {
							message.warn(intl.get('sssssssssss').d('没有检测到数据'));
							return;
						}
						this.autoTabIfNeed(list);
						this.addNewStructuralList(list);
					} else {
						message.warn(
							intl
								.get('ONLIY_ONE_IMAGE_TYPE')
								.d('只能上传与第一张类型相同的的人脸图或人体图')
						);
					}
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		}
	};

	addNewStructuralList(newStructuralList: Array<IFStructuralInfo>) {
		this.updateSearchTargetList([
			...newStructuralList,
			...this.props.searchTargetList
		]);
	}

	/*************************** 搜索目标组件的回调 end ***************************/

	//--------------------以上是组件上传、拖拽图片搜索相关方法-------------------//

	onRefresh = () => {
		this.props[AttributeFilterPanelActionCreators.updateTodayEndTimeIfNeeded]();
		this.props[SearchResultPageActionsCreator.forceUpdate]();
	};

	onViewVideo = (deviveId: string) => {
		this.props.history.push(`/structuralize/livevedio/${deviveId}`);
	};

	/**************************************渲染方法相关 begin *************************************/

	_findStructuralItemInfoIndex = (
		itemInfo: IFStructuralInfo,
		resultList: Array<IFStructuralInfo>
	) => {
		let index = 0;
		index = resultList.findIndex((item) => {
			return item.uuid === itemInfo.uuid;
		});
		return index;
	};

	render() {
		const {
			uploading,
			viewMode,
			selectedSourceRange,
			currentSelectedType
		} = this.state;

		//
		let isSearchFace =
			isSearchMode(
				this.state.currentSelectedType,
				this.props.searchTargetList
			) &&
			this.props.searchTargetList.reduce(
				(previosValue: boolean, currentValue: IFStructuralInfo) => {
					if (
						currentValue.targetType !== ETargetType.Face &&
						currentValue.targetType !== ETargetType.Unknown
					) {
						return false;
					} else {
						return true;
					}
				},
				true
			);

		let needShowSearchTargetComponents: boolean =
			isSearchFace || currentSelectedType !== ETargetType.Vehicle;

		return (
			<div className={`${ModuleStyle['search-result-wrap']}`}>
				<Layout style={{ height: '100%' }}>
					<Sider width={264}>
						{needShowSearchTargetComponents && (
							<SearchUploadPanel
								structualItemList={this.props.searchTargetList}
								onDetectStructuralInfo={this.onDetectStructuralInfo}
								deletable={true}
								onDelete={this.handleDeleteimage}
								onDropStructuralInfo={this.onDropStructuralInfo}
								onStartLoadFile={this.startUpload}
								onFinishedLoadFile={this.uploadSuccess}
								onLoadFileError={this.uploadFail}
							/>
						)}
						<SearchSourceRangePanel
							viewMode={viewMode}
							selectedNodes={[this.props.currentSearchNode]}
							searchTargetList={this.props.searchTargetList}
							currentTargetType={this.state.currentSelectedType}
							outControlDataSource={selectedSourceRange}
							filesSelectedCancel={this.handleCancelSelectedFiles}
							selectedFileSourceTypeHandle={this.handleSelectedSourceType}
							onSelectedSourceItemList={this.handleSelectedFile}
							selectedEmptyType={this.selectedEmptyType}
							// NOTE: 根据不同的模式来区分(故意的)
							statisticsInfos={
								isSearchMode(
									this.state.currentSelectedType,
									this.props.searchTargetList
								)
									? this.props.statisticsInfos
									: null
							}
							resultsViewMode={this.props.resultsViewMode}
							onRefresh={this.onRefresh}
							onViewVideo={this.onViewVideo}
						/>
					</Sider>
					<Content
						style={{
							position: 'relative',
							display: 'flex',
							flexDirection: 'column',
							overflowY: 'hidden',
							zIndex: 0
						}}
					>
						<TargetTypeNavigationBar
							className={ModuleStyle['target-type-nav-bar']}
							searchRange={this.props.searchRange}
							supportedTargetTypes={this.state.supportedTaskList}
							onClickTargetType={this.onChangeTaskType}
							viewMode={this.props.resultsViewMode}
							onChangeViewMode={this.onChangeViewMode}
							style={{}}
							currentSelectedType={this.state.currentSelectedType}
						/>
						<AttributeFilterPanel
							currentTargetType={this.state.currentSelectedType}
							viewMode={this.props.resultsViewMode}
						/>
						<div className={`${ModuleStyle['result-show-container']}`}>
							{this.props.resultsViewMode ===
							EStructuralItemResultsViewMode.ListMode ? (
								<Switch>
									{this.state.supportedTaskList.indexOf(ETargetType.Face) !==
										-1 && (
										<AuthVerifyRoute
											path={`${this.props.match.url}/${ETargetType.Face}`}
											component={FaceResultsPanel}
										/>
									)}
									{this.state.supportedTaskList.indexOf(ETargetType.Body) !==
										-1 && (
										<AuthVerifyRoute
											path={`${this.props.match.url}/${ETargetType.Body}`}
											component={BodyResultsPanel}
										/>
									)}
									{this.state.supportedTaskList.indexOf(ETargetType.Vehicle) !==
										-1 && (
										<AuthVerifyRoute
											path={`${this.props.match.url}/${ETargetType.Vehicle}`}
											component={VehicleResultsPanel}
										/>
									)}
									<Route
										render={(props) => {
											if (
												this.state.supportedTaskList.indexOf(
													ETargetType.Face
												) !== -1
											) {
												return (
													<Redirect
														to={{
															pathname: `${props.match.url}/${ETargetType.Face}`
														}}
													/>
												);
											} else if (
												this.state.supportedTaskList.indexOf(
													ETargetType.Body
												) !== -1
											) {
												return (
													<Redirect
														to={{
															pathname: `${props.match.url}/${ETargetType.Body}`
														}}
													/>
												);
											} else if (
												this.state.supportedTaskList.indexOf(
													ETargetType.Vehicle
												) !== -1
											) {
												return (
													<Redirect
														to={{
															pathname: `${props.match.url}/${
																ETargetType.Vehicle
															}`
														}}
													/>
												);
											} else {
												return null;
											}
										}}
									/>
								</Switch>
							) : null}
							{this.props.resultsViewMode ===
							EStructuralItemResultsViewMode.MapMode ? (
								<MapViewContainer
									showBodyRelatedWithFace={this.props.showBodyRelatedWithFace}
									showFaceRelatedWithBody={this.props.showFaceRelatedWithBody}
									showVehicleRelatedWithFace={
										this.props.showVehicleRelatedWithFace
									}
									centerPointOpt={this.state.centerPointOpt}
									statisticsInfos={this.props.statisticsInfos}
									currentTargetType={this.state.currentSelectedType}
									// searchTargetList={this.props.searchTargetList}
									// searchRange={this.props.searchRange}
									// selectedAttributeList={this.props.selectedAttributeList}
									faceResultMergeType={this.props.faceResultMergeType}
									bodyResultMergeType={this.props.bodyResultMergeType}
									bodyThreshold={this.props.bodyThreshold}
									faceThreshold={this.props.faceThreshold}
									startDate={this.props.startDate}
									endDate={this.props.endDate}
									// updateStaticInfos={this.updateStaticInfos}
									allPoints={this.props.allPointsArr}
									onViewLive={this.onViewVideo}
								/>
							) : null}
						</div>
						{uploading && (
							<div className={ModuleStyle['uploading-container']}>
								<div className={ModuleStyle['uploading']}>
									<Loading
										show={true}
										tip={intl.get('IMAGE_UPLOADING').d('图片上传分析中')}
									/>
								</div>
							</div>
						)}
					</Content>
				</Layout>
			</div>
		);
	}

	/************************************** redux方法 start*************************************/

	updateSearchTargetList(targetList: Array<IFStructuralInfo>) {
		this.props[SearchResultPageActionsCreator.updateSearchTargetList](
			targetList
		);
	}

	updateSearchRange(searchRange: Array<IFUniqueDataSource>) {
		this.props[SearchResultPageActionsCreator.updateSearchRange](searchRange);
	}

	updateRootSearchRange(searchRange: Array<IFUniqueDataSource>) {
		this.props[SearchResultPageActionsCreator.updateRootSearchRange](
			searchRange
		);
	}

	updateSearchEmptyRange() {
		this.props[SearchResultPageActionsCreator.updateSearchEmptyRange]();
	}

	updateStaticInfos = (data: Array<IFSearchStatisticInfo> | null) => {
		this.props[SearchResultPageActionsCreator.updateStatisticsInfos](data);
	};

	updateSearchRangeNode = (
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.props[SearchResultPageActionsCreator.updateSearchNode](node, filter);
	};

	updateSearchRangeRootNode = (node: IFTreeNode<any>) => {
		this.props[SearchResultPageActionsCreator.updateSearchRangeRootNode](node);
	};

	/************************************** redux方法 end*************************************/
}

/**************************************渲染方法相关 end *************************************/

// export default withRouter(SearchResultPage);

// 连接到redux

function mapStateToProps(state) {
	return {
		searchTargetList:
			state[SearchResultPageActionsCreator.reducerName].searchTargetList,
		searchRange: state[SearchResultPageActionsCreator.reducerName].searchRange,
		isSearchAllWhenSearchRangeEmpty:
			state[SearchResultPageActionsCreator.reducerName]
				.isSearchAllWhenSearchRangeEmpty,
		statisticsInfos:
			state[SearchResultPageActionsCreator.reducerName].statisticsInfos,
		allPointsArr:
			state[SearchResultPageActionsCreator.reducerName].allPointsArr,
		centerPoint: state[SearchResultPageActionsCreator.reducerName].centerPoint,
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
		resultsViewMode:
			state[SearchResultPageActionsCreator.reducerName].resultsViewMode,

		// v1.2.0 start
		currentSearchNode:
			state[SearchResultPageActionsCreator.reducerName].currentSearchNode // 当前选中的节点
		// v1.2.0 end
	};
}

const mapDispatchToProps = {
	[SearchResultPageActionsCreator.updateSearchTargetList]:
		SearchResultPageActionsCreator.updateSearchTargetList,
	[SearchResultPageActionsCreator.updateSearchRange]:
		SearchResultPageActionsCreator.updateSearchRange,
	[SearchResultPageActionsCreator.updateRootSearchRange]:
		SearchResultPageActionsCreator.updateRootSearchRange,
	[SearchResultPageActionsCreator.updateSearchEmptyRange]:
		SearchResultPageActionsCreator.updateSearchEmptyRange,
	[SearchResultPageActionsCreator.updateStatisticsInfos]:
		SearchResultPageActionsCreator.updateStatisticsInfos,
	[SearchResultPageActionsCreator.getAllCameraInfos]:
		SearchResultPageActionsCreator.getAllCameraInfos,
	[SearchResultPageActionsCreator.setResultsViewMode]:
		SearchResultPageActionsCreator.setResultsViewMode,
	[SearchResultPageActionsCreator.setIsUploading]:
		SearchResultPageActionsCreator.setIsUploading,
	[SearchResultPageActionsCreator.forceUpdate]:
		SearchResultPageActionsCreator.forceUpdate,
	[SearchResultPageActionsCreator.updateSearchNode]:
		SearchResultPageActionsCreator.updateSearchNode,
	[SearchResultPageActionsCreator.updateSearchRangeRootNode]:
		SearchResultPageActionsCreator.updateSearchRangeRootNode,
	[AttributeFilterPanelActionCreators.updateTodayEndTimeIfNeeded]:
		AttributeFilterPanelActionCreators.updateTodayEndTimeIfNeeded
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchResultPage);
