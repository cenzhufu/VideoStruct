import * as React from 'react';
import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/styles/index.module.scss';
import SideMenu from 'ifvendors/menu';

import STComponent from 'stsrc/components/st-component';
import { AreaTreeStructItem, FlatTree } from './submodules';
import {
	IFAreaInfo,
	ESourceType,
	IFStructuralInfo,
	ETargetType,
	IFDeviceInfo,
	IFTreeNode,
	IFStructuralLinkInfo,
	getStructuralLinkInfoSourceType,
	getStructuralLinkInfoSourceId
} from 'stsrc/type-define';
// import { ESourceRangeViewMode } from '../../SearchSourceRangePanel';
import {
	// IFAnalysisSourceDetailInfo,
	IFUniqueDataSource
} from 'stsrc/utils/requests/collection-request';
import { IFSearchStatisticInfo } from 'stutils/requests/search-service-requeests';

import { ReactComponent as RealTimeIcon } from './assets/images/real-time.svg';
import { ReactComponent as OfflineVideoIcon } from './assets/images/offline-video.svg';
import { ReactComponent as BatchPicsIcon } from './assets/images/batch-pics.svg';
import { Icon } from 'antd';
import { EStructuralItemResultsViewMode } from '../../../../search-result-page/src/submodules/target-type-nav-bar/src/TargetTypeNavBar';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { isSearchMode } from 'stsrc/utils/search-utils';
import {
	CSearchAllNode,
	CSearchLiveCameraNode,
	CSearchZipFileNode,
	CSearchOfflineVideoNode
} from 'stsrc/pages/Search/views/search-result-page/src/redux/reduces/search-result-page.reduces';
import { formatCountTip } from '../../util';

const Item = SideMenu.Item;

interface PropsType {
	searchTargetList: Array<IFStructuralInfo>;
	currentTargetType: ETargetType;
	className: string;

	//实时视频
	realTimeVideoList: Array<IFAreaInfo>;
	realTimeVideoListTotal: number;

	//离线视频
	offlineVideoList: IFTreeNode<number>[];
	offlineVideoListTotal: number;

	//批量图片
	batchPicsList: IFTreeNode<number>[];
	batchPicsListTotal: number;

	filesSelectedCancel: () => void; //取消选择

	// 选择全部，元素为空字符串表示在请求时可以忽略
	onSelectedAllFiles: (
		selectedAllFilesList: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void; //全部文件

	refreshDataSource: () => void; //刷新数据

	// 选择类型
	onSelectedZipType: (
		selectedSourceItemList: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void;
	onSelectedVideoType: (
		selectedSourceItemList: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void;
	onSelectedCameraType: (
		selectedSourceItemList: Array<IFUniqueDataSource>,
		node: IFTreeNode<any>,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void;
	// 选择某个节点
	onCameraSourceSelected: (
		values: IFUniqueDataSource[],
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void;
	onZipSourceSelected: (values: IFUniqueDataSource[], node: IFTreeNode) => void;
	onOfflineSourceSelected: (
		values: IFUniqueDataSource[],
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void;

	statisticsInfos: IFSearchStatisticInfo[] | null; //目标搜索结果数量分布

	//是地图模式还是列表模式
	resultsViewMode: EStructuralItemResultsViewMode;

	currentSourceType: ESourceType;
	expandedkeys: Array<string>; // 几个sourceType的key
	onChangeExpandedKeys: (expandedkeys: Array<string>) => void; // 修改几个sourceType的值

	onAccessSource: () => void;
	onRefresh: () => void;
	onViewVideo: (deviceId: string) => void; // 查看视频流

	selectedNodes: IFTreeNode[];
}

function noop() {}
interface StatesType {
	//当前KEY
	expandedKeys: Array<string>; // antd trees使用的
	outAllFilesSourceIds: Array<string>;
	outAllFilesSourceTypes: Array<string>;
	outrealTimeVideoTypeIds: Array<string>;
	outofflineVideoTypeIds: Array<string>;
	expendedActived: boolean;
	//是否为空对象
	sideMenuExpanedValue: string; // 展开的value
}

class SourceBrowswerPanel extends STComponent<PropsType, StatesType> {
	static defaultProps = {
		className: '',
		currentSourceType: ESourceType.All,
		onZipSourceSelected: noop,
		onOfflineSourceSelected: noop,
		onSelectedZipType: noop,
		onSelectedVideoType: noop,
		onSelectedCameraType: noop,
		onChangeExpandedKeys: noop,
		onCameraSourceSelected: noop,
		onSelectedAllFiles: noop,
		expandedkeys: [],
		onAccessSource: noop,
		onRefresh: noop,
		onViewVideo: noop,
		selectedNodes: []
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			// expandedFirKeys: [],
			expandedKeys: [],
			outAllFilesSourceIds: [],
			outAllFilesSourceTypes: [],
			outrealTimeVideoTypeIds: [],
			outofflineVideoTypeIds: [],
			expendedActived: false,
			sideMenuExpanedValue: ''
		};
	}

	componentDidMount() {
		//
	}

	selectedTreeNode = (selectedTreeNode: string[]) => {
		this.setState({ expandedKeys: selectedTreeNode });
	};

	clickCallback = (value: string) => {
		console.log('callback ......', value);
	};

	//所有文件点击回调 TODO:代码简化
	allFilesClickHandle = (e: React.MouseEvent<HTMLDivElement>) => {
		let areaSources: Array<
			IFUniqueDataSource
		> = this.props.realTimeVideoList.reduce(
			(all: Array<IFUniqueDataSource>, value: IFAreaInfo) => {
				return [...all, ...this.getAllDeviceSourceInfosInArea(value)];
			},
			[]
		);

		let videoSources: Array<
			IFUniqueDataSource
		> = this.props.offlineVideoList.map((value: IFTreeNode<number>) => {
			return {
				sourceId: value.id,
				sourceType: ESourceType.Video
			};
		});

		let zipSources: Array<IFUniqueDataSource> = this.props.batchPicsList.map(
			(value: IFTreeNode<number>) => {
				return {
					sourceId: value.id,
					sourceType: ESourceType.Zip
				};
			}
		);

		this.props.onSelectedAllFiles(
			[...areaSources, ...videoSources, ...zipSources],
			CSearchAllNode,
			// 所有的过滤要考虑数据源的过滤（即使是全部选择，但是数据源过不过滤的情况就完全不一样）
			(item: IFStructuralLinkInfo) => {
				let sourceId: string = getStructuralLinkInfoSourceId(item);
				let sourceType: ESourceType = getStructuralLinkInfoSourceType(item);

				switch (sourceType) {
					case ESourceType.Camera:
						return this.existInSources(sourceId, areaSources);

					case ESourceType.Video:
						return this.existInSources(sourceId, videoSources);

					case ESourceType.Zip:
						return this.existInSources(sourceId, zipSources);

					default:
						return false;
				}
			}
		);
	};

	existInSources(sourceId: string, sources: IFUniqueDataSource[]): boolean {
		for (let source of sources) {
			// eslint-disable-next-line
			if (source.sourceId == sourceId) {
				return true;
			}
		}

		return false;
	}

	onAccessSource = (event: React.MouseEvent) => {
		event.stopPropagation();
		this.props.onAccessSource();
	};

	onRefresh = (event: React.MouseEvent) => {
		event.stopPropagation();
		this.props.onRefresh();
	};

	//已选文件取消回调
	filesSelectedCancel = (event: React.MouseEvent) => {
		//停止事件冒泡
		event.stopPropagation();
		this.props.filesSelectedCancel();
		this.props.refreshDataSource();
	};

	/**
	 * 点击事件统一处理逻辑：父节点数据处理模式；自身节点搜索处理模式；正常模式
	 * @param {string} value 节点value
	 * @returns {void}
	 * @memberof SourceBrowswerPanel
	 */
	realTimeVideoItemClickHandle = (value: string) => {
		let sources: Array<
			IFUniqueDataSource
		> = this.props.realTimeVideoList.reduce(
			(all: Array<IFUniqueDataSource>, value: IFAreaInfo) => {
				return [...all, ...this.getAllDeviceSourceInfosInArea(value)];
			},
			[]
		);
		this.props.onSelectedCameraType(
			sources,
			CSearchLiveCameraNode,
			(item: IFStructuralLinkInfo) => {
				let sourceId: string = getStructuralLinkInfoSourceId(item);
				return (
					getStructuralLinkInfoSourceType(item) === ESourceType.Camera &&
					this.existInSources(sourceId, sources)
				);
			}
		);
		// 触发展开
		// this.onClickExpandedIcon(ESourceType.Camera);
	};

	getAllDeviceSourceInfosInArea(area: IFAreaInfo): Array<IFUniqueDataSource> {
		let deviceList: Array<IFDeviceInfo> = ValidateTool.getValidArray(
			(area && area.cameraList) || []
		);

		let results: Array<IFUniqueDataSource> = [];
		results.push(
			...deviceList.map((value: IFDeviceInfo) => {
				return {
					sourceId: value.id,
					sourceType: ESourceType.Camera
				};
			})
		);

		let childern: IFAreaInfo[] = ValidateTool.getValidArray(
			(area && area.children) || []
		);
		for (let childArea of childern) {
			results.push(...this.getAllDeviceSourceInfosInArea(childArea));
		}

		return results;
	}

	/**
	 * 点击事件统一处理逻辑：父节点数据处理模式；自身节点搜索处理模式；正常模式
	 * @param {string} value 节点value
	 * @returns {void}
	 * @memberof SourceBrowswerPanel
	 */
	offlineVideoClickHandle = (value: string) => {
		let sources: Array<IFUniqueDataSource> = this.props.offlineVideoList.map(
			(value: IFTreeNode<number>) => {
				return {
					sourceId: value.id,
					sourceType: ESourceType.Video
				};
			}
		);
		this.props.onSelectedVideoType(
			sources,
			CSearchOfflineVideoNode,
			(item: IFStructuralLinkInfo) => {
				let sourceId: string = getStructuralLinkInfoSourceId(item);
				return (
					getStructuralLinkInfoSourceType(item) === ESourceType.Video &&
					this.existInSources(sourceId, sources)
				);
			}
		);
		// 触发展开
		// this.onClickExpandedIcon(ESourceType.Video);
	};

	onClickExpandedIcon = (value: string) => {
		let index = this.props.expandedkeys.indexOf(value);
		if (index !== -1) {
			// exist
			let keys = [...this.props.expandedkeys];
			keys.splice(index, 1);
			this.props.onChangeExpandedKeys(keys);
		} else {
			this.props.onChangeExpandedKeys([value]);
		}
	};

	/**
	 * 点击事件统一处理逻辑：父节点数据处理模式；自身节点搜索处理模式；正常模式
	 * @param {string} value 节点value
	 * @returns {void}
	 * @memberof SourceBrowswerPanel
	 */
	batchImageItemClickHandle = () => {
		let sources: Array<IFUniqueDataSource> = this.props.batchPicsList.map(
			(value: IFTreeNode<number>) => {
				return {
					sourceId: value.id,
					sourceType: ESourceType.Zip
				};
			}
		);
		this.props.onSelectedZipType(
			sources,
			CSearchZipFileNode,
			(item: IFStructuralLinkInfo) => {
				let sourceId: string = getStructuralLinkInfoSourceId(item);
				return (
					getStructuralLinkInfoSourceType(item) === ESourceType.Zip &&
					this.existInSources(sourceId, sources)
				);
			}
		);
		// 触发展开
		// this.onClickExpandedIcon(ESourceType.Zip);
	};

	/**
	 * 节点信息统一处理
	 * @param {any} icon 图标组件
	 * @param {React.ReactNode | string} title 节点名称
	 * @param {number} total 数量统计
	 * @returns {void}
	 * @memberof SourceBrowswerPanel
	 */
	sourceTypeItemTitleSelect = (
		icon: any = null,
		title: React.ReactNode | string = '',
		total: number = 0
	) => {
		let isCSearchMode = isSearchMode(
			this.props.currentTargetType,
			this.props.searchTargetList
		); // 判断是否是搜索模式，如果是 菜单栏展示样式有变动
		let clnm =
			isCSearchMode && this.props.statisticsInfos
				? `${ModuleStyle['file-list-item-submenuBg']}`
				: ``;
		return (
			<div className={`${ModuleStyle['file-list-item-content-inactive']}`}>
				{icon && (
					<span className={`${ModuleStyle['file-list-item-icon']}`}>
						{icon}
					</span>
				)}
				{
					<span className={`${ModuleStyle['file-list-item-title']}`}>
						{title}
					</span>
				}
				{total > 0 && (
					<span className={`${ModuleStyle['file-list-item-submenu']} ${clnm}`}>
						{formatCountTip(total)}
					</span>
				)}
			</div>
		);
	};

	isCameraTreeDisabled() {
		return this.props.realTimeVideoList.length === 0;
	}

	isVideoTreeDisabled() {
		return (
			this.props.resultsViewMode === EStructuralItemResultsViewMode.MapMode ||
			this.props.offlineVideoList.length === 0
		);
	}

	isZipTreeDisabled() {
		return (
			this.props.resultsViewMode === EStructuralItemResultsViewMode.MapMode ||
			this.props.batchPicsList.length === 0
		);
	}

	onViewVideo = (deviceId: string) => {
		this.props.onViewVideo(deviceId);
	};

	render() {
		const {
			realTimeVideoListTotal,
			offlineVideoListTotal,
			batchPicsListTotal
		} = this.props;
		// const { currentSourceTypeDraft } = this.state;

		//計算左侧菜单的数量显示
		let realTimeVideoListCount = realTimeVideoListTotal;
		let offlineVideoListCount = offlineVideoListTotal;
		let batchPicsListCount = batchPicsListTotal;

		//全部文件总是
		const allFileCount =
			realTimeVideoListCount + offlineVideoListCount + batchPicsListCount;

		return (
			<div className={`${ModuleStyle['source-container']}`}>
				<div
					className={`${ModuleStyle['source-type-node']} ${
						this.props.selectedNodes.some((node: IFTreeNode) => {
							return node.uuid === CSearchAllNode.uuid;
						})
							? ModuleStyle['active']
							: ''
					}`}
					onClick={this.allFilesClickHandle}
				>
					<div>
						{`${intl
							.get('TARGET_SEARCH_ALL_FILES')
							.d('全部文件')} (${formatCountTip(allFileCount)})`}
					</div>
					<div className={ModuleStyle['control-bar']}>
						<div
							className={ModuleStyle['control-bar-item']}
							onClick={this.onAccessSource}
						>
							<Icon type="plus" />
						</div>
						<div
							className={ModuleStyle['control-bar-item']}
							onClick={this.onRefresh}
						>
							<Icon type="reload" />
						</div>
					</div>
				</div>

				<SideMenu
					expandedKeys={this.props.expandedkeys}
					clickCallBack={this.clickCallback}
					onExpanded={this.clickCallback}
					onCollapsed={this.clickCallback}
					key="menu"
					className={`${ModuleStyle['file-list-sider-menu']}`}
				>
					<Item
						titleClassName={`${
							this.isCameraTreeDisabled()
								? ModuleStyle['file-item-real-time-disabled']
								: ModuleStyle[
										this.props.selectedNodes.some((node: IFTreeNode) => {
											return node.uuid === CSearchLiveCameraNode.uuid;
										})
											? 'file-item-real-time-active'
											: 'file-item-real-time-inactive'
								  ]
						}`}
						title={this.sourceTypeItemTitleSelect(
							<Icon component={RealTimeIcon} />,
							intl.get('SESRCH_RANGE_REALTIME_VIDEO').d('实时视频'),
							realTimeVideoListCount
						)}
						value={ESourceType.Camera}
						handleItemClick={this.realTimeVideoItemClickHandle}
						handleIconClick={this.onClickExpandedIcon}
						disabled={this.isCameraTreeDisabled()}
					>
						{
							<AreaTreeStructItem
								selectedNodes={this.props.selectedNodes}
								isSearchMode={isSearchMode(
									this.props.currentTargetType,
									this.props.searchTargetList
								)}
								currentSourceType={this.props.currentSourceType}
								datalist={this.props.realTimeVideoList}
								sourceType={ESourceType.Camera}
								onSelected={this.props.onCameraSourceSelected}
								disabled={this.isCameraTreeDisabled()}
								onViewVideo={this.onViewVideo}
							/>
						}
					</Item>

					<Item
						titleClassName={`${
							this.isVideoTreeDisabled()
								? ModuleStyle['file-item-real-time-disabled']
								: ModuleStyle[
										this.props.selectedNodes.some((node: IFTreeNode) => {
											return node.uuid === CSearchOfflineVideoNode.uuid;
										})
											? 'file-item-real-time-active'
											: 'file-item-real-time-inactive'
								  ]
						}`}
						title={this.sourceTypeItemTitleSelect(
							<Icon component={OfflineVideoIcon} />,
							intl.get('SESRCH_RANGE_OFFLINE_VIDEO').d('离线视频'),
							offlineVideoListCount
						)}
						value={ESourceType.Video}
						handleItemClick={this.offlineVideoClickHandle}
						handleIconClick={this.onClickExpandedIcon}
						disabled={this.isVideoTreeDisabled()}
					>
						{
							<FlatTree
								selectedNodes={this.props.selectedNodes}
								currentSourceType={this.props.currentSourceType}
								nodeList={this.props.offlineVideoList}
								sourceType={ESourceType.Video}
								onSelected={this.props.onOfflineSourceSelected}
								disabled={this.isVideoTreeDisabled()}
							/>
						}
					</Item>

					<Item
						titleClassName={`${
							this.isZipTreeDisabled()
								? ModuleStyle['file-item-real-time-disabled']
								: ModuleStyle[
										this.props.selectedNodes.some((node: IFTreeNode) => {
											return node.uuid === CSearchZipFileNode.uuid;
										})
											? 'file-item-real-time-active'
											: 'file-item-real-time-inactive'
								  ]
						}`}
						title={this.sourceTypeItemTitleSelect(
							<Icon component={BatchPicsIcon} />,
							intl.get('SESRCH_RANGE_BATCH_IMAGE').d('批量图片'),
							batchPicsListCount
						)}
						value={ESourceType.Zip}
						handleItemClick={this.batchImageItemClickHandle}
						handleIconClick={this.onClickExpandedIcon}
						disabled={this.isZipTreeDisabled()}
					>
						{
							<FlatTree
								selectedNodes={this.props.selectedNodes}
								currentSourceType={this.props.currentSourceType}
								nodeList={this.props.batchPicsList}
								sourceType={ESourceType.Zip}
								onSelected={this.props.onZipSourceSelected}
								disabled={this.isZipTreeDisabled()}
							/>
						}
					</Item>
				</SideMenu>
			</div>
		);
	}
}

export default SourceBrowswerPanel;
