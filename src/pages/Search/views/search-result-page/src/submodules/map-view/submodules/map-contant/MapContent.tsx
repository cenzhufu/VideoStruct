import * as React from 'react';
import { message } from 'antd';
import STComponent from 'stcomponents/st-component';
import IFMap from 'src/vendors/react-leaflet';
import * as _ from 'lodash';
import ModuleStyle from './assets/styles/index.module.scss';
import {
	DeviceRequests,
	getCirclePoint
} from 'stsrc/utils/requests/basic-server-request';
import { DataServerRequests } from 'stutils/requests/data-server-requests';
import {
	SearchService,
	IFSearchResult,
	IFSearchStatisticInfo
} from 'stutils/requests/search-service-requeests';
import {
	IFDeviceInfo,
	IFStructuralInfo,
	IFAttributeProperty,
	ETargetType,
	EMerge,
	DateFormat,
	EConfidenceValue,
	IFStructuralLinkInfo,
	ListType,
	ESourceType
} from 'sttypedefine';
import {
	IFUniqueDataSource,
	IFOriginalImageInfo,
	CollectionAnalysisResultRequest
} from 'stsrc/utils/requests/collection-request';
import { SearchOptions } from 'stsrc/utils/requests/search-service-requeests/search-request';
import StructuralScroll from 'stsrc/components/scroll';
import MapTrace from '../map-trace';
import IFRequest from 'ifvendors/utils/requests';
import { NoNeedTipError } from 'stsrc/utils/errors';
import * as Immutable from 'immutable';
import SourcePreviewer, {
	ESourcePreviewerMode
} from 'stsrc/containers/source-previewer';
import StructuralScrollItem from 'stsrc/components/scroll-item';
import StructuralTaskTimeSegment from 'stsrc/components/task-time-segment';
// import { MarkerIconOptions } from 'ifvendors/react-leaflet/DeviceMarkerCluster';
import { getSearchMainType, isSearchMode } from 'stsrc/utils/search-utils';
import { getSearchRequestOption } from 'stsrc/utils/search-utils/get-search-options';
// import STMap from 'stsrc/utils/map';

const isEqual = require('lodash/isEqual');
interface PropsType {
	mapPoints: Array<IFDeviceInfo>; // 需要显示在地图上的设备点
	currentTargetType: ETargetType; // 当前选择的target type

	/************ 搜索参数 start ************/
	searchTargetList: Array<IFStructuralInfo>; // 搜索目标
	searchRange: Array<IFUniqueDataSource>; // 搜索范围
	selectedAttributeList: Array<IFAttributeProperty>; // 选择的属性
	attributeAccuracy: EConfidenceValue; //属性精确度
	faceThreshold: number; // 人脸相似度
	bodyThreshold: number; // 人体相似度
	startDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	endDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	// 是否精确匹配
	faceResultMergeType: EMerge;
	bodyResultMergeType: EMerge;
	statisticsInfos: IFSearchStatisticInfo[] | null;
	/************ 搜索参数  end ************/
	showBodyRelatedWithFace: boolean; // 是否显示人脸关联的人体信息
	showFaceRelatedWithBody: boolean; // 是否显示人体关联的人脸信息
	showVehicleRelatedWithFace: boolean; // 是否先是人脸关联的车辆信息

	allPointsArr: IFDeviceInfo[]; // 所有的设备信息
	centerPointOpt: L.MapOptions | null;

	onViewLive: (deviceId: string) => void; // 查看视频流

	initCurrentSelectedDevice?: IFDeviceInfo;
}

interface IFEnhancedOriginalImageInfo extends IFOriginalImageInfo {
	structuralId: string; // 对应的小图id
}

interface StateType {
	activeCamInfo: object | null; // NOTE:当前选中的摄像头
	activeCamScroll: boolean;
	clusterClickId: string;
	showTrace: boolean;
	showTraceBtn: boolean;
	traceResult: IFStructuralLinkInfo[];
	thresholdSourceIdArr: { [key: string]: number };
	isTracePlay: boolean;
	trackPoints: Array<IFDeviceInfo>; // 轨迹点
	collapseId: string;
	scrollObj: {
		page: number;
		pageSize: number;
		hasMore: boolean;
		sourceId: string;
		showLoading: boolean;
	};
	scrollData: Array<IFEnhancedOriginalImageInfo>;
	clickType: string;
	activeIcon: Array<NodeList>;
	routesMock: any[];
	traceLoading: boolean;

	currentSelectedDeviceInfo?: IFDeviceInfo;
}

function noop() {}
const { DeviceMarkerCluster, Trace } = IFMap;
class MapContent extends STComponent<PropsType, StateType> {
	static defaultProps = {
		mapPoints: [],
		currentTargetType: ETargetType.Unknown,
		searchTargetList: [],
		searchRange: [],
		statisticsInfos: null,
		allPointsArr: [],
		centerPointOpt: null,
		showBodyRelatedWithFace: false,
		showFaceRelatedWithBody: false,
		showVehicleRelatedWithFace: false,
		faceResultMergeType: EMerge.Union,
		bodyResultMergeType: EMerge.Union,
		faceThreshold: 0,
		bodyThreshold: 0,
		startDate: '',
		endDate: '',
		selectedAttributeList: [],
		attributeAccuracy: EConfidenceValue.Low,
		onViewLive: noop,
		initCurrentSelectedDevice: undefined
	};

	constructor(props: PropsType) {
		super(props);

		this.state = {
			activeCamInfo: null,
			activeCamScroll: false,
			clusterClickId: props.centerPointOpt ? props.centerPointOpt.id : '',
			routesMock: [], // 显示轨迹模拟的点位
			showTrace: false, // 是否显示轨迹
			showTraceBtn: true, // 是否显示查看轨迹的btn
			traceResult: [],
			thresholdSourceIdArr: {},
			isTracePlay: false,
			trackPoints: _.cloneDeep(props.mapPoints),
			currentSelectedDeviceInfo: props.initCurrentSelectedDevice,
			collapseId: props.initCurrentSelectedDevice
				? props.initCurrentSelectedDevice.id
				: '', // 用于收起
			scrollData: [],
			scrollObj: {
				//请求滚动数据时用到的一些参数，放在一起管理
				page: 1,
				pageSize: 50,
				hasMore: false,
				sourceId: '',
				showLoading: false
			},
			clickType: 'single', // 判断点击的类型
			activeIcon: [], // 记录点击的icon，用于在关闭popup时清除状态
			traceLoading: false // 查看轨迹面板加载数据loading
		};
	}

	componentDidUpdate(prevProps: PropsType) {
		if (!isEqual(this.props.mapPoints, prevProps.mapPoints)) {
			this.setState({
				trackPoints: _.cloneDeep(this.props.mapPoints)
			});
		}
		// tab类型更换
		if (!isEqual(this.props.currentTargetType, prevProps.currentTargetType)) {
			// 清除查看摄像头
			const { activeCamScroll } = this.state;
			const { searchTargetList } = this.props;
			if (activeCamScroll) {
				this.setState({
					activeCamScroll: false
				});
			}
			// 搜索模式下
			if (searchTargetList && searchTargetList.length) {
				if (this.props.currentTargetType !== searchTargetList[0].targetType) {
					this.setState({
						showTrace: false,
						showTraceBtn: false
					});
				} else {
					this.setState({
						showTraceBtn: true
					});
				}
			}
		}
	}

	/**
	 * 查看视频流
	 * @param {string} deviceId 摄像头id
	 * @return {void}
	 * @memberof MapContent
	 */
	onViewLive = (deviceId: string) => {
		this.props.onViewLive(deviceId);
	};

	// 获取点位信息
	getTheCamInfo = (a, point) => {
		// 如果有point，则是多点列表点击，没传point则是单点点击
		const clickSourceId = point
			? point[0].id
			: a.sourceTarget.options.icon.options.point.id;
		this.setState({
			scrollObj: {
				...this.state.scrollObj,
				sourceId: clickSourceId,
				page: 1
			}
		});
		this.getScrollData(clickSourceId);
		let resqId = point ? point[0].id : a.layer.options.icon.options.point.id;
		// this.setState({
		// 	clusterClickId: clickSourceId
		// });
		let that = this;
		Promise.all([
			DeviceRequests.getDeviceInfo(resqId),
			DataServerRequests.getTodaySourceStaticResult(resqId, [
				this.props.currentTargetType
			])
		])
			.then((res) => {
				const div = document.createElement('div');
				const divSingle = document.createElement('div');
				divSingle.className = 'camera-content-container';

				const checkSpan = document.createElement('span'); //查看视频流
				checkSpan.className = 'view-video';

				const btnSpan = document.createElement('span'); //收起
				btnSpan.className = 'collapse-btn';
				btnSpan.setAttribute('data-id', point ? point[0].id : '');

				const spanWrap = document.createElement('div');
				spanWrap.className = 'span-wrapper';

				div.className = 'leaflet-camera-wrap single-info';
				div.innerHTML = !point ? `<h5 class="sgH5">${res[0].name}</h5>` : '';
				checkSpan.innerHTML = '查看视频流 →';
				btnSpan.innerText = `收起`;
				btnSpan.addEventListener('click', (e) => {
					e.stopPropagation();
					this.setState({
						collapseId: e.target.getAttribute('data-id'),
						scrollData: [],
						scrollObj: {
							...that.state.scrollObj,
							page: 1,
							hasMore: false,
							sourceId: ''
						}
					});
				});
				divSingle.innerHTML = `<div class='camera-item-info'>
						<p>
							<span class='info-title-span'>所属区域：</span>
							<span class='info-area'>${res[0].areaName}</span>
						</p>
						<p>
							<span class='info-title-span'>今日抓拍：</span>
							<span class='info-capture'>${res[1]}</span>
						</p>
					</div>`;
				checkSpan.onclick = (e) => {
					if (resqId) {
						this.onViewLive(resqId);
					}
				};

				spanWrap.appendChild(checkSpan);
				if (point) {
					spanWrap.appendChild(btnSpan);
				}
				divSingle.appendChild(spanWrap);
				div.appendChild(divSingle);

				this.setState({
					activeCamInfo: {
						thelayer: a,
						infoHtml: div
					},
					activeCamScroll: true
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	hasCollapsed = () => {
		this.setState({
			collapseId: ''
		});
	};

	clearCamInfo = () => {
		this.setState({
			activeCamInfo: null,
			activeCamScroll: false,
			clusterClickId: ''
		});
		this.clearLastActiveMarker();
	};

	clearLastActiveMarker = () => {
		const pane = document.querySelector('.leaflet-popup-pane');
		//异步的问题不知怎么处理，先用延迟
		setTimeout(() => {
			const { activeIcon } = this.state; // 其中为old的则为上一次点击的，清空其active状态
			// 以下可以解决点击一个后直接关闭
			if (activeIcon.length && (!pane || !pane.childNodes.length)) {
				const lastActiveIcon = activeIcon[activeIcon.length - 1];
				lastActiveIcon.classList.remove('icon-active');
			}
			if (activeIcon.length > 1) {
				const lastTwoActiveIcon = activeIcon[activeIcon.length - 2];
				lastTwoActiveIcon.classList.remove('icon-active');
			}
		}, 300);
	};

	// 点击查看轨迹
	getTraceInfos = () => {
		this.setState({
			traceResult: [],
			traceLoading: true
		});
		// 与外部重复代码太多
		const { selectedAttributeList, searchTargetList, searchRange } = this.props;

		let mainType: ETargetType = getSearchMainType(this.props.searchTargetList);
		let eMergetype =
			mainType === ETargetType.Face
				? this.props.faceResultMergeType
				: this.props.bodyResultMergeType;

		// let threshold
		let threshold = 0;
		// 判断搜索目标的类型(找到第一个有效的)
		if (mainType !== ETargetType.Unknown) {
			// 我们以搜索目标的targetType对应的threhold为准
			switch (mainType) {
				case ETargetType.Face:
					threshold = this.props.faceThreshold;
					break;

				case ETargetType.Body:
					threshold = this.props.bodyThreshold;
					break;

				default:
					break;
			}

			this._source = IFRequest.getCancelSource();
			//获取搜索全部时的统计数据
			SearchService.getSearchResultsParams(
				searchTargetList,
				searchRange,
				selectedAttributeList,
				{
					page: 1,
					pageSize: 1000,
					mergeType: eMergetype,
					// 同时对于检索，我们都先获取关联的信息，然后在前端过滤
					// 同时因为车辆没有检索，所以这儿就是face和body
					showTypes: [ETargetType.Face, ETargetType.Body],
					startTime: this.props.startDate,
					endTime: this.props.endDate,
					threshold: Number(Number(threshold / 100).toFixed(2))
				},
				{
					//@ts-ignore
					cancelToken: this._source.token
				}
			)
				.then((res: IFSearchResult) => {
					this.setState({
						traceLoading: false
					});
					if (res && res.results && res.results.list) {
						const { currentTargetType } = this.props;
						const { trackPoints } = this.state;
						let listData = res.results.list;
						let listTraget = [];
						if (currentTargetType === ETargetType.Face) {
							listData.forEach((v) => {
								if (v.face) {
									listTraget.push(v.face);
								}
							});
						} else if (currentTargetType === ETargetType.Body) {
							listData.forEach((v) => {
								if (v.body) {
									listTraget.push(v.body);
								}
							});
						}
						let pointsTemp = _.cloneDeep(trackPoints);
						this.setState({
							traceResult: listData,
							trackPoints: pointsTemp
						});
					}
				})
				.catch((error) => {
					this.setState({
						traceLoading: false
					});
					if (IFRequest.isCancel(error)) {
						console.log('Request canceled!');
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
	};
	// 播放轨迹fn
	changeTracePlayStatus = () => {
		this.setState({
			showTrace: true,
			isTracePlay: !this.state.isTracePlay
		});
	};

	// 获取勾选轨迹的sourceIds
	getThresholdSourceIdArr = (arr: Array<string>) => {
		let thresholdSourceIdArr = arr.reduce(function(prev, next) {
			prev[next] = prev[next] + 1 || 1;
			return prev;
		}, {});
		if (!thresholdSourceIdArr) {
			return;
		}
		const { mapPoints } = this.props;
		let newMapPoints = _.cloneDeep(mapPoints); // 深拷贝防止props也改变
		let thresholdIds = Object.keys(thresholdSourceIdArr);
		const thresholdPoints = [...newMapPoints].filter((x: IFDeviceInfo) =>
			[...thresholdIds].some((y) => {
				if (y === x.id) {
					x.count = thresholdSourceIdArr[y];
					return x;
				}
				return false;
			})
		);

		let routesLatLng = [];
		const routesPoints = [...arr].filter((x: number) =>
			[...newMapPoints].some((y) => {
				if (y.id === x.toString()) {
					routesLatLng.push([y.lat, y.lng]);
					return y;
				}
				return false;
			})
		);
		// 改变point的起点终点的图标呀。
		if (routesPoints && routesPoints.length) {
			const routesLen = routesPoints.length;
			let pointsStart = routesPoints[0].toString();
			let pointsEnd = routesPoints[routesLen - 1].toString();
			if (pointsStart === pointsEnd) {
				thresholdPoints.forEach((v) => {
					if (v.id === pointsStart) {
						v.state = 4; // 4 起点终点一个
					}
				});
			} else {
				thresholdPoints.forEach((v) => {
					if (v.id === pointsStart) {
						v.state = 2; // 2 起点
					} else if (v.id === pointsEnd) {
						v.state = 3;
					}
				});
			}
		}
		// console.log('zml del', routesPoints);
		this.setState({
			routesMock: routesLatLng,
			trackPoints: thresholdPoints
		});
	};
	// 取消查看轨迹
	cancelThresholdSource = () => {
		this.setState({
			trackPoints: _.cloneDeep(this.props.mapPoints),
			isTracePlay: false,
			showTrace: false
		});
	};

	handleOpenPop = () => {
		this.setState({
			activeCamScroll: this.state.clickType === 'single'
		});
	};
	// 当点击的是集合点的时候，底部滚动条先不显示
	clickType = (type: string) => {
		this.setState({
			clickType: type
		});
	};

	getScrollData = (sourceId: string) => {
		const { page } = this.state.scrollObj;
		this.setState({
			scrollObj: {
				...this.state.scrollObj,
				showLoading: true
			}
		});
		if (page === 1) {
			let scrollObjReset = {
				...this.state.scrollObj,
				page: 1,
				hasMore: false
				// sourceId: '',
				// showLoading: false
			};
			this.setState({
				scrollData: [],
				scrollObj: scrollObjReset
			});
		}

		if (
			!isSearchMode(this.props.currentTargetType, this.props.searchTargetList)
		) {
			this._getCollectionScrollData(sourceId);
		} else {
			this._getSeartchScrollData(sourceId);
		}
	};
	// 有图搜索的大图
	getValidSearchTargetList(): Array<IFStructuralInfo> {
		let result: Array<IFStructuralInfo> = [];
		for (let target of this.props.searchTargetList) {
			if (target.targetType !== ETargetType.Unknown) {
				result.push(target);
			}
		}

		return result;
	}

	_getSearchRequestOption(pageSize: number = 200): Partial<SearchOptions> {
		let searchTargets: ETargetType[] = [];
		switch (this.props.currentTargetType) {
			case ETargetType.Face:
			case ETargetType.Body:
				searchTargets = [ETargetType.Face, ETargetType.Body];
				break;
			case ETargetType.Vehicle:
				searchTargets = [ETargetType.Face, ETargetType.Vehicle];
				break;

			default:
				break;
		}

		return getSearchRequestOption({
			faceThreshold: this.props.faceThreshold,
			bodyThreshold: this.props.bodyThreshold,
			faceResultMergeType: this.props.faceResultMergeType,
			bodyResultMergeType: this.props.bodyResultMergeType,
			startDate: this.props.startDate,
			endDate: this.props.endDate,
			searchTargetList: this.props.searchTargetList,
			pageSize: pageSize,
			currentTargetType: this.props.currentTargetType,
			targets: searchTargets,
			page: this.state.scrollObj.page
		});
		// let mainType: ETargetType = getSearchMainType(this.props.searchTargetList);
		// let eMergetype =
		// 	mainType === ETargetType.Face
		// 		? this.props.faceResultMergeType
		// 		: this.props.bodyResultMergeType;

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
		// let showTypes = [ETargetType.Face];
		// const { currentTargetType } = this.props;
		// if (currentTargetType !== ETargetType.Face) {
		// 	showTypes.push(currentTargetType);
		// }
		// return {
		// 	page: this.state.scrollObj.page,
		// 	mergeType: eMergetype,
		// 	pageSize: pageSize,
		// 	showTypes: [currentTargetType],
		// 	startTime: this.props.startDate,
		// 	endTime: this.props.endDate,
		// 	threshold: Number(Number(threshold / 100).toFixed(2))
		// };
	}

	_getSeartchScrollData = (sourceId: string) => {
		const { page, pageSize } = this.state.scrollObj;
		SearchService.getSearchResultsParams(
			this.getValidSearchTargetList(),
			[{ sourceId: sourceId, sourceType: ESourceType.Camera }],
			this.props.selectedAttributeList,
			this._getSearchRequestOption(pageSize)
		)
			.then((result: IFSearchResult) => {
				let convertedResult: ListType<
					IFEnhancedOriginalImageInfo
				> = this.convertReuslt(result.results);
				let resList = convertedResult.list;
				if (result && resList) {
					const resultData =
						page === 1 ? resList : [...this.state.scrollData, ...resList];
					this.setState({
						scrollData: resultData,
						scrollObj: {
							...this.state.scrollObj,
							hasMore: resultData.length < result.results.total,
							showLoading: false
						}
					});
				}
			})
			.catch((error) => {
				console.error(error);
				if (error instanceof NoNeedTipError) {
					// do nothing
				} else {
					message.error(error.message);
				}
			});
	};
	// 无图采集的大图
	_getCollectionScrollData = (sourceId: string) => {
		const { page } = this.state.scrollObj;
		CollectionAnalysisResultRequest.getAnalysisResult({
			sources: [{ sourceId: sourceId, sourceType: ESourceType.Camera }],
			startDate: this.props.startDate,
			endDate: this.props.endDate,
			attributeAccuracy: this.props.attributeAccuracy,
			selectedAttributes: this.props.selectedAttributeList,
			faceThreshold: this.props.faceThreshold, // 这个值传了也没用
			bodyThreshold: this.props.bodyThreshold,

			// sources: this.props.searchRange,
			page: this.state.scrollObj.page,
			pageSize: this.state.scrollObj.pageSize,
			targetTypes: [this.props.currentTargetType],
			currentTargetType: this.props.currentTargetType
		})
			.then((result: ListType<IFStructuralLinkInfo>) => {
				// NOTE: 数据转换放在这里，没办法，这个结构既不是小图信息，也不是大图信息
				let convertedResult: ListType<
					IFEnhancedOriginalImageInfo
				> = this.convertReuslt(result);
				let resList = convertedResult.list;
				if (result && resList) {
					this.setState({
						scrollData:
							page === 1 ? resList : [...this.state.scrollData, ...resList],
						scrollObj: {
							...this.state.scrollObj,
							hasMore: !(result.list.length < this.state.scrollObj.pageSize),
							showLoading: false
						}
					});
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
				this.setState({
					scrollObj: {
						...this.state.scrollObj,
						showLoading: false
					}
				});
			});
	};

	convertReuslt(
		results: ListType<IFStructuralLinkInfo>
	): ListType<IFEnhancedOriginalImageInfo> {
		let originalList: Array<IFEnhancedOriginalImageInfo> = [];

		let originalImageIdSet = new Set<string>();

		// 类型顾虑
		let filterList = results.list.filter((item: IFStructuralLinkInfo) => {
			switch (this.props.currentTargetType) {
				case ETargetType.Face:
					return item.faces.length > 0;
				case ETargetType.Body:
					return item.bodies.length > 0;
				case ETargetType.Vehicle:
					return item.vehicles.length > 0;
				default:
					return false;
			}
		});

		if (!filterList || !filterList.length) {
			return {
				total: 0,
				list: []
			};
		}

		for (let info of filterList) {
			let structuralInfo: IFStructuralInfo | null = null;
			if (info.face) {
				structuralInfo = info.face;
			} else if (info.body) {
				structuralInfo = info.body;
			} else if (info.vehicle) {
				structuralInfo = info.vehicle;
			}

			if (
				structuralInfo &&
				structuralInfo.orignialImageId &&
				!originalImageIdSet.has(structuralInfo.orignialImageId)
			) {
				originalImageIdSet.add(structuralInfo.orignialImageId);
				// 抽出大图信息
				originalList.push({
					id: structuralInfo.orignialImageId,
					time: structuralInfo.time,
					url: structuralInfo.originalImageUrl,
					json: JSON.stringify({}),
					faces: 0, // 反正也不关心
					timeStamp: -1, // unknown
					sourceType: structuralInfo.sourceType,
					sourceId: structuralInfo.sourceId,
					taskType: structuralInfo.taskType,

					structuralId: structuralInfo.id
				});
			}
		}
		return {
			total: filterList.length,
			list: originalList
		};
	}

	getMoreScrollData = () => {
		this.setState(
			{
				scrollObj: {
					...this.state.scrollObj,
					page: this.state.scrollObj.page + 1
				}
			},
			() => {
				const { sourceId } = this.state.scrollObj;
				this.getScrollData(sourceId);
			}
		);
	};

	setActiveIcon = (icon: NodeList) => {
		const { activeIcon } = this.state;
		if (activeIcon.length === 0) {
			//第一个
			this.setState({
				activeIcon: [...activeIcon, icon]
			});
		} else {
			//不是第一个
			if (Immutable.is(activeIcon[activeIcon.length - 1], icon)) {
				//如果是点同一个点，不再重复记录
				return;
			} else {
				this.setState({
					activeIcon: [...activeIcon, icon]
				});
			}
		}
	};

	/**
	 * 查看地图中的大图信息
	 * @memberof MapContent
	 * @param {IFOriginalImageInfo} info 大图信息
	 * @param {number} index 索引
	 * @param {Array<IFOriginalImageInfo>} list 大图列表
	 * @param {string} infoImgType big
	 * @returns {void} void
	 */
	onClickOriginalImageInfo = (
		info: IFEnhancedOriginalImageInfo,
		index: number,
		list: Array<IFEnhancedOriginalImageInfo>
	) => {
		let handle = SourcePreviewer.show({
			mode: ESourcePreviewerMode.OriginalUnvalidTimeMode, // 大图时间不准确模式
			structuralInfoId: info.structuralId,
			sourceId: info.sourceId,
			sourceType: info.sourceType,
			originalImageId: info.id,
			originalImageUrl: info.url,
			currentIndex: index,
			indicator: `${index + 1}/${list.length}`,
			disableLeftArrow: index <= 0,
			disableRightArrow: index >= list.length - 1,
			allPointsArr: this.props.allPointsArr,
			originalImageInfo: info,
			onQuickSearch: function onQuickSearch() {
				window.open(`${window.location.origin}/structuralize/search/result`);
			},
			goNext: (currentIndex: number) => {
				let nextIndex = Math.max(
					0,
					Math.min(list.length - 1, currentIndex + 1)
				);
				let next: IFEnhancedOriginalImageInfo = list[nextIndex];

				handle.update({
					structuralInfoId: next.structuralId,
					sourceId: next.sourceId,
					sourceType: next.sourceType,
					currentIndex: nextIndex,
					indicator: `${nextIndex + 1}/${list.length}`,
					originalImageId: next.id,
					originalImageUrl: next.url,
					disableLeftArrow: false,
					disableRightArrow: nextIndex >= list.length - 1,
					originalImageInfo: next
				});
			},
			goPrev: (currentIndex: number) => {
				let prevIndex = Math.max(
					0,
					Math.min(list.length - 1, currentIndex - 1)
				);
				let prev: IFEnhancedOriginalImageInfo = list[prevIndex];
				handle.update({
					structuralInfoId: prev.structuralId,
					sourceId: prev.sourceId,
					sourceType: prev.sourceType,
					currentIndex: prevIndex,
					indicator: `${prevIndex + 1}/${list.length}`,
					originalImageId: prev.id,
					originalImageUrl: prev.url,
					disableLeftArrow: prevIndex <= 0,
					disableRightArrow: false,
					originalImageInfo: prev
				});
			},
			onClose: function onClock() {
				handle.destory();
			},
			onOk: function onClock() {
				handle.destory();
			}
		});
	};

	getMainSearchTargetType() {
		for (let item of this.props.searchTargetList) {
			if (
				item.targetType === ETargetType.Face ||
				item.targetType === ETargetType.Body ||
				item.targetType === ETargetType.Vehicle
			) {
				return item.targetType;
			}
		}

		return ETargetType.Unknown;
	}

	/**
	 * 是否需要显示（显示轨迹）按钮
	 * @returns {boolean} true表示需要显示
	 * @memberof MapContent
	 */
	needShowTraceButton(): boolean {
		if (
			isSearchMode(this.props.currentTargetType, this.props.searchTargetList) &&
			this.props.currentTargetType !== ETargetType.Unknown &&
			this.getMainSearchTargetType() === this.props.currentTargetType &&
			this.props.mapPoints.length > 0
		) {
			return true;
		} else {
			return false;
		}
	}

	onClickMarker = (device: IFDeviceInfo, marker: L.Marker) => {
		const clickSourceId = device.id;
		this.setState({
			activeCamScroll: true,
			clusterClickId: device.id,
			scrollObj: {
				...this.state.scrollObj,
				sourceId: clickSourceId,
				page: 1
			}
		});
		this.getScrollData(clickSourceId);
	};

	onClickCluster = () => {
		this.setState({
			activeCamScroll: false
		});
	};

	onClickCameraInCluster = (device: IFDeviceInfo) => {
		const clickSourceId = device.id;
		this.setState({
			activeCamScroll: true,
			clusterClickId: device.id,
			scrollObj: {
				...this.state.scrollObj,
				sourceId: clickSourceId,
				page: 1
			}
		});
		this.getScrollData(clickSourceId);
	};

	onShowPreviewer = (
		structuralItemInfo: IFStructuralInfo,
		index: number,
		infoList: Array<IFStructuralInfo>
	) => {
		let handle = SourcePreviewer.show({
			guid: structuralItemInfo.guid,
			sourceId: structuralItemInfo.sourceId,
			sourceType: structuralItemInfo.sourceType,
			structuralInfoId: structuralItemInfo.id,
			strucutralInfo: structuralItemInfo,
			originalImageId: structuralItemInfo.orignialImageId,
			originalImageUrl: structuralItemInfo.originalImageUrl,
			originalImageWidth: structuralItemInfo.originalImageWidth,
			originalImageHeight: structuralItemInfo.originalImageHeight,
			// title: title,
			disableLeftArrow: index <= 0,
			disableRightArrow: index >= infoList.length - 1,
			currentIndex: index,
			indicator: `${index + 1}/${infoList.length}`,
			allPointsArr: this.props.allPointsArr,
			onQuickSearch: function onQuickSearch() {
				// handle.destory();
				// self.props.history.push(`/structuralize/search/result`);
				window.open(`${window.location.origin}/structuralize/search/result`);
			},
			goNext: (currentIndex: number) => {
				let nextIndex = Math.max(
					0,
					Math.min(infoList.length - 1, currentIndex + 1)
				);
				let next: IFStructuralInfo = infoList[nextIndex];
				handle.update({
					guid: next ? next.guid : undefined,
					sourceId: next.sourceId,
					sourceType: next.sourceType,
					structuralInfoId: next.id,
					strucutralInfo: next,
					currentIndex: nextIndex,
					originalImageId: next.orignialImageId,
					originalImageUrl: next.originalImageUrl,
					originalImageWidth: next.originalImageWidth,
					originalImageHeight: next.originalImageHeight,
					indicator: `${nextIndex + 1}/${infoList.length}`,
					disableLeftArrow: false,
					disableRightArrow: nextIndex >= infoList.length - 1
				});
			},
			goPrev: (currentIndex: number) => {
				let prevIndex = Math.max(
					0,
					Math.min(infoList.length - 1, currentIndex - 1)
				);
				let prev: IFStructuralInfo = infoList[prevIndex];
				handle.update({
					guid: prev ? prev.guid : undefined,
					sourceId: prev.sourceId,
					sourceType: prev.sourceType,
					structuralInfoId: prev.id,
					strucutralInfo: prev,
					currentIndex: prevIndex,
					originalImageId: prev.orignialImageId,
					originalImageUrl: prev.originalImageUrl,
					originalImageWidth: prev.originalImageWidth,
					originalImageHeight: prev.originalImageHeight,
					indicator: `${prevIndex + 1}/${infoList.length}`,
					disableLeftArrow: prevIndex <= 0,
					disableRightArrow: false
				});
			},
			onClose: function onClock() {
				handle.destory();
			},
			onOk: function onClock() {
				handle.destory();
			}
		});
	};

	rendeScrollItem = (
		item: IFEnhancedOriginalImageInfo,
		index: number
	): React.ReactNode => {
		return (
			<StructuralScrollItem
				structuralItemInfo={item}
				onClick={() => {
					this.onClickOriginalImageInfo(item, index, this.state.scrollData);
				}}
			>
				<StructuralTaskTimeSegment
					taskTime={item.time}
					style={{ position: 'absolute', bottom: 0 }}
				/>
			</StructuralScrollItem>
		);
	};

	getItemKey = (item: IFEnhancedOriginalImageInfo, index: number) => {
		return item.id;
	};

	render() {
		const { searchTargetList, searchRange, centerPointOpt } = this.props;
		const {
			activeCamInfo,
			activeCamScroll,
			routesMock,
			showTrace,
			isTracePlay,
			trackPoints
		} = this.state;

		// 修改trackPoints的count
		let validDevices: IFDeviceInfo[] = [];
		for (let point of trackPoints) {
			if (point.lat && point.lng && point.state) {
				validDevices.push(point);
			}
		}
		let traceImage =
			searchTargetList && searchTargetList.length
				? searchTargetList[0].targetImageUrl
				: '';

		// const pointCenterOpt = centerPointOpt
		// 	? centerPointOpt
		// 	: trackPoints && trackPoints.length
		// 	? {
		// 			center: getCirclePoint(trackPoints)
		// 	  }
		// 	: {};

		let mapCenter: L.MapOptions = {
			zoom: 12,
			center: getCirclePoint(trackPoints),
			...centerPointOpt
		};
		return (
			<React.Fragment>
				<div className={ModuleStyle['map-view']}>
					<IFMap
						popCloseCallBack={this.clearCamInfo}
						popOpenCallBack={this.handleOpenPop}
						options={mapCenter}
					>
						<DeviceMarkerCluster
							onViewLive={this.onViewLive}
							devices={validDevices}
							selectedId={this.state.clusterClickId}
							// selectedId={'5'}
							centerPopUpInfo={centerPointOpt || null}
							onClickMarker={this.onClickMarker}
							onClickCluster={this.onClickCluster}
							onClickCameraInCluster={this.onClickCameraInCluster}
							currentTargetType={this.props.currentTargetType}
							popAddInfo={activeCamInfo}
							popCloseFlag={activeCamScroll}
							// clickMarkerCallBack={this.getTheCamInfo}
							clusterClickId={this.state.clusterClickId}
							collapseId={this.state.collapseId}
							hasCollapsed={this.hasCollapsed}
							clickType={this.clickType}
							setActiveIcon={this.setActiveIcon}
						/>
						{showTrace ? (
							<Trace
								data={routesMock}
								traceImg={traceImage}
								isTracePlay={isTracePlay}
								changeTracePlayStatus={this.changeTracePlayStatus}
							/>
						) : null}
					</IFMap>
					{this.needShowTraceButton() && (
						<MapTrace
							getTraceInfos={this.getTraceInfos}
							style={{ position: 'absolute', top: 20, left: 50 }}
							traceResult={this.state.traceResult}
							searchType={this.props.currentTargetType}
							getThresholdSourceIdArr={this.getThresholdSourceIdArr}
							changeTracePlayStatus={this.changeTracePlayStatus}
							isTracePlay={isTracePlay}
							cancelThresholdSource={this.cancelThresholdSource}
							faceResultMergeType={this.props.faceResultMergeType}
							searchTargetList={searchTargetList}
							// statisticsInfos={statisticsInfos}
							searchRange={searchRange}
							onClick={this.onShowPreviewer}
							traceLoading={this.state.traceLoading}
						/>
					)}
				</div>
				{activeCamScroll ? (
					<StructuralScroll<IFEnhancedOriginalImageInfo>
						className={ModuleStyle['map-scroll']}
						resultInfos={this.state.scrollData}
						// onClick={this.onClickOriginalImageInfo}
						getMoreScrollData={this.getMoreScrollData}
						hasMore={this.state.scrollObj.hasMore}
						showLoading={this.state.scrollObj.showLoading}
						renderItem={this.rendeScrollItem}
						getKey={this.getItemKey}
					/>
				) : null}
			</React.Fragment>
		);
	}
}

export default MapContent;
