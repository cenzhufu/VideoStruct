import * as React from 'react';
import AnalysisSourceProfileListItem from 'stcomponents/analysis-source-profile-list-item';
import {
	IFAnalysisSourceDetailInfo,
	CollectionAnalysisResultRequest,
	EAnalysisSourceStatus,
	CollectionCaptureRequests,
	CameraRequestDataType
} from 'stsrc/utils/requests/collection-request';
import {
	IFStructuralInfo,
	ESourceType,
	ETargetType,
	ListType,
	IFStructuralLinkInfo,
	EMerge
} from 'stsrc/type-define';
import {
	DataServerRequests,
	IStatisticItemInfo
} from 'stutils/requests/data-server-requests';
import { IFCancelTokenSource, IFRequestConfig } from 'ifutils/requests';
import IFRequest from 'ifvendors/utils/requests';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	className: string;
	style: React.CSSProperties;
	analysisSourceInfo: IFAnalysisSourceDetailInfo;
	selected: boolean;
	onSelected: (analysisSourceInfo: IFAnalysisSourceDetailInfo) => void;
	onUnselected: (analysisSourceInfo: IFAnalysisSourceDetailInfo) => void;
	onShowMore: (analysisSourceInfo: IFAnalysisSourceDetailInfo) => void;
	onClickItem: (
		structuralItemInfo: IFStructuralInfo,
		analysisSourceInfo: IFAnalysisSourceDetailInfo,
		index: number,
		infoList: Array<IFStructuralInfo>
	) => void;

	onDragStart: (structuralItemInfo: IFStructuralInfo) => void;
	onDragEnd: () => void;

	// 报告给父组件，数据加载成功的回调
	onLoadSuccessed: (
		items: Array<IFStructuralLinkInfo>,
		analysisSourceInfo: IFAnalysisSourceDetailInfo
	) => void;
	onLoadedFaild: (
		error: Error,
		analysisSourceInfo: IFAnalysisSourceDetailInfo
	) => void;
};

type StateType = {
	faceCount: number;
	bodyCount: number;
	resultInfos: Array<IFStructuralLinkInfo>;
	targetType: ETargetType;
	stream: string;
};

function noop() {}

class AnalysisResultDetailListItemContainer extends STComponent<
	PropsType,
	StateType
> {
	static defaultProps = {
		className: '',
		style: {},
		selected: false,

		onSelected: noop,
		onUnselected: noop,
		onShowMore: noop,
		onClickItem: noop,
		onDragStart: noop,
		onDragEnd: noop,
		onLoadSuccessed: noop,
		onLoadedFaild: noop
	};

	_isUmnounted: boolean;
	_source: IFCancelTokenSource | null; // 请求取消handle
	_timeHandler: number | null; // 定时器handel

	constructor(props: PropsType) {
		super(props);
		this.state = {
			faceCount: -1,
			bodyCount: -1,
			resultInfos: [],
			targetType: ETargetType.All,
			stream: ''
		};
		this._timeHandler = null;
		this._source = null;
	}

	componentDidMount() {
		this._isUmnounted = false;
		this.cleanRequest();
		this.cleanTimer();

		this.refreshCycle();
	}

	componentWillUnmount() {
		this._isUmnounted = true;

		this.cleanRequest();
		this.cleanTimer();
	}

	componentDidUpdate(prevProps: PropsType, prevState: StateType) {
		if (
			// 数据源不一样或者状态的切换
			this.props.analysisSourceInfo.id !== prevProps.analysisSourceInfo.id ||
			this.props.analysisSourceInfo.status !==
				prevProps.analysisSourceInfo.status
		) {
			this.cleanRequest();
			this.cleanTimer();
			this.refreshCycle();
		}
	}

	cleanTimer() {
		if (this._timeHandler) {
			window.clearTimeout(this._timeHandler);
			this._timeHandler = null;
		}
	}

	cleanRequest() {
		if (this._source) {
			this._source.cancel();
			this._source = null;
		}
	}

	/**
	 * 是否需要继续刷新
	 * @returns {boolean} 是否需要刷新
	 * @memberof AnalysisResultDetailListItemContainer
	 */
	needRefresh(): boolean {
		return (
			this.props.analysisSourceInfo.status ===
				EAnalysisSourceStatus.Analysising ||
			this.props.analysisSourceInfo.status ===
				EAnalysisSourceStatus.RealTimeAnalysis ||
			(this.props.analysisSourceInfo.status ===
				EAnalysisSourceStatus.Finished &&
				this.state.resultInfos.length <= 0)
		);
	}

	refreshCycle() {
		this.getDetailInfo()
			.then(() => {
				if (this.needRefresh()) {
					// 10s刷新逻辑
					this._timeHandler = window.setTimeout(() => {
						this.refreshCycle();
					}, 10 * 1000);
				}
			})
			.catch((error: Error) => {
				if (!IFRequest.isCancel(error)) {
					console.error(error);
					this.props.onLoadedFaild(error, this.props.analysisSourceInfo);
				} else {
					console.warn('取消查询');
				}
			});
	}

	onChangeTaskType = (type: ETargetType) => {
		this.setState(
			{
				targetType: type
			},
			() => {
				// 请求数据
				this.getTaskResult(
					this.props.analysisSourceInfo.sourceId,
					this.props.analysisSourceInfo.sourceType,
					type !== ETargetType.All ? type : undefined // 排除all的情况
				).then((result: ListType<IFStructuralLinkInfo>) => {
					if (!this._isUmnounted) {
						this.setState({
							resultInfos: result.list
						});
					}
				});
			}
		);
	};

	async getDetailInfo() {
		this._source = IFRequest.getCancelSource();

		// 获取结果
		let result: ListType<IFStructuralLinkInfo> = await this.getTaskResult(
			this.props.analysisSourceInfo.sourceId,
			this.props.analysisSourceInfo.sourceType,
			this.state.targetType !== ETargetType.All
				? this.state.targetType
				: undefined, // 排除all的情况
			{
				cancelToken: this._source.token
			}
		);

		this._source = null;
		if (!this._isUmnounted) {
			this.setState({
				resultInfos: result.list
			});

			this.props.onLoadSuccessed(result.list, this.props.analysisSourceInfo);

			// 获取统计数据
			if (this.props.analysisSourceInfo.sourceType !== ESourceType.Camera) {
				// NOTE: 实时视频不用获取统计数据
				this.getStatisticInfo();
			}
		}
	}

	getStream = () => {
		CollectionCaptureRequests.getCameraAddress(
			this.props.analysisSourceInfo.sourceId
		)
			.then((result: CameraRequestDataType) => {
				this.setState({
					stream: result.url
				});
			})
			.catch((error: Error) => {
				console.error(error);
			});
	};

	/**
	 * 获得分析的结果
	 * @param {string} sourceId 数据源id
	 * @param {ESourceType} sourceType 数据源类型
	 * @param {ETargetType} taskType 结构化数据类型
	 * @param {Partial<IFRequestConfig>} options 额外参数
	 * @returns {Promise<Array<IFStructuralInfo>>} 结果
	 * @memberof AnalysisProfilePage
	 */
	async getTaskResult(
		sourceId: string,
		sourceType: ESourceType,
		taskType?: ETargetType,
		options: Partial<IFRequestConfig> = {}
	): Promise<ListType<IFStructuralLinkInfo>> {
		return CollectionAnalysisResultRequest.getAnalysisResult(
			{
				sources: [
					{
						sourceId: sourceId,
						sourceType: sourceType
					}
				],
				targetTypes: taskType
					? [taskType]
					: [ETargetType.Face, ETargetType.Body], // 全部,
				page: 1,
				pageSize: 20,
				mergeType: EMerge.Union // 首页取并集
			},
			options
		);
	}

	async getStatisticInfo() {
		Promise.all([this.getFaceStatisticInfo(), this.getBodyStatisticInfo()])
			.then((resultList: [number, number]) => {
				if (!this._isUmnounted) {
					// 设置state
					this.setState({
						faceCount: resultList[0],
						bodyCount: resultList[1]
					});
				}
			})
			.catch((error: Error) => {
				console.error(error);
			});
	}

	async getFaceStatisticInfo(): Promise<number> {
		return DataServerRequests.getAnalysisFaceStaticResult({
			sources: [
				{
					sourceId: this.props.analysisSourceInfo.sourceId,
					sourceType: this.props.analysisSourceInfo.sourceType
				}
			]
		}).then((result: Array<IStatisticItemInfo>) => {
			// 直接获取结果
			return (result[0] && result[0].statisticalResult) || 0;
		});
	}

	async getBodyStatisticInfo(): Promise<number> {
		return DataServerRequests.getAnalysisBodyStaticResult({
			sources: [
				{
					sourceId: this.props.analysisSourceInfo.sourceId,
					sourceType: this.props.analysisSourceInfo.sourceType
				}
			]
		}).then((result: Array<IStatisticItemInfo>) => {
			// 直接获取结果
			return (result[0] && result[0].statisticalResult) || 0;
		});
	}

	render() {
		// 获得所有的structural info
		let allStructuralInfo: Array<
			IFStructuralInfo
		> = this.state.resultInfos.reduce<IFStructuralInfo[]>(function(
			prevValues: IFStructuralInfo[],
			currentValue: IFStructuralLinkInfo
		) {
			if (prevValues.length > 17) {
				return prevValues;
			} else {
				let result = [...prevValues];
				if (currentValue.face) {
					result.push(currentValue.face);
				}
				if (currentValue.body) {
					result.push(currentValue.body);
				}
				return result;
			}
		},
		[]);

		return (
			<AnalysisSourceProfileListItem
				className={this.props.className}
				style={this.props.style}
				targetType={this.state.targetType}
				analysisSourceInfo={this.props.analysisSourceInfo}
				resultInfos={allStructuralInfo}
				selected={this.props.selected}
				onSelected={this.props.onSelected}
				onUnselected={this.props.onUnselected}
				onShowMore={this.props.onShowMore}
				onClickItem={this.props.onClickItem}
				onDragStart={this.props.onDragStart}
				onDragEnd={this.props.onDragEnd}
				onChangeTaskType={this.onChangeTaskType}
				faceCount={this.state.faceCount}
				bodyCount={this.state.bodyCount}
				onStartPlay={this.getStream}
				stream={this.state.stream}
			/>
		);
	}
}

export default AnalysisResultDetailListItemContainer;
