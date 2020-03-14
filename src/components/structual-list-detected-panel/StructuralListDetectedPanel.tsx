import * as React from 'react';
import ModuleStyle from './index.module.scss';
import {
	IFStructuralInfo,
	ETargetType,
	IFDeviceInfo,
	ETaskType,
	DateFormat
} from 'sttypedefine';
import { StructuralItem } from '../structural-item';
import * as intl from 'react-intl-universal';
// import { Tabs } from 'antd';
import { ImageDisplayMode } from 'ifvendors/image-view';
import STComponent from 'stcomponents/st-component';
import {
	CollectionResourceRequest,
	IFDetectedStructualInfo,
	CollectionTaskRequest
	// IFDetectedStructualInfo
} from 'stsrc/utils/requests/collection-request';
import IFRequest, { IFCancelTokenSource } from 'ifvendors/utils/requests';
import { Tabs } from 'antd';
import StructuralDetailPanel from '../structural-detail-panel';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';

const TabPane = Tabs.TabPane;

enum LoadStatus {
	unknown = 'unknown',
	loading = 'loading', // 加载中
	failed = 'failed', // 失败
	finished = 'finished' // 成功
}

enum TabType {
	Detail = 'detail',
	Search = 'search'
}

type PropsType = {
	className: string;
	style: React.CSSProperties;
	status: LoadStatus;
	title: React.ReactNode;
	faces: Array<IFStructuralInfo>;
	bodies: Array<IFStructuralInfo>;
	structuralItemList: Array<IFStructuralInfo>;
	guid: string;
	isFromUpload: boolean; // 判断是否从上传打开的，是的话需要更改布局样式
	sourcePoint: IFDeviceInfo | null;
	sourceTime: string;
	onSelect: (item: IFStructuralInfo) => void;
	taskType: ETaskType;
	sourceName: string;
	onClose: () => void;
	isStructuralInfo: boolean;
	relatedStatus: LoadStatus;
	onQuickSearch: (list?: Array<IFStructuralInfo>) => void;
	originalImageId: string;
};

type StateType = {
	isFromUpload: boolean;
	supportedTarget: ETargetType[];

	operatedBefore: boolean; // 是第一次点击快速检索 (如果之前有操作)
	activeKey: TabType; // 当前显示tab的key

	preOriginalImageId: string;
};

function noop() {}
// const TabPane = Tabs.TabPane;

type ContainerPropsType = {
	autoDetect: boolean; // 在修改id之后是否自动更新
	originalImageId: string; // 大图id
	originalImageUrl: string; // 大图url
	initDetect: boolean; // 初始化是否检测

	additionalList: Array<IFStructuralInfo>; // 从外界传入的额外的数据

	className: string;
	style: React.CSSProperties;
	title: React.ReactNode;
	guid: string; // 原始点击小图guid

	isFromUpload: boolean;
	onSelect: (item: IFStructuralInfo) => void;
	onDetectFinished: (items: Array<IFStructuralInfo>) => void;
	taskType: ETaskType;
	sourceName: string;

	sourcePoint?: IFDeviceInfo;
	sourceTime: typeof DateFormat;
	onClose: () => void;
	isStructuralInfo: boolean;
	isStructuralMode: boolean; // 是否小图查看模式，true表示小图查看，false表示大图查看
};

type ContainerStateType = {
	structuralItemList: Array<IFStructuralInfo>;
	allStrcuturalItemList: Array<IFStructuralInfo>;
	prevAdditionalList: Array<IFStructuralInfo>;
	status: LoadStatus;
	relatedStatus: LoadStatus; // 相关图片加载状态，与status区分开来
};

class StructuralListDetectedPanelContrainer extends STComponent<
	ContainerPropsType,
	ContainerStateType
> {
	static defaultProps = {
		className: '',
		originalImageUrl: '',
		style: {},
		title: '',
		autoDetect: false,
		onSelect: noop,
		initDetect: true,
		additionalList: [],
		onDetectFinished: noop,
		guid: '',
		isFromUpload: false,
		taskType: ETaskType.Unknown,
		sourceName: '',
		onClose: noop,
		isStructuralInfo: true,
		isStructuralMode: true
	};

	_source: IFCancelTokenSource | null; // 请求取消handle
	_searchSource: IFCancelTokenSource | null;
	constructor(props: ContainerPropsType) {
		super(props);

		this.state = {
			structuralItemList: [],
			prevAdditionalList: [],
			allStrcuturalItemList: [],
			status: LoadStatus.unknown,
			relatedStatus: LoadStatus.unknown
		};

		this._source = null;
	}

	/**
	 * 初始化和重新渲染之前回调函数
	 * @NOTE: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
	 * @param {PropsType} props props
	 * @param {StateType} state state
	 * @returns {null | StateType} 返回Object来更新state, 返回null表明新的props不会引起state的更新
	 */
	static getDerivedStateFromProps(
		props: ContainerPropsType,
		state: ContainerStateType
	): Partial<ContainerStateType> | null {
		return {
			prevAdditionalList: props.additionalList
		};
	}

	componentDidMount() {
		if (this.props.originalImageId && this.props.initDetect) {
			this.detect();
		}
	}

	componentDidUpdate(
		prevProps: ContainerPropsType,
		prevState: ContainerStateType
	) {
		if (this.props.originalImageId !== prevProps.originalImageId) {
			// 不相等
			if (this.props.originalImageId && this.props.autoDetect) {
				// 有效性
				// 进行检测
				this.detect();
			}
		}
	}

	componentWillUnmount() {
		this.cancelRequest();
	}

	cancelRequest() {
		if (this._source) {
			this._source.cancel();
			this._source = null;
		}
	}
	cancelSearchRequest() {
		// 用于处理快速点击大图上下切换，快速检索数据错误
		if (this._searchSource) {
			this._searchSource.cancel();
			this._searchSource = null;
		}
	}

	detect() {
		this.setState({
			relatedStatus: LoadStatus.loading
		});

		// if (this.props.isStructuralMode) {
		this.getRelativeStructualListInImage(this.props.originalImageId)
			.then((list: Array<IFStructuralInfo>) => {
				this.setState({
					structuralItemList: list,
					relatedStatus: LoadStatus.finished
				});
				// 通过外边
				this.props.onDetectFinished(list);
				if (this.props.isFromUpload) {
					this.onQuickSearch(list);
				}
			})
			.catch((error: Error) => {
				this.setState({
					relatedStatus: LoadStatus.failed
				});
				if (!IFRequest.isCancel(error)) {
					this.setState({
						status: LoadStatus.failed
					});
				}
				console.error(error);
				// TODO: 反馈
			});
	}

	onQuickSearch = (list?: Array<IFStructuralInfo>) => {
		this.setState({
			allStrcuturalItemList: [],
			status: LoadStatus.loading
		});

		this.getAllStructuralListInImage(this.props.originalImageUrl)
			.then((allList: Array<IFStructuralInfo>) => {
				this.setState({
					allStrcuturalItemList: allList,
					status: LoadStatus.finished
				});
			})
			.catch((error: Error) => {
				this.setState({
					allStrcuturalItemList: list ? list : this.state.structuralItemList, // 失败了使用检测到的
					status: LoadStatus.finished
				});
			});
	};

	async getAllStructuralListInImage(imageUrl: string) {
		if (imageUrl) {
			this.cancelSearchRequest();
			this._searchSource = IFRequest.getCancelSource();
			let newStructuralList: IFDetectedStructualInfo = await CollectionResourceRequest.uploadImageAndDetectWithUrl(
				imageUrl,
				{
					cancelToken: this._searchSource.token
				}
			);
			return newStructuralList.result;
		} else {
			return Promise.reject(new Error('empty image url'));
		}
	}

	/**
	 * 查询关联的数据
	 * @param {string} imageId 大图id
	 * @returns {Promise<Array<IFStructuralInfo>>} 检测结果
	 * @memberof StructuralListDetectedPanelContrainer
	 */
	async getRelativeStructualListInImage(imageId: string) {
		this.cancelRequest();

		this._source = IFRequest.getCancelSource();
		// 大图获取小图
		let newStructuralList: Array<
			IFStructuralInfo
		> = await CollectionResourceRequest.getStructuralInfoFromOriginalImageId(
			imageId,
			[ETargetType.Face, ETargetType.Body, ETargetType.Vehicle],
			{
				cancelToken: this._source.token
			}
		);
		return newStructuralList;
	}

	render() {
		let faces: Array<IFStructuralInfo> = [];
		let bodies: Array<IFStructuralInfo> = [];

		for (let item of this.state.allStrcuturalItemList) {
			if (item.targetType === ETargetType.Face) {
				faces.push(item);
			} else if (item.targetType === ETargetType.Body) {
				bodies.push(item);
			}
		}
		// 判断prevAdditionalList
		for (let item of this.state.prevAdditionalList) {
			if (item.targetType === ETargetType.Face) {
				faces.push(item);
			} else if (item.targetType === ETargetType.Body) {
				bodies.push(item);
			}
		}

		return (
			<StructuralListDetectedPanel
				className={this.props.className}
				title={this.props.title}
				faces={faces}
				bodies={bodies}
				onSelect={this.props.onSelect}
				status={this.state.status}
				structuralItemList={this.state.structuralItemList}
				guid={this.props.guid}
				isFromUpload={this.props.isFromUpload}
				sourcePoint={this.props.sourcePoint}
				sourceTime={this.props.sourceTime}
				taskType={this.props.taskType}
				sourceName={this.props.sourceName}
				onClose={this.props.onClose}
				isStructuralInfo={this.props.isStructuralInfo}
				relatedStatus={this.state.relatedStatus}
				onQuickSearch={this.onQuickSearch}
				originalImageId={this.props.originalImageId}
			/>
		);
	}
}

class StructuralListDetectedPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		className: '',
		style: {},
		title: '',
		faces: [],
		bodies: [],
		onSelect: noop,
		isFromUpload: false,
		sourcePoint: null,
		sourceTime: '',
		taskType: ETaskType.Unknown,
		sourceName: '',
		onClose: noop,
		isStructuralInfo: true,
		relatedStatus: LoadStatus.unknown,
		onQuickSearch: noop,
		originalImageId: ''
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			isFromUpload: this.props.isFromUpload,
			activeKey: this.props.isFromUpload ? TabType.Search : TabType.Detail,
			supportedTarget: [],
			operatedBefore: false,
			preOriginalImageId: props.originalImageId
		};
	}

	static getDerivedStateFromProps(nextProps: PropsType, prevState: StateType) {
		let result: Partial<StateType> = {};
		if (nextProps.isFromUpload !== prevState.isFromUpload) {
			result = {
				isFromUpload: nextProps.isFromUpload,
				activeKey: nextProps.isFromUpload ? TabType.Search : TabType.Detail
			};
		}

		if (Object.keys(result).length > 0) {
			return result;
		} else {
			return null;
		}
	}

	componentDidMount() {
		CollectionTaskRequest.getSupportedAnalysisTasks()
			.then((supportedList: Array<ETargetType>) => {
				this.setState({
					supportedTarget: supportedList
				});
			})
			.catch((error: Error) => {
				console.error(error);
				// 显示默认
			});

		eventEmiiter.addListener(
			EventType.changeToQuickSearchTabIfNeeded,
			this.changeToQuickSearchTabIfNeeded
		);
	}

	componentWillUnmount() {
		eventEmiiter.removeListener(
			EventType.changeToQuickSearchTabIfNeeded,
			this.changeToQuickSearchTabIfNeeded
		);
	}

	changeToQuickSearchTabIfNeeded = () => {
		if (this.state.activeKey !== TabType.Search) {
			this.setState({
				activeKey: TabType.Search
			});
			this.props.onQuickSearch();
		}
	};

	componentDidUpdate(prevProps: PropsType, prevState: StateType) {
		if (
			this.props.originalImageId !== prevProps.originalImageId &&
			this.state.activeKey === TabType.Search
		) {
			prevProps.onQuickSearch();
		}
	}

	onClick = (item: IFStructuralInfo) => {
		this.props.onSelect(item);
	};

	_renderStructuralList(
		list: IFStructuralInfo[],
		type: ETargetType = ETargetType.Face
	) {
		return list.map((item: IFStructuralInfo, index: number) => {
			return (
				<StructuralItem
					clickable={true}
					className={`${ModuleStyle['structural-item']} ${
						type === ETargetType.Face
							? ModuleStyle['structural-item-face']
							: ModuleStyle['structural-teim-body']
					}`}
					contentClassName={`${ModuleStyle['structural-item-content']} ${
						type === ETargetType.Face
							? ModuleStyle['structural-item-content-face']
							: ModuleStyle['structural-item-content-body']
					}`}
					structuralItemInfo={item}
					key={item.uuid}
					onClick={this.onClick}
					displayMode={ImageDisplayMode.ScaleAspectFit}
					thumbFlag={
						type === ETargetType.Face
							? EThumbFlag.Thumb100x100
							: EThumbFlag.Thumb140x280
					}
				/>
			);
		});
	}

	handleTab = (key: TabType) => {
		if (key === TabType.Search && !this.state.operatedBefore) {
			this.props.onQuickSearch();
		}
		this.setState({
			activeKey: key,
			operatedBefore: true
		});
	};

	render() {
		let tip = '';
		switch (this.props.status) {
			case LoadStatus.failed:
				tip = intl.get('DETECT_STATUS_FAILED').d('暂未检测到数据');
				break;

			case LoadStatus.loading:
				tip = intl.get('DETECT_STAUS_LOADING').d('数据检测中');
				break;

			case LoadStatus.finished:
			case LoadStatus.unknown:
			default:
				break;
		}

		let faceTip = tip;
		let bodyTip = tip;
		if (this.props.status === LoadStatus.finished) {
			if (this.props.faces.length <= 0) {
				faceTip = intl.get('DETECT_NO_FACE').d('暂未检测到人脸');
			} else {
				faceTip = '';
			}

			if (this.props.bodies.length <= 0) {
				bodyTip = intl.get('DETECT_NO_BODY').d('暂未检测到人体');
			} else {
				bodyTip = '';
			}
		}

		const onlyHaveFace =
			this.state.supportedTarget.indexOf(ETargetType.Face) !== -1 &&
			this.state.supportedTarget.indexOf(ETargetType.Body) === -1;
		const bothNotHave =
			this.state.supportedTarget.indexOf(ETargetType.Face) === -1 &&
			this.state.supportedTarget.indexOf(ETargetType.Body) === -1;
		const bothHave =
			this.state.supportedTarget.indexOf(ETargetType.Face) !== -1 &&
			this.state.supportedTarget.indexOf(ETargetType.Body) !== -1;

		return (
			<div
				className={`${ModuleStyle['detected-panel']} ${this.props.className} ${
					this.state.isFromUpload
						? ModuleStyle['from-upload-detected-panel']
						: ''
				}`}
				style={this.props.style}
			>
				{/* <div className={ModuleStyle['title']}>{this.props.title}</div> */}
				<Tabs
					activeKey={this.state.activeKey}
					className={ModuleStyle['detail-search-tab']}
					onTabClick={this.handleTab}
				>
					{!this.state.isFromUpload && (
						<TabPane
							tab={intl.get('DETECT_IMAGE_DETAIL').d('照片详情')}
							key={TabType.Detail}
							className={ModuleStyle['detail-content']}
						>
							<StructuralDetailPanel
								structuralItemList={this.props.structuralItemList}
								onSelect={this.props.onSelect}
								guid={this.props.guid}
								sourcePoint={this.props.sourcePoint}
								sourceTime={this.props.sourceTime}
								taskType={this.props.taskType}
								sourceName={this.props.sourceName}
								onClose={this.props.onClose}
								isStructuralInfo={this.props.isStructuralInfo}
								status={this.props.relatedStatus}
							/>
						</TabPane>
					)}
					{bothNotHave ? null : bothHave ? (
						<TabPane
							tab={intl.get('DETECT_QUICK_SEARCH').d('快速检索')}
							key={TabType.Search}
						>
							<div className={ModuleStyle['content']}>
								<div className={ModuleStyle['target-tabs']}>
									<div className={ModuleStyle['target-tabs-header']}>
										<span className={ModuleStyle['target-tabs-title']}>
											{intl.get('DETECT_FACE').d('人脸')}
										</span>
										<span className={ModuleStyle['target-tabs-title']}>
											{intl.get('DETECT_BODY').d('人体')}
										</span>
									</div>
									<div className={ModuleStyle['target-content-body-wrapper']}>
										<div className={ModuleStyle['target-content-body']}>
											<div className={ModuleStyle['target-content-item']}>
												{this._renderStructuralList(
													this.props.faces,
													ETargetType.Face
												)}
												<div className={ModuleStyle['tip']}>{faceTip}</div>
											</div>
											<div className={ModuleStyle['target-content-item']}>
												{this._renderStructuralList(
													this.props.bodies,
													ETargetType.Body
												)}
												<div className={ModuleStyle['tip']}>{bodyTip}</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</TabPane>
					) : onlyHaveFace ? (
						<TabPane
							tab={intl.get('DETECT_QUICK_SEARCH').d('快速检索')}
							key={TabType.Search}
						>
							<div className={ModuleStyle['content']}>
								<div className={ModuleStyle['target-tabs-single']}>
									{this._renderStructuralList(
										this.props.faces,
										ETargetType.Face
									)}
									<div className={ModuleStyle['tip']}>{faceTip}</div>
								</div>
							</div>
						</TabPane>
					) : (
						<TabPane
							tab={intl.get('DETECT_QUICK_SEARCH').d('快速检索')}
							key={TabType.Search}
						>
							<div className={ModuleStyle['content']}>
								<div className={ModuleStyle['target-tabs-single']}>
									{this._renderStructuralList(
										this.props.bodies,
										ETargetType.Body
									)}
									<div className={ModuleStyle['tip']}>{bodyTip}</div>
								</div>
							</div>
						</TabPane>
					)}
				</Tabs>
			</div>
		);
	}
}

export default StructuralListDetectedPanelContrainer;
