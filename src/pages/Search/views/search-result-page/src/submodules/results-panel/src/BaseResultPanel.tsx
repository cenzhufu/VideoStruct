import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import {
	IFStructuralLinkInfo,
	IFStructuralInfo,
	ETargetType,
	ListType,
	EMerge,
	DateFormat,
	IFAttributeProperty,
	EConfidenceValue,
	ESourceType,
	IFTreeNode
} from 'stsrc/type-define';

import {
	IFUniqueDataSource,
	CollectionAnalysisResultRequest
} from 'stsrc/utils/requests/collection-request';
import IFRequest, { IFCancelTokenSource } from 'ifvendors/utils/requests';
import { NoNeedTipError } from 'stsrc/utils/errors';
import { message } from 'antd';
import {
	SearchService,
	IFSearchResult,
	IFSearchStatisticInfo
} from 'stsrc/utils/requests/search-service-requeests';
import { SearchOptions } from 'stsrc/utils/requests/search-service-requeests/search-request';
import * as moment from 'moment';
import { DataServerRequests } from 'stsrc/utils/requests/data-server-requests';
import { isSearchMode } from 'stsrc/utils/search-utils';
import { CSearchAllNode } from '../../../redux/reduces/search-result-page.reduces';
import { getSearchRequestOption } from 'stsrc/utils/search-utils/get-search-options';

const isEqual = require('lodash/isEqual');

interface PropsType {
	// 路由带过来的props(connect)
	// match: match;
	// history: H.History;
	// location: H.Location;

	autoUpdate: boolean; // 是否自动启用一分钟更新一次的逻辑
	onlyNeedStatisticsInfoRequest: boolean; // 是否只要统计的请求（只用在地图模式）

	/************ 搜索参数 start ************/
	currentTargetType: ETargetType;
	searchTargetList: Array<IFStructuralInfo>; // 搜索目标
	searchRange: Array<IFUniqueDataSource>; // 搜索范围
	searchRootRange: Array<IFUniqueDataSource>; // 搜索范围
	isSearchAllWhenSearchRangeEmpty: boolean; // 搜索范围为空使表示搜索全部，还是搜索空, true表示搜索全部

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

	searchResultFilter: (item: IFStructuralLinkInfo) => boolean;

	updatedTime: number; // 更新的时间戳

	searchTargetTypes: Array<ETargetType>;
	updateStatisticsInfos: (
		statisticsInfos: Array<IFSearchStatisticInfo> | null
	) => void;
	updateSearchRangeRootNode: (node: IFTreeNode<any>) => void;
	updateSearchRootRange: (range: IFUniqueDataSource[]) => void;
	currentSearchNode: IFTreeNode<any>; // 当前选中的搜索范围节点
	currentSearchRootNode: IFTreeNode; // 当前批次搜索的根节点
	render: (
		resultsList: Array<IFStructuralLinkInfo>,
		showFaceRelative: boolean, // 是否显示关联的人体信息
		loadMore: () => void, // 加载更多回调
		hasMore: boolean,
		isFirstLoading: boolean, // 是否第一次加载
		isLoadingMore: boolean, // 是否加载更多
		currentTargetType: ETargetType,
		searchTargetType: ETargetType,
		isSearchMode: boolean // 是否搜索模式
	) => React.ReactNode;
}

interface StateType {
	resultsList: Array<IFStructuralLinkInfo>;

	preSearchTargetList: Array<IFStructuralInfo>;

	// currentTargetType: ETargetType;

	page: number;
	pageSize: number;

	hasMore: boolean;
	isFirstLoading: boolean; // 是否第一次加载
	total: number;
	isLoadingMore: boolean; // 是否加载更多

	showRelative: boolean;
}

class BaseResultPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		autoUpdate: true,
		onlyNeedStatisticsInfoRequest: false,
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
		searchTargetTypes: [ETargetType.Face, ETargetType.Body],
		render: () => null,
		updateSearchRangeRootNode: () => {},
		updateSearchRootRange: () => {},
		currentSearchNode: CSearchAllNode,
		currentSearchRootNode: CSearchAllNode,
		searchResultFilter: () => true,
		updatedTime: Date.now()
	};
	_source: IFCancelTokenSource | null; // 请求取消handle
	_sourceTotal: IFCancelTokenSource | null; // 请求取消handle
	_isUnmounted: boolean;

	_timer: number | null;
	constructor(props: PropsType) {
		super(props);
		this.state = {
			resultsList: [],
			page: 1,
			pageSize: 200,

			hasMore: true,
			isFirstLoading: false,
			total: 0,
			isLoadingMore: false,
			showRelative: false,

			preSearchTargetList: [...props.searchTargetList]
			// currentTargetType: ETargetType.Unknown
		};

		this._source = null;
		this._sourceTotal = null;

		this._timer = null;
	}

	componentDidMount() {
		this._isUnmounted = false;
		if (this.props.autoUpdate) {
			this._timer = window.setInterval(this.updateResultTime, 60 * 1000);
		}

		this.getResults(false);
	}

	componentWillUnmount() {
		this._isUnmounted = true;
		this._cancleRequest();
		this._cancelTotalRequest();

		if (this._timer) {
			window.clearInterval(this._timer);
		}
	}

	updateResultTime = () => {
		this.setState((prevState: StateType) => {
			let listCopy = [...prevState.resultsList];
			for (let i = 0; i < listCopy.length; i++) {
				if (listCopy[i].face) {
					listCopy[i].face = this.addOneMinuteToData(listCopy[i].face);
				}
				if (listCopy[i].body) {
					listCopy[i].body = this.addOneMinuteToData(listCopy[i].body);
				}
				if (listCopy[i].vehicle) {
					listCopy[i].vehicle = this.addOneMinuteToData(listCopy[i].vehicle);
				}
			}

			return {
				resultsList: listCopy
			};
		});
	};

	addOneMinuteToData(info?: IFStructuralInfo) {
		if (!info) {
			return undefined;
		}
		return {
			...info,
			updateTime: moment().format(DateFormat) // 通过这个去刷新页面
		};
	}

	componentDidUpdate(prevProps: PropsType, prevState: StateType) {
		// 强制刷新
		if (this.props.updatedTime !== prevProps.updatedTime) {
			this.getResults(false, false);
			return;
		}

		// 判断一下是否只是显示相关图片的字段变化了
		let currentAttributes = this.props.selectedAttributeList.filter(
			(item: IFAttributeProperty) => {
				return item.targetType === this.props.currentTargetType;
			}
		);

		let prevAttributets = prevProps.selectedAttributeList.filter(
			(item: IFAttributeProperty) => {
				return item.targetType === this.props.currentTargetType;
			}
		);

		// 检索范围，检索目标, 属性发生了变化

		if (
			!isEqual(this.props.searchTargetList, prevProps.searchTargetList) ||
			!isEqual(currentAttributes, prevAttributets)
		) {
			// 触发请求
			this.getResults(false, true);
			return;
		}

		// 其他属性(FIXME: 判断threshold与targetType)
		if (
			this.props.startDate !== prevProps.startDate ||
			this.props.endDate !== prevProps.endDate ||
			this.props.attributeAccuracy !== prevProps.attributeAccuracy ||
			this.props.faceThreshold !== prevProps.faceThreshold ||
			this.props.bodyThreshold !== prevProps.bodyThreshold ||
			this.props.faceResultMergeType !== prevProps.faceResultMergeType ||
			this.props.bodyResultMergeType !== prevProps.bodyResultMergeType ||
			this.props.currentTargetType !== prevProps.currentTargetType ||
			this.props.isSearchAllWhenSearchRangeEmpty !==
				prevProps.isSearchAllWhenSearchRangeEmpty
		) {
			//
			this.getResults(false, true);
			return;
		}

		if (!isEqual(this.props.searchRange, prevProps.searchRange)) {
			// 触发请求
			this.getResults(false, false);
			return;
		}
	}

	getValidSearchTargetList(): Array<IFStructuralInfo> {
		let result: Array<IFStructuralInfo> = [];
		for (let target of this.props.searchTargetList) {
			if (target.targetType !== ETargetType.Unknown) {
				result.push(target);
			}
		}

		return result;
	}

	/**
	 * 取消之前发的同一个未完成的请求
	 * @returns {void}
	 */
	_cancleRequest = () => {
		if (this._source) {
			this._source.cancel();
			this._source = null;
		}
	};

	_cancelTotalRequest() {
		if (this._sourceTotal) {
			this._sourceTotal.cancel();
			this._sourceTotal = null;
		}
	}

	/**
	 * 获取结果
	 * @memberof SearchResultPage
	 * @param {boolean} [add = false] 是否新增
	 * @param {boolean} [resetSearchRootNode = false] 是否要重新设置搜索的根节点
	 * @returns {void}
	 */
	getResults = (add: boolean = false, resetSearchRootNode: boolean = true) => {
		this._cancleRequest();
		this._cancelTotalRequest();
		//查看最近解析任务
		if (
			!isSearchMode(this.props.currentTargetType, this.props.searchTargetList)
		) {
			this._getAnalysisTaskResult(add); // 任务分析
		} else {
			if (
				resetSearchRootNode ||
				!this.isSelfNodeOrChildNode(
					this.props.currentSearchNode,
					this.props.currentSearchRootNode
				)
			) {
				// 重设搜索root 对应的范围
				this.props.updateSearchRootRange(this.props.searchRange);
				// 重设搜索root node
				this.props.updateSearchRangeRootNode(this.props.currentSearchNode);

				this._getSearchResult(add, this.props.searchRange); // 检索
			} else {
				// 过滤
				console.log('----------------------------过滤');
				this._getSearchResult(add, this.props.searchRootRange, 1000); // 检索(过滤情况下，pageSize设置1000,防止数据在第二，第三页的情况)
			}
		}
	};

	isSelfNodeOrChildNode(
		currentNode: IFTreeNode,
		rootNode: IFTreeNode
	): boolean {
		if (!currentNode || !rootNode) {
			return false;
		}

		// 自身(后台分表会导致id重复， 比如说id为1的区域和id为1的设备)
		if (currentNode.uuid === rootNode.uuid) {
			return true;
		}

		let parent: IFTreeNode | null = currentNode.parent;
		while (parent) {
			if (parent.uuid === rootNode.uuid) {
				return true;
			}

			parent = parent.parent;
		}

		return false;
	}

	/**
	 * 搜索为空
	 * @returns {boolean} true表示搜索空
	 * @memberof BaseResultPanel
	 */
	isSearchEmpty(): boolean {
		if (
			this.props.searchRange.length === 0 &&
			!this.props.isSearchAllWhenSearchRangeEmpty
		) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 默认页面获取分析任务树列表
	 *  @param {boolean} [add = false] 是否新增
	 * @returns {void}
	 */
	_getAnalysisTaskResult = (add: boolean = false) => {
		this.setState(
			(prevState: StateType) => {
				return {
					isFirstLoading: add ? false : true,
					isLoadingMore: add,
					page: add ? prevState.page : 1,
					resultsList: add ? prevState.resultsList : []
				};
			},
			() => {
				if (this.isSearchEmpty()) {
					this.updateStatisticsInfos(null); // 采集需要重置
					this.setState({
						resultsList: [],
						total: 0,
						isFirstLoading: false,
						isLoadingMore: false,
						// hasMore: res.total > totalList.length
						hasMore: false
					});
				} else {
					if (this.props.onlyNeedStatisticsInfoRequest) {
						// 获取采集下的摄像头统计量
						this._getCaptureCameraStatisticsInfos();
					} else {
						this._getCaptureResults(add).then(() => {
							// 在正常采集下，我们不获取统计量
							this.updateStatisticsInfos(null); // 采集需要重置
							// 获取采集下的摄像头统计量
							// this._getCaptureCameraStatisticsInfos();
						});
					}
				}
			}
		);
	};

	_getCaptureResults(add: boolean = false): Promise<void> {
		this._source = IFRequest.getCancelSource();
		return CollectionAnalysisResultRequest.getAnalysisResult(
			{
				startDate: this.props.startDate,
				endDate: this.props.endDate,
				attributeAccuracy: this.props.attributeAccuracy,
				selectedAttributes: this.props.selectedAttributeList,
				faceThreshold: this.props.faceThreshold, // 这个值传了也没用
				bodyThreshold: this.props.bodyThreshold,

				sources: this.props.searchRange,
				page: this.state.page,
				pageSize: this.state.pageSize,
				targetTypes: [this.props.currentTargetType],
				currentTargetType: this.props.currentTargetType // 为了防止在componetDidMount阶段getNewParams的返回的字段不一样
			},
			{
				//@ts-ignore
				cancelToken: this._source.token
			}
		)
			.then((res: ListType<IFStructuralLinkInfo>) => {
				if (!this._isUnmounted) {
					this._cancleRequest();

					this.setState((prevState: StateType) => {
						let totalList = add
							? [...prevState.resultsList, ...res.list]
							: res.list;
						return {
							resultsList: totalList,
							total: res.total,
							isFirstLoading: false,
							isLoadingMore: false,
							// hasMore: res.total > totalList.length
							hasMore: res.list.length >= prevState.pageSize // 在返回的的数据比分页的数量大或者相等时，认为还有更多
						};
					});
				}
				return;
			})
			.catch((error) => {
				if (!this._isUnmounted) {
					this.setState({
						isFirstLoading: false,
						isLoadingMore: false
					});
				}
				if (IFRequest.isCancel(error)) {
					console.warn('Request canceled!');
					return;
				}

				console.error(error);
				if (error instanceof NoNeedTipError) {
					// do nothing
				} else {
					message.error(error.message);
				}
			});
	}

	_getCaptureCameraStatisticsInfos() {
		this._sourceTotal = IFRequest.getCancelSource();
		DataServerRequests.getSourceIdStatisticsResult(
			{
				page: 1,
				pageSize: 100000000,
				sourceType: ESourceType.Camera,
				targetTypes: [this.props.currentTargetType],
				startDate: this.props.startDate,
				endDate: this.props.endDate,
				attributeAccuracy: this.props.attributeAccuracy,
				selectedAttributes: this.props.selectedAttributeList,
				faceThreshold: this.props.faceThreshold,
				bodyThreshold: this.props.bodyThreshold,
				currentTargetType: this.props.currentTargetType
			},
			{
				cancelToken: this._sourceTotal.token
			}
		)
			.then((statisticsRes: IFSearchStatisticInfo[]) => {
				this._cancelTotalRequest();
				this.updateStatisticsInfos(statisticsRes);
			})
			.catch((error: Error) => {
				if (IFRequest.isCancel(error)) {
					console.warn('Request canceled!');
					return;
				}
				console.error(error);
			});
	}

	_getSearchStatisticsInfos() {
		this._sourceTotal = IFRequest.getCancelSource();
		SearchService.getSearchStatisticsInfoParams(
			this.getValidSearchTargetList(),
			this.props.selectedAttributeList,
			this._getSearchRequestOption(1000, [this.props.currentTargetType]),
			{
				cancelToken: this._sourceTotal.token
			}
		)
			.then((res: Array<IFSearchStatisticInfo>) => {
				this.updateStatisticsInfos(res);
			})
			.catch((error: Error) => {
				console.error(error);
				// message.error(error.message);
			});
	}

	_getSearchDataResult(
		add: boolean = false,
		searchRange: IFUniqueDataSource[],
		pageSize: number = this.state.pageSize
	): Promise<void> {
		this._source = IFRequest.getCancelSource();

		//获取搜索全部时的统计数据
		return SearchService.getSearchResultsParams(
			this.getValidSearchTargetList(),
			searchRange, // 改为根的搜索范围， 子节点采用过滤的形式
			this.props.selectedAttributeList,
			this._getSearchRequestOption(pageSize, this.props.searchTargetTypes),
			{
				//@ts-ignore
				cancelToken: this._source.token
			}
		)
			.then((res: IFSearchResult) => {
				this._cancleRequest();
				// 统计数据
				let statisticsInfos: IFSearchStatisticInfo[] = res.staticInfos;
				this.updateStatisticsInfos(statisticsInfos);
				if (!this._isUnmounted) {
					this.setState((prevState: StateType) => {
						console.log(res.results.list.filter(this.props.searchResultFilter));

						let totalList = add
							? [
									...prevState.resultsList,
									...res.results.list.filter(this.props.searchResultFilter) // 全部都走过滤
							  ]
							: res.results.list.filter(this.props.searchResultFilter);
						return {
							resultsList: totalList,
							total: res.results.total,
							isFirstLoading: false,
							isLoadingMore: false,
							hasMore: res.results.total > totalList.length
						};
					});
				}

				return Promise.resolve();
			})
			.catch((error) => {
				this.updateStatisticsInfos([]); // 出错了表明没有
				if (IFRequest.isCancel(error)) {
					console.log('Request canceled!');
					return;
				}
				if (!this._isUnmounted) {
					this.setState({
						isFirstLoading: false,
						isLoadingMore: false
					});
				}

				console.error(error);
				if (error instanceof NoNeedTipError) {
					// do nothing
				} else {
					message.error(error.message);
				}
			});
	}

	_getSearchRequestOption(
		pageSize: number = 200,
		targets: Array<ETargetType> = this.props.searchTargetTypes
	): Partial<SearchOptions> {
		return getSearchRequestOption({
			faceThreshold: this.props.faceThreshold,
			bodyThreshold: this.props.bodyThreshold,
			faceResultMergeType: this.props.faceResultMergeType,
			bodyResultMergeType: this.props.bodyResultMergeType,
			startDate: this.props.startDate,
			endDate: this.props.endDate,
			searchTargetList: this.props.searchTargetList,
			pageSize: pageSize,
			page: pageSize === 1000 ? 1 : this.state.page,
			currentTargetType: this.props.currentTargetType,
			targets: targets
		});

		// // 获得搜索的主
		// let mainType: ETargetType = getSearchMainType(this.props.searchTargetList);

		// let eMergetype =
		// 	mainType === ETargetType.Face
		// 		? this.props.faceResultMergeType
		// 		: this.props.bodyResultMergeType;

		// // let targets = this.props.searchTargetTypes;

		// let threshold = 0;
		// switch (mainType) {
		// 	case ETargetType.Face:
		// 		threshold = this.props.faceThreshold;
		// 		break;

		// 	case ETargetType.Body:
		// 		threshold = this.props.bodyThreshold;
		// 		break;

		// 	default:
		// 		break;
		// }

		// return {
		// 	page: pageSize === 1000 ? 1 : this.state.page,
		// 	mergeType: eMergetype,
		// 	pageSize: pageSize,
		// 	showTypes: targets,
		// 	startTime: this.props.startDate,
		// 	endTime: this.props.endDate,
		// 	threshold: Number(Number(threshold / 100).toFixed(2)),
		// 	currentTargetType: this.props.currentTargetType
		// };
	}

	_getSearchResult = (
		add: boolean = false,
		searchRange: IFUniqueDataSource[],
		pageSize: number = this.state.pageSize
	) => {
		this.setState(
			(prevState: StateType) => {
				return {
					isFirstLoading: add ? false : true,
					isLoadingMore: add,
					page: add ? prevState.page : 1,
					resultsList: add ? prevState.resultsList : []
				};
			},
			() => {
				if (this.isSearchEmpty()) {
					// 直接返回为空
					this.setState({
						resultsList: [],
						isFirstLoading: false,
						isLoadingMore: false
					});
				} else {
					let options = this._getSearchRequestOption(
						200,
						this.props.searchTargetTypes
					);
					if (
						options.mergeType === EMerge.Intersection &&
						this.props.searchTargetList.length !==
							this.getValidSearchTargetList().length
					) {
						// 有未知的targetType， 并且要取交集(结果势必为空)
						this.setState({
							resultsList: [],
							isFirstLoading: false,
							isLoadingMore: false
						});
						this.updateStatisticsInfos([]);
					} else {
						this._getSearchDataResult(add, searchRange, pageSize);
						// if (this.props.onlyNeedStatisticsInfoRequest) {
						// 	this._getSearchStatisticsInfos();
						// } else {
						// 	this._getSearchDataResult().then(() => {
						// 		this._getSearchStatisticsInfos();
						// 	});
						// }
					}
				}
			}
		);

		// }
	};

	loadMore = () => {
		if (this.state.isFirstLoading || this.state.isLoadingMore) {
			return;
		}

		this.setState(
			(prevState: StateType) => {
				return {
					page: prevState.page + 1,
					isFirstLoading: false,
					isLoadingMore: true
				};
			},
			() => {
				this.getResults(true);
			}
		);
	};

	// 子类继承
	render() {
		let mainType: ETargetType = ETargetType.Unknown;
		for (let source of this.props.searchTargetList) {
			if (source.targetType !== ETargetType.Unknown) {
				mainType = source.targetType;
				break;
			}
		}

		let showRelative: boolean = false;
		switch (this.props.currentTargetType) {
			case ETargetType.Face:
				showRelative =
					this.props.showBodyRelatedWithFace &&
					isSearchMode(
						this.props.currentTargetType,
						this.props.searchTargetList
					);
				break;

			case ETargetType.Body:
				showRelative =
					this.props.showFaceRelatedWithBody &&
					isSearchMode(
						this.props.currentTargetType,
						this.props.searchTargetList
					);
				break;

			case ETargetType.Vehicle:
				showRelative = this.props.showVehicleRelatedWithFace;
				break;

			default:
				break;
		}

		return this.props.render(
			this.state.resultsList,
			showRelative,
			this.loadMore,
			this.state.hasMore,
			this.state.isFirstLoading,
			this.state.isLoadingMore,
			this.props.currentTargetType,
			mainType,
			isSearchMode(this.props.currentTargetType, this.props.searchTargetList)
		);
	}

	/************************************** redux方法 start*************************************/

	// 更新统计信息
	updateStatisticsInfos(statisticsInfos: Array<IFSearchStatisticInfo> | null) {
		this.props.updateStatisticsInfos(statisticsInfos);
	}
	/************************************** redux方法 end*************************************/
}

export default BaseResultPanel;
