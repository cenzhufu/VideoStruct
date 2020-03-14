import * as React from 'react';
import { Input, Icon, message } from 'antd';
import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/styles/index.module.scss';
import SourceBrowswerPanel from './submodules/source-browser-panel';
import {
	IFAnalysisSourceDetailInfo,
	IFUniqueDataSource,
	CollectionAnalysisSourceRequest
} from 'stsrc/utils/requests/collection-request';
import {
	IFAreaInfo,
	ESourceType,
	ListType,
	IFDeviceInfo,
	IFStructuralInfo,
	ETargetType,
	IFTreeNode,
	getDefaultIFTreeNode,
	// eslint-disable-next-line
	IFStructuralLinkInfo,
	getStructuralLinkInfoSourceType
} from 'stsrc/type-define';
import STComponent from 'stsrc/components/st-component';
import { DeviceRequests } from 'stsrc/utils/requests/basic-server-request';

import {
	IFSearchStatisticInfo,
	IFSearchSourceStatisticInfo
} from 'stutils/requests/search-service-requeests';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
import { EStructuralItemResultsViewMode } from '../../search-result-page/src/submodules/target-type-nav-bar/src/TargetTypeNavBar';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { IFUploadAndAnalysisProcessInfo } from 'stsrc/components/file-upload-analysis-panel';
import * as is from 'is';
import FileUploadManager from 'stsrc/utils/file-upload-manager/src/FileUploadAnalysisWorkFlowManager';
import Config from 'stsrc/utils/config';
import FileSelect from 'ifvendors/utils/file-select';
import SelectedFilesConfirmDialog from 'stsrc/components/selected-file-confirm-dialog';
import {
	CSearchLiveCameraNode,
	CSearchOfflineVideoNode,
	CSearchZipFileNode
} from '../../search-result-page/src/redux/reduces/search-result-page.reduces';

// 查看模式
export enum ESourceRangeViewMode {
	Normal = 'normal', // 正常情况
	OutControlDataSource = 'out-control-data-source' // （数据源从外界传入）
}
// 检索模式
export enum ESourceRangeViewSearchMode {
	Normal = 'normal', // 正常情况
	SearchedDataSource = 'searched' // 检索数据源
}

interface PropsType {
	className: string;
	style: React.CSSProperties;
	searchTargetList: Array<IFStructuralInfo>; // 搜索目标列表
	currentTargetType: ETargetType;

	viewMode: ESourceRangeViewMode;
	outControlDataSource: Array<IFAnalysisSourceDetailInfo>; // 外界传入的数据源

	// NOTE:选择数据源的回调,根据不同viewmode传不同的sourceID和sourcetype给父节点
	filesSelectedCancel: () => void; //取消选择
	// 选择叶子节点的回调
	onSelectedSourceItemList: (
		selectedSourceItemList: Array<IFUniqueDataSource>,
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void; //叶子节点 单个节点
	// 选择某一类型的节点的回调
	selectedFileSourceTypeHandle: (
		selectedSourceItemList: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void; //sourcetype类型回调 全部，实时视频，离线，批量
	selectedEmptyType: (
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void; // 选择了某个类型下边为空的情况

	statisticsInfos: IFSearchStatisticInfo[] | null; //目标搜索结果数量分布
	resultsViewMode: EStructuralItemResultsViewMode;

	onRefresh: () => void;
	onViewVideo: (deviceId: string) => void; // 查看视频流

	selectedNodes: IFTreeNode[];
}

interface StatesType {
	searchStr: string; // 模糊搜索字符串

	viewModeDraft: ESourceRangeViewMode;

	//设备列表(包含了层级信息)
	allHierarchyCameraList: Array<IFAreaInfo>;

	//实时视频（前端构建，也包含了层级信息）
	realTimeVideoList: Array<IFAreaInfo>;
	realTimeVideoListTotal: number;

	//离线视频
	offlineVideoList: IFTreeNode<number>[];
	offlineVideoListTotal: number;

	//批量图片
	batchPicsList: IFTreeNode<number>[];
	batchPicsListTotal: number;

	// 当前选中的source Type
	currentSelectedSourceType: ESourceType;
	// 是否是检索模式
	viewSearchMode: ESourceRangeViewSearchMode;

	expandedkeys: Array<string>;
}

function noop() {}

class SearchSourceRangePanel extends STComponent<PropsType, StatesType> {
	static defaultProps = {
		className: '',
		style: {},
		viewMode: ESourceRangeViewMode.Normal,

		outControlDataSource: [],

		currentTargetType: ETargetType.Unknown,
		searchTargetList: [],
		statisticsInfos: null,
		selectedFileSourceTypeHandle: noop,
		selectedEmptyType: noop,

		onRefresh: noop,
		onViewVideo: noop,

		selectedNodes: []
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			searchStr: '',
			allHierarchyCameraList: [],
			realTimeVideoList: [],
			realTimeVideoListTotal: 0,

			offlineVideoList: [],
			offlineVideoListTotal: 0,

			batchPicsList: [],
			batchPicsListTotal: 0,
			viewSearchMode:
				props.viewMode === ESourceRangeViewMode.OutControlDataSource
					? ESourceRangeViewSearchMode.SearchedDataSource
					: ESourceRangeViewSearchMode.Normal,

			currentSelectedSourceType: ESourceType.All, // 表示全部
			viewModeDraft: props.viewMode,
			expandedkeys: []
		};
	}

	componentDidMount() {
		this.viewModeHandle(this.state.viewModeDraft);

		// 新增数据源
		eventEmiiter.addListener(
			EventType.addNewAnalysisSource,
			this.addNewAnalysisSource
		);

		// 删除数据源
		eventEmiiter.addListener(
			EventType.deleteAnalysisingSource,
			this.deleteewAnalysisSource
		);
	}

	componentWillUnmount() {
		eventEmiiter.removeListener(
			EventType.addNewAnalysisSource,
			this.addNewAnalysisSource
		);
		eventEmiiter.removeListener(
			EventType.deleteAnalysisingSource,
			this.deleteewAnalysisSource
		);
	}

	/**
	 * 事件（添加新的数据源）
	 * @param {IFTreeNode<number>} newSource 数据源
	 * @param {ESourceType} sourceType 数据源类型
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	addNewAnalysisSource = (
		newSource: IFTreeNode<number>,
		sourceType: ESourceType
	) => {
		switch (sourceType) {
			case ESourceType.Zip:
				// 修改parent
				newSource.parent = CSearchZipFileNode;
				newSource.parentId = CSearchZipFileNode.id;
				this.setState((prevState: StatesType) => {
					return {
						batchPicsList: [newSource, ...prevState.batchPicsList],
						batchPicsListTotal: prevState.batchPicsListTotal + 1
					};
				});

				break;

			case ESourceType.Video:
				newSource.parent = CSearchOfflineVideoNode;
				newSource.parentId = CSearchOfflineVideoNode.id;
				this.setState((prevState: StatesType) => {
					return {
						offlineVideoList: [newSource, ...prevState.offlineVideoList],
						offlineVideoListTotal: prevState.offlineVideoListTotal + 1
					};
				});
				break;

			default:
				break;
		}
	};

	/**
	 * 事件（删除数据源）
	 * @param {string} id 数据源id
	 * @param {string} from 来源，可以通过它来跟自身的ownName比较
	 * @param {IFUploadAndAnalysisProcessInfo} uploadInFo 上传信息
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	deleteewAnalysisSource = (
		id: string,
		from: string,
		uploadInFo: IFUploadAndAnalysisProcessInfo
	) => {
		switch (uploadInFo.sourceType) {
			case ESourceType.Zip:
				this.setState((prevState: StatesType) => {
					return {
						batchPicsList: [...this._getDeleteListItemIndex(uploadInFo)],
						batchPicsListTotal: prevState.batchPicsListTotal - 1
					};
				});
				break;
			case ESourceType.Video:
				this.setState((prevState: StatesType) => {
					return {
						offlineVideoList: [...this._getDeleteListItemIndex(uploadInFo)],
						offlineVideoListTotal: prevState.offlineVideoListTotal - 1
					};
				});
				break;

			default:
				break;
		}
	};

	_getDeleteListItemIndex = (uploadInFo: IFUploadAndAnalysisProcessInfo) => {
		const sourceId = uploadInFo.sourceId;
		const type = uploadInFo.sourceType;
		const { batchPicsList, offlineVideoList } = this.state;
		let index = 0;
		let list: Array<IFTreeNode<number>> = [];
		if (type === ESourceType.Zip) {
			list = [...batchPicsList];
		} else if (type === ESourceType.Video) {
			list = [...offlineVideoList];
		}

		for (let i = 0; i < list.length; i++) {
			const id = list[i].id;
			// eslint-disable-next-line
			if (id == sourceId) {
				index = i;
				break;
			}
		}
		list.splice(index, 1);
		return list;
	};

	refreshSourceData = (query?: string) => {
		// 设备信息
		DeviceRequests.getAllDevicesWithAreaInfo()
			.then((deviceList: Array<IFAreaInfo>) => {
				this.setState({
					allHierarchyCameraList: deviceList || []
				});

				// 数据源
				this.inqurieRealTimeVideoSource(query);
				this.inqurieOfflineVideoSource(query);
				this.inqurietBatchImageSource(query);
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * @param {ESourceRangeViewMode} mode mode
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	viewModeHandle = (mode: ESourceRangeViewMode) => {
		if (mode === ESourceRangeViewMode.OutControlDataSource) {
			// 外界数据源模式，只获取设备列表
			DeviceRequests.getAllDevicesWithAreaInfo()
				.then((deviceList: Array<IFAreaInfo>) => {
					this.setState({
						allHierarchyCameraList: deviceList || []
					});

					// 数据源
					let realtimeSources = this.props.outControlDataSource.filter(
						(item: IFAnalysisSourceDetailInfo) => {
							return item.sourceType === ESourceType.Camera;
						}
					);
					let convertedDeviceList: Array<
						IFAreaInfo
					> = this.convertRealTimeVideoDataToIF(deviceList, realtimeSources);

					let offlineSources = this.props.outControlDataSource.filter(
						(item: IFAnalysisSourceDetailInfo) => {
							return item.sourceType === ESourceType.Video;
						}
					);

					let zipSources = this.props.outControlDataSource.filter(
						(item: IFAnalysisSourceDetailInfo) => {
							return item.sourceType === ESourceType.Zip;
						}
					);

					this.setState({
						offlineVideoList: this.convertOfflineDataToIF(offlineSources),
						offlineVideoListTotal: offlineSources.length,
						batchPicsList: this.convertOfflineDataToIF(zipSources),
						batchPicsListTotal: zipSources.length,
						realTimeVideoList: convertedDeviceList,
						realTimeVideoListTotal: convertedDeviceList.reduce(
							(count: number, info: IFAreaInfo) => {
								return count + this.calcDeviceCountInArea(info);
							},
							0
						)
					});
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		} else {
			this.refreshSourceData();
		}
	};

	/**
	 * 统计区域下所有的设备的数量
	 * @param {IFAreaInfo} areaInfo 区域信息
	 * @returns {number} 所有设备的数量
	 * @memberof SearchSourceRangePanel
	 */
	calcDeviceCountInArea(areaInfo: IFAreaInfo) {
		if (!areaInfo) {
			return 0;
		}

		// 设备
		let deviceTotal = ValidateTool.getValidArray(areaInfo.cameraList).length;

		let children: IFAreaInfo[] = ValidateTool.getValidArray(areaInfo.children);
		for (let child of children) {
			deviceTotal += this.calcDeviceCountInArea(child);
		}

		return deviceTotal;
	}

	/**
	 * 实时视频列表
	 * @param {string} query 模糊搜索
	 * @memberof SearchSourceRangePanel
	 * @returns {void}
	 */
	inqurieRealTimeVideoSource = (query?: string) => {
		CollectionAnalysisSourceRequest.getRealTimeVideoFileList(query)
			.then((realTimeVideoList: ListType<IFAnalysisSourceDetailInfo>) => {
				let deviceList: Array<IFAreaInfo> = this.convertRealTimeVideoDataToIF(
					this.state.allHierarchyCameraList,
					realTimeVideoList.list
				);

				// 统计数量
				// let total = 0;
				// for (let device of deviceList) {
				// 	total += this.calcDeviceCountInArea(device);
				// }
				let total = deviceList.reduce((count: number, info: IFAreaInfo) => {
					return count + this.calcDeviceCountInArea(info);
				}, 0);

				this.setState({
					realTimeVideoList: deviceList,
					realTimeVideoListTotal: total
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 离线视频文件列表
	 * @param {string} query 模糊搜索
	 * @memberof SearchSourceRangePanel
	 * @returns {void}
	 */
	inqurieOfflineVideoSource = (query?: string) => {
		CollectionAnalysisSourceRequest.getOfflineVideoFileList(query)
			.then((offlineVideoList: ListType<IFAnalysisSourceDetailInfo>) => {
				this.setState({
					offlineVideoList: this.convertOfflineDataToIF(offlineVideoList.list),
					offlineVideoListTotal: offlineVideoList.total
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 批量图片列表
	 * @param {string} query 模糊搜索
	 * @memberof SearchSourceRangePanel
	 * @returns {void}
	 */
	inqurietBatchImageSource = (query?: string) => {
		CollectionAnalysisSourceRequest.getBatchImageFileList(query)
			.then((batchImagesList: ListType<IFAnalysisSourceDetailInfo>) => {
				this.setState({
					batchPicsList: this.convertOfflineDataToIF(batchImagesList.list),
					batchPicsListTotal: batchImagesList.total
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 实时视频数据格式转换
	 * @param {Array<IFAreaInfo>} allDeviceList 设备列表
	 * @param {Array<IFAnalysisSourceDetailInfo>} connectedDeviceList 实时视频列表
	 * @memberof SearchSourceRangePanel
	 * @returns {Array<IFAreaInfo>} 区域实时视频
	 */
	convertRealTimeVideoDataToIF = (
		allDeviceList: Array<IFAreaInfo>,
		connectedDeviceList: Array<IFAnalysisSourceDetailInfo>
	): Array<IFAreaInfo> => {
		let results: Array<IFAreaInfo> = [];

		let existIds: { [id: string]: true } = {};

		let validIds = connectedDeviceList.map(
			(item: IFAnalysisSourceDetailInfo) => {
				return item.sourceId;
			}
		);
		for (let device of allDeviceList) {
			let tree: IFAreaInfo | undefined = this.getTreeValidDeviceNode(
				device,
				validIds
			);
			if (tree && !existIds[tree.id]) {
				existIds[tree.id] = true;

				results.push(tree);
			}
		}

		return results;
	};

	/**
	 * 获取挂在区域上有效的设备信息（只考虑节点本身）
	 * @param {IFAreaInfo} areaInfo 区域
	 * @param {string} validDeviceId 有效的设备id
	 * @returns {IFDeviceInfo | undefined} 有效的设备信息
	 */
	selectValidDevice(
		areaInfo: IFAreaInfo,
		validDeviceId: string
	): IFDeviceInfo | undefined {
		let result: IFDeviceInfo | undefined;
		if (areaInfo && validDeviceId) {
			let cameraList = areaInfo.cameraList || [];

			for (let i = 0; i < cameraList.length; i++) {
				let deviceInfo: IFDeviceInfo = cameraList[i];
				// eslint-disable-next-line
				if (deviceInfo.id == validDeviceId) {
					result = {
						...deviceInfo,
						count: 0,
						// @NOTE: 重新赋值parent, 因为之前的...deviceInfo操作导致生成的数据一样,但是不是同一个地址
						parent: areaInfo,
						parentId: areaInfo.id
					};
				}
			}
		}

		return result;
	}

	/**
	 * 获取有效的区域（只考虑自身）
	 * @param {IFAreaInfo} areaInfo 区域
	 * @param {Array<string>} validDeviceIds 有效的设备ids
	 * @returns {IFAreaInfo | undefined} 区域信息/或者undefined
	 */
	selectValidArea(
		areaInfo: IFAreaInfo,
		validDeviceIds: Array<string>
	): IFAreaInfo | undefined {
		let result: IFAreaInfo | undefined;
		for (let id of validDeviceIds) {
			let deviceInfo: IFDeviceInfo | undefined = this.selectValidDevice(
				areaInfo,
				id
			);

			if (deviceInfo) {
				if (result) {
					// @ts-ignore
					result['cameraList'].push(deviceInfo);
				} else {
					result = {
						...areaInfo,
						cameraList: [deviceInfo],
						children: [],
						count: 0,
						// @NOTE: ...areaInfo的扩展操作导致parent不是指向areaInfo了,所以我们重新设置一遍
						parent: areaInfo.parent,
						parentId: areaInfo.parentId
					};
				}
			}
		}
		return result;
	}

	/**
	 * 获取树列表
	 * @param {IFAreaInfo} areaInfo 区域信息
	 * @param {Array<string>} [validDeviceIds=[]] 有效设备
	 * @returns {(IFAreaInfo | undefined)} 区域
	 * @memberof SearchSourceRangePanel
	 */
	getTreeValidDeviceNode(
		areaInfo: IFAreaInfo,
		validDeviceIds: Array<string> = []
	): IFAreaInfo | undefined {
		let result: IFAreaInfo | undefined;
		// 自身
		result = this.selectValidArea(areaInfo, validDeviceIds);

		// 子节点
		let children = areaInfo.children || [];
		for (let child of children) {
			let childResult = this.getTreeValidDeviceNode(child, validDeviceIds);
			if (childResult) {
				if (result) {
					// @ts-ignore
					result['children'].push(childResult);
				} else {
					result = {
						...areaInfo,
						cameraList: [],
						children: [childResult],
						count: 0,
						// @NOTE:重设
						parent: areaInfo,
						parentId: areaInfo.id
					};
				}
			}
		}
		return result;
	}

	/**
	 * 离线视频数据格式转换
	 * @param {Array<IFAnalysisSourceDetailInfo>} analysisFileData 前端数据
	 * @memberof SearchSourceRangePanel
	 * @returns {void}
	 */
	convertOfflineDataToIF = (
		analysisFileData: Array<IFAnalysisSourceDetailInfo>
	) => {
		let fileList: Array<IFTreeNode<number>> = [];
		if (analysisFileData && analysisFileData.length > 0) {
			for (let item of analysisFileData) {
				let fileObj: IFTreeNode<number> = this.toTreeNodeFromAnalysisInfo(item);
				fileList.push(fileObj);
			}
		}

		return fileList;
	};

	toTreeNodeFromAnalysisInfo(
		analysisInfo: IFAnalysisSourceDetailInfo,
		parent: IFTreeNode<number> | null = null
	): IFTreeNode<number> {
		return {
			...getDefaultIFTreeNode<number>(0),
			id: analysisInfo.sourceId || '',
			name: analysisInfo.sourceName || '',
			parentId: (parent && parent.id) || '',
			parent: parent,
			children: [],
			value: 0,
			uuid: analysisInfo.id
		};
	}

	/**
	 * 搜索文字改变的回调
	 * @param {React.ChangeEvent<HTMLInputElement>} e 输入事件
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	searchOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.trim();
		this.setState({ searchStr: value });
		if (value === '' || value === null) {
			// NOTE: change不再实时请求了
			// this.refreshSourceData();
			this.setState({
				viewSearchMode: ESourceRangeViewSearchMode.Normal,
				viewModeDraft: ESourceRangeViewMode.Normal
			});
		}
	};

	//文件列表搜索
	searchOnPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		let searchStr = e.target.value.trim();
		this.setState({
			searchStr: searchStr,
			viewSearchMode: ESourceRangeViewSearchMode.SearchedDataSource,
			viewModeDraft: ESourceRangeViewMode.Normal
		});
		this.refreshSourceData(searchStr);
	};

	/**
	 * 离线视频节点选中状态更新
	 * @param {Array<IFUniqueDataSource>} values 节点状态
	 * @param {IFTreeNode} node 当前选中的节点
	 * @param {Function} filter 结果过滤函数
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	onRealTimeVideoNodeSelected = (
		values: IFUniqueDataSource[],
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.Camera
		});

		this.props.onSelectedSourceItemList(values, node, filter);
	};

	/**
	 * 离线视频节点选中状态更新
	 * @param {Array<IFUniqueDataSource>} values 节点状态
	 * @param {IFTreeNode} node 节点
	 * @param {Function} filter 结果过滤函数
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	onOfflineVideoNodeSelected = (
		values: IFUniqueDataSource[],
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.Video
		});

		this.props.onSelectedSourceItemList(values, node, filter);
	};

	/**
	 * 批量图片节点选中状态更新
	 * @param {Array<IFUniqueDataSource>} values 节点状态
	 * @param {IFTreeNode} node 节点
	 * @param {Function} filter 结果过滤函数
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	onBatchImageNodeSelected = (
		values: IFUniqueDataSource[],
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.Zip
		});

		this.props.onSelectedSourceItemList(values, node, filter);
	};

	/**
	 * 判断搜索结果在那个文件源里
	 * @param {ESourceType} type 目标元类型
	 * @param {ETargetType} targetType 当前的tagetType
	 * @returns {null | IFSearchStatisticInfo[]} 是否是有搜索
	 */
	_getSourceIdCounts = (
		type: ESourceType,
		targetType: ETargetType
	): IFSearchSourceStatisticInfo[] | null => {
		const { statisticsInfos } = this.props;
		let sourceIdCounts: IFSearchStatisticInfo[] = [];
		if (statisticsInfos !== null) {
			for (const item of statisticsInfos) {
				if (item.sourceType === type && item.targetType === targetType) {
					sourceIdCounts.push(item);
				}
			}
			return sourceIdCounts;
		}
		return null;
	};

	/**
	 * 针对离线视频/批量图片的数量统计
	 * @param {IFTreeNode<number>[]} items 离线视频/批量图片的数据源
	 * @param {IFSearchSourceStatisticInfo[]} countInfos 统计信息
	 * @returns {void} void
	 * @memberof SearchSourceRangePanel
	 */
	calcFlatItemsCount(
		items: IFTreeNode<number>[],
		countInfos: IFSearchSourceStatisticInfo[]
	) {
		let results: IFTreeNode<number>[] = [];
		for (let item of items) {
			let resultItem = { ...item, count: 0 };
			for (let countInfo of countInfos) {
				if (countInfo.sourceId === item.id) {
					resultItem.value = countInfo.count;
					break;
				}
			}
			results.push(resultItem);
		}

		return results;
	}

	/**
	 * 计算层级结构的统计数量（摄像头）
	 * @param {IFAreaInfo[]} items 摄像头信息
	 * @param {IFSearchSourceStatisticInfo[]} countInfos 统计信息
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	calcHierarchicItemsCount(
		items: IFAreaInfo[],
		countInfos: IFSearchSourceStatisticInfo[]
	) {
		let results: Array<IFAreaInfo> = [];
		for (let areaInfo of items) {
			// 设备信息
			results.push(this.calcAreaInfoCount(areaInfo, countInfos));
		}

		return results;
	}

	calcAreaInfoCount(
		areaInfo: IFAreaInfo,
		countInfos: IFSearchSourceStatisticInfo[]
	): IFAreaInfo {
		let result: IFAreaInfo = { ...areaInfo };
		// 设备信息
		let deviceList: IFDeviceInfo[] = ValidateTool.getValidArray(
			result.cameraList
		);
		let newDeviceList: IFDeviceInfo[] = this.calcDevicesItemCount(
			deviceList,
			countInfos
		);
		result.cameraList = newDeviceList;

		let count: number = newDeviceList.reduce(
			(previousValue: number, currentValue: IFDeviceInfo) => {
				return previousValue + (currentValue.count || 0);
			},
			0
		);

		// 子节点
		let childrenAreaInfos: IFAreaInfo[] = ValidateTool.getValidArray(
			result.children
		);

		let newChildren: IFAreaInfo[] = [];
		for (let childAreaInfo of childrenAreaInfos) {
			let childResult: IFAreaInfo = this.calcAreaInfoCount(
				childAreaInfo,
				countInfos
			);
			count += childResult.count || 0;
			newChildren.push(childResult);
		}
		result.children = newChildren;

		result.count = count;
		return result;
	}

	/**
	 * 给设备赋值（count)
	 * @param {IFDeviceInfo[]} items 设备列表
	 * @param {IFSearchSourceStatisticInfo[]} countInfos 统计信息
	 * @returns {number} 总数
	 * @memberof SearchSourceRangePanel
	 */
	calcDevicesItemCount(
		items: IFDeviceInfo[],
		countInfos: IFSearchSourceStatisticInfo[]
	): IFDeviceInfo[] {
		let resultDevices: IFDeviceInfo[] = [];
		for (let device of items) {
			let newDevice: IFDeviceInfo = { ...device };
			newDevice.count = 0;
			for (let countInfo of countInfos) {
				if (countInfo.sourceId === device.id) {
					if (is.number(countInfo.count)) {
						newDevice.count = countInfo.count;
						break;
					}
				}
			}
			resultDevices.push(newDevice);
		}

		return resultDevices;
	}

	/**
	 * 选择全部文件
	 * @param {Array<IFUniqueDataSource>} selectedAllFilesList 数据源
	 * @param {IFTreeNode} node 当前选中的节点
	 * @param {Function} filter 结果过滤函数
	 * @returns {void} void
	 * @memberof SearchSourceRangePanel
	 */
	onSelectedAllFiles = (
		selectedAllFilesList: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.All
		});

		// 为空的情况
		if (selectedAllFilesList.length === 0) {
			this.props.selectedEmptyType(node, filter);
			return;
		}

		if (
			this.props.viewMode === ESourceRangeViewMode.Normal &&
			this.state.viewSearchMode !==
				ESourceRangeViewSearchMode.SearchedDataSource
		) {
			// NOTE: 全部文件(此时不过滤)
			this.props.selectedFileSourceTypeHandle([], node, () => true);
		} else {
			this.props.selectedFileSourceTypeHandle(
				selectedAllFilesList,
				node,
				filter
			);
		}
	};

	// 选择了批量图片大类
	onSelectedZipType = (
		searchRange: Array<IFUniqueDataSource>,
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.Zip
		});

		// 为空的情况
		if (searchRange.length === 0) {
			this.props.selectedEmptyType(node, filter);
			return;
		}

		if (
			this.props.viewMode === ESourceRangeViewMode.Normal &&
			this.state.viewSearchMode !==
				ESourceRangeViewSearchMode.SearchedDataSource
		) {
			this.props.selectedFileSourceTypeHandle(
				[
					{
						sourceId: '',
						sourceType: ESourceType.Zip
					}
				],
				node,
				// NOTE: 重写过滤函数，避免没必要的便利
				(item: IFStructuralLinkInfo) => {
					return getStructuralLinkInfoSourceType(item) === ESourceType.Zip;
				}
			);
		} else {
			this.props.selectedFileSourceTypeHandle(searchRange, node, filter);
		}
	};

	// 选择了离线视频大类
	onSelectedVideoType = (
		searchRange: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.Video
		});

		// 为空的情况
		if (searchRange.length === 0) {
			this.props.selectedEmptyType(node, filter);
			return;
		}

		if (
			this.props.viewMode === ESourceRangeViewMode.Normal &&
			this.state.viewSearchMode !==
				ESourceRangeViewSearchMode.SearchedDataSource
		) {
			this.props.selectedFileSourceTypeHandle(
				[
					{
						sourceId: '',
						sourceType: ESourceType.Video
					}
				],
				node,
				// NOTE: 重写过滤函数，避免没必要的便利
				(item: IFStructuralLinkInfo) => {
					return getStructuralLinkInfoSourceType(item) === ESourceType.Video;
				}
			);
		} else {
			this.props.selectedFileSourceTypeHandle(searchRange, node, filter);
		}
	};

	// 选择了实时视频大类
	onSelectedCameraType = (
		searchRange: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean = () => true
	) => {
		this.setState({
			currentSelectedSourceType: ESourceType.Camera
		});

		// 为空的情况
		if (searchRange.length === 0) {
			this.props.selectedEmptyType(node, filter);
			return;
		}

		if (
			this.props.viewMode === ESourceRangeViewMode.Normal &&
			this.state.viewSearchMode !==
				ESourceRangeViewSearchMode.SearchedDataSource
		) {
			this.props.selectedFileSourceTypeHandle(
				[
					{
						sourceId: '',
						sourceType: ESourceType.Camera
					}
				],
				node,
				// NOTE: 重写过滤函数，避免没必要的便利
				(item: IFStructuralLinkInfo) => {
					return getStructuralLinkInfoSourceType(item) === ESourceType.Camera;
				}
			);
		} else {
			this.props.selectedFileSourceTypeHandle(searchRange, node, filter);
		}
	};

	/**
	 * 几个大类（实时视频，离线，批量）展开/搜索的回调
	 * @param {string[]} keys keys
	 * @returns {void}
	 * @memberof SearchSourceRangePanel
	 */
	onChangeExpandedKeys = (keys: Array<string>) => {
		this.setState({
			expandedkeys: keys
		});
	};

	isValidateFile(file: File, order: number): string {
		// 文件大小
		let fileSizeTip = this._isValidateFileSize(file, order);
		if (fileSizeTip) {
			return fileSizeTip;
		}

		let fileNameTip = this._isValidateFileName(file, order);
		if (fileNameTip) {
			return fileNameTip;
		}

		// 是否是重复的文件
		if (FileUploadManager.getInstance().hasSameFile(file)) {
			return intl.get('FILE_UPLOAD_REPEAT_FILE').d('重复的文件');
		}

		return '';
	}

	_isValidateFileSize(file: File, order: number): string {
		if (file.size / (1024 * 1024 * 1024) > 5) {
			return intl
				.get('FILE_UPLOAD_FILE_NO_BIG_THAN', { size: '5G' })
				.d('文件大小应小于5G');
		} else {
			return '';
		}
	}

	_isValidateFileName(file: File, order: number): string {
		if (file.name.length > 100) {
			return intl
				.get('FILE_UPLOAD_FILE_NAME_NO_MORE_THAN', { count: 100 })
				.d('文件名长度应小于100个字符');
		} else {
			return '';
		}
	}

	_isValidateFileOrder(file: File, order: number): string {
		if (order > 20) {
			return intl
				.get('ANALYSIS_FILE_COUNT_MAX_COUNT', { count: 20 })
				.d('最多选择20个文件');
		} else {
			return '';
		}
	}

	// 接入数据源
	onAccessSource = () => {
		let self = this;
		FileSelect.showFileSelectDialog(
			{
				multiple: true,
				accept: [
					Config.getSupportedRarFormat(),
					Config.getSupportedVideoFormat()
				].join(','),
				applyValidateFilter: true
			},
			(files: Array<File>, unvalidFiles: Array<File>) => {
				let handle = SelectedFilesConfirmDialog.show({
					files: files,
					unvalidFiles: unvalidFiles,
					onDeleteFile: (file: File) => {
						// 删除文件
						for (let i = 0; i < files.length; i++) {
							if (file === files[i]) {
								files.splice(i, 1);
								handle.update({
									files: files
								});
								return;
							}
						}

						for (let i = 0; i < unvalidFiles.length; i++) {
							if (file === unvalidFiles[i]) {
								unvalidFiles.splice(i, 1);
								handle.update({
									unvalidFiles: unvalidFiles
								});
								return;
							}
						}
					},
					onCancel: () => {
						handle.destory();
					},
					onOk: (
						resultFiles: File[],
						resultUnvalidFiles: File[],
						targetTypes: ETargetType[]
					) => {
						// 大于20个文件
						if (resultFiles.length + resultUnvalidFiles.length > 20) {
							message.error(
								intl
									.get('FILE_UPLOAD_COUNT_MAX_COUNT', { count: 20 })
									.d('文件数量不能超过20个，请重新选择文件')
							);
							return;
						}
						let validFiles: Array<File> = [...resultFiles];
						let unvalidFileInfos: IFUploadAndAnalysisProcessInfo[] = resultUnvalidFiles.map(
							(file: File) => {
								return FileUploadManager.getInstance().generateUnvalidFildInfo(
									file,
									intl.get('FILE_UPLOAD_UNVALID_TYPE_FILE').d('文件类型无效')
								);
							}
						);
						for (let i = validFiles.length - 1; i >= 0; i--) {
							let tip = self.isValidateFile(validFiles[i], i); //
							if (tip) {
								unvalidFileInfos.push(
									FileUploadManager.getInstance().generateUnvalidFildInfo(
										validFiles[i],
										tip
									)
								);
								validFiles.splice(i, 1);
							}
						}
						handle.destory();

						// 获得正确的文件;
						FileUploadManager.getInstance().addUploadTasks(
							validFiles,
							targetTypes
						);
						FileUploadManager.getInstance().addUnvalidFileInfos(
							unvalidFileInfos
						); // 文件格式不一致
					}
				});
			}
		);
	};

	// 刷新
	onRefresh = () => {
		// 更新时间就好了（自动会触发刷新，BaseResultPanel)
		this.props.onRefresh();
	};

	// 查看视频流
	onViewVideo = (deviceId: string) => {
		this.props.onViewVideo(deviceId);
	};

	resetParentChildrenRelation(
		node: IFAreaInfo,
		parent: IFTreeNode | IFAreaInfo | null
	) {
		if (node) {
			// @ts-ignore
			node.parent = parent;
			node.parentId = (parent && parent.id) || '';

			// device
			let devices: IFDeviceInfo[] = node.cameraList;
			for (let device of devices) {
				device.parent = node;
				device.parentId = node.id;
			}

			let children: IFAreaInfo[] = node.children;
			for (let child of children) {
				this.resetParentChildrenRelation(child, node);
			}
		}
	}

	render() {
		let placeHolderInput =
			this.props.outControlDataSource.length > 0
				? this.props.outControlDataSource[0].sourceName
				: '';

		// 修改数量(复制一份，不修改当前的值)
		let cameraResultList = [...this.state.realTimeVideoList];
		let cameraTypeTotal = this.state.realTimeVideoListTotal;
		if (this.props.statisticsInfos) {
			let cameraCountInfos = this._getSourceIdCounts(
				ESourceType.Camera,
				this.props.currentTargetType
			);
			if (cameraCountInfos) {
				cameraResultList = this.calcHierarchicItemsCount(
					cameraResultList,
					cameraCountInfos
				);
			}

			cameraTypeTotal = 0;
			for (let cameraAreaInfo of cameraResultList) {
				if (cameraAreaInfo.count && is.number(cameraAreaInfo.count)) {
					cameraTypeTotal += cameraAreaInfo.count;
				}
			}
		}

		// 修改parent, children
		for (let area of cameraResultList) {
			// 重新设置parent, children的关系
			this.resetParentChildrenRelation(area, CSearchLiveCameraNode);
			// @ts-ignore 反正不需要children信息
			// CSearchLiveCameraNode.children.push(area);
		}

		let videoResultList = [...this.state.offlineVideoList];
		let vedioTypeTotal = this.state.offlineVideoListTotal;
		if (this.props.statisticsInfos) {
			let videoCountInfos = this._getSourceIdCounts(
				ESourceType.Video,
				this.props.currentTargetType
			);
			if (videoCountInfos) {
				videoResultList = this.calcFlatItemsCount(
					videoResultList,
					videoCountInfos
				);
			}

			vedioTypeTotal = 0;
			for (let fileInfo of videoResultList) {
				if (fileInfo.value && is.number(fileInfo.value)) {
					vedioTypeTotal += fileInfo.value;
				}
			}
		}

		// 修改parent, children
		for (let videoItem of videoResultList) {
			// @ts-ignore
			videoItem.parent = CSearchOfflineVideoNode;
			videoItem.parentId = CSearchOfflineVideoNode.id;
			// @ts-ignore 反正不需要children信息
			// CSearchOfflineVideoNode.children.push(videoItem);
		}

		let picResultList = [...this.state.batchPicsList];
		let picTypeTotal = this.state.batchPicsListTotal;
		if (this.props.statisticsInfos) {
			let zipCountInfos = this._getSourceIdCounts(
				ESourceType.Zip,
				this.props.currentTargetType
			);
			if (zipCountInfos) {
				picResultList = this.calcFlatItemsCount(picResultList, zipCountInfos);
			}

			picTypeTotal = 0;
			for (let fileInfo of picResultList) {
				if (fileInfo.value && is.number(fileInfo.value)) {
					picTypeTotal += fileInfo.value;
				}
			}
		}

		// 修改parent, children
		for (let zipItem of picResultList) {
			// @ts-ignore
			zipItem.parent = CSearchZipFileNode;
			zipItem.parentId = CSearchZipFileNode.parentId;
			// @ts-ignore 反正不需要children信息
			// CSearchZipFileNode.children.push(zipItem);
		}

		return (
			<div
				className={`${ModuleStyle['file-list-source-container']} ${
					this.props.className
				}`}
			>
				<div className={`${ModuleStyle['file-list-search-input-container']}`}>
					<Input
						defaultValue={placeHolderInput}
						className={`${ModuleStyle['file-list-search-input']}`}
						placeholder={intl
							.get('FILE_CAMERA_NAME')
							.d('输入摄像头/文件名称回车搜索')}
						prefix={<Icon type="search" />}
						onChange={this.searchOnChange}
						onPressEnter={this.searchOnPressEnter}
					/>
				</div>

				<SourceBrowswerPanel
					expandedkeys={this.state.expandedkeys}
					selectedNodes={this.props.selectedNodes}
					onChangeExpandedKeys={this.onChangeExpandedKeys}
					currentSourceType={this.state.currentSelectedSourceType}
					searchTargetList={this.props.searchTargetList}
					currentTargetType={this.props.currentTargetType}
					refreshDataSource={this.refreshSourceData}
					// 数据
					realTimeVideoList={cameraResultList}
					realTimeVideoListTotal={cameraTypeTotal}
					offlineVideoList={videoResultList}
					offlineVideoListTotal={vedioTypeTotal}
					batchPicsList={picResultList}
					batchPicsListTotal={picTypeTotal}
					// 事件
					filesSelectedCancel={this.props.filesSelectedCancel}
					onSelectedAllFiles={this.onSelectedAllFiles}
					onZipSourceSelected={this.onBatchImageNodeSelected}
					onCameraSourceSelected={this.onRealTimeVideoNodeSelected}
					onOfflineSourceSelected={this.onOfflineVideoNodeSelected}
					onSelectedZipType={this.onSelectedZipType}
					onSelectedVideoType={this.onSelectedVideoType}
					onSelectedCameraType={this.onSelectedCameraType}
					statisticsInfos={this.props.statisticsInfos}
					resultsViewMode={this.props.resultsViewMode}
					onAccessSource={this.onAccessSource}
					onRefresh={this.onRefresh}
					onViewVideo={this.onViewVideo}
				/>
			</div>
		);
	}
}

export default SearchSourceRangePanel;
