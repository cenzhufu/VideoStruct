import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import ModuleStyle from './assets/styles/index.module.scss';
import StructuralItemBodyInteractive from 'stsrc/components/structural-item/body-interactive-item';
import StructuralItemFaceInteractive from 'stsrc/components/structural-item/face-interactive-item';
import { IFStructuralInfo, ETaskType } from 'stsrc/type-define';
import { Select, Icon } from 'antd';
import * as intl from 'react-intl-universal';
import StructuralSpinner from 'stsrc/components/spinner';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
// import { IFSearchStatisticInfo } from 'stsrc/utils/requests/search-service-requeests';
const isEqual = require('lodash/isEqual');

const Option = Select.Option;
export enum ESearchType {
	Face = 'face',
	Body = 'body'
}

interface PropsType {
	style: React.CSSProperties;
	traceResult: ITraceResultType[];
	searchType: string;
	isTracePlay: boolean;
	getTraceInfos: () => void;
	getThresholdSourceIdArr: (arr: Array<string>) => void;
	cancelThresholdSource: () => void;
	changeTracePlayStatus: () => void;
	onClick: (
		info: IFStructuralInfo,
		index: number,
		list: Array<IFStructuralInfo>
	) => void;

	searchTargetList: Array<IFStructuralInfo>;
	searchRange: Array<IFUniqueDataSource>; // 搜索范围（数据源）
	// statisticsInfos: IFSearchStatisticInfo[] | null;
	traceLoading: boolean;
}

interface StateType {
	showContent: boolean;
	prevTraceResult: ITraceResultType[];
	defaultThreshold: number;
}

interface IPathType extends IFStructuralInfo {
	isSelected?: boolean;
}

interface ITraceResultType {
	body: IPathType;
	face: IPathType;
}

function noop() {}

class MapTrace extends STComponent<PropsType, StateType> {
	static defaultProps = {
		searchType: ESearchType.Face,
		getTraceInfos: noop,
		getThresholdSourceIdArr: noop,
		cancelThresholdSource: noop,
		changeTracePlayStatus: noop,
		onClick: noop,
		searchTargetList: [],
		searchRange: [],
		// statisticsInfos: null,
		traceLoading: false
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			showContent: false,
			prevTraceResult: this.props.traceResult,
			defaultThreshold: props.searchType === ESearchType.Face ? 93 : 92
		};
	}
	static getDerivedStateFromProps(
		props: PropsType,
		state: StateType
	): Partial<StateType> | null {
		if (!isEqual(props.traceResult, state.prevTraceResult)) {
			return {
				prevTraceResult: props.traceResult
			};
		}
		return null;
	}
	componentDidUpdate(prevProps: PropsType, prevState: StateType) {
		if (!isEqual(prevProps.traceResult, this.props.traceResult)) {
			const newTraceResult = this.checkThreshold(
				this.props.traceResult,
				this.state.defaultThreshold
			);
			this.setState({
				prevTraceResult: newTraceResult
			});
		}
		if (
			!isEqual(prevProps.searchTargetList, this.props.searchTargetList) ||
			// !isEqual(prevProps.statisticsInfos, this.props.statisticsInfos) ||
			!isEqual(prevProps.searchRange, this.props.searchRange)
		) {
			this.onShowContent(false);
		}
	}
	componentWillUnmount() {
		this.props.cancelThresholdSource();
	}
	onShowContent = (show: boolean, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
		}
		if (show === false) {
			this.props.cancelThresholdSource();
		}
		this.setState({
			showContent: show
		});
	};
	onClickTitle = (e: React.MouseEvent) => {
		e.stopPropagation();
		this.props.getTraceInfos();
		this.onShowContent(true, e);
	};
	// 单张图片的选择状态
	onImgSelect = (id: string) => {
		const { searchType } = this.props;
		const { prevTraceResult } = this.state;
		const newTraceResult = prevTraceResult.map((item: ITraceResultType) => {
			const targetItem =
				searchType === ESearchType.Face ? item.face : item.body;
			if (targetItem.id === id) {
				if (targetItem.isSelected) {
					// 原本是选中，变为非选中
					targetItem.isSelected = false;
				} else {
					targetItem.isSelected = true;
				}
				if (ESearchType.Face) {
					return {
						face: targetItem,
						...item
					};
				} else {
					return {
						body: targetItem,
						...item
					};
				}
			} else {
				return item;
			}
		});
		this.filtSourceId(newTraceResult);
		this.setState({
			prevTraceResult: newTraceResult
		});
	};
	// 检测数据中的相似度，大于等于选择的相似度则添加字段控制是否选择
	checkThreshold = (traceResult: ITraceResultType[], threshold: number) => {
		const { searchType } = this.props;
		const newTraceResult = traceResult.map((item: ITraceResultType) => {
			// 只保留人脸或人体
			const targetItem =
				searchType === ESearchType.Face ? item.face : item.body;
			if (!targetItem) {
				return;
			}
			targetItem.isSelected = targetItem
				? targetItem.threshold >= threshold
				: false;
			if (ESearchType.Face) {
				return {
					face: targetItem,
					...item
				};
			} else {
				return {
					body: targetItem,
					...item
				};
			}
		});
		this.filtSourceId(newTraceResult);
		return newTraceResult;
	};
	// 判断哪些是已选择的，sourceIdArr用于通知轨迹一些信息
	filtSourceId = (traceResult: Array<ITraceResultType>) => {
		const { searchType } = this.props;
		// 过滤sourceIDs
		let listTraget = [];
		if (searchType === ESearchType.Face) {
			traceResult.forEach((v) => {
				if (v.face && v.face.taskType !== ETaskType.AnalysisTask) {
					listTraget.push(v.face);
				}
			});
		} else if (searchType === ESearchType.Body) {
			traceResult.forEach((v) => {
				if (v.body && v.body.taskType !== ETaskType.AnalysisTask) {
					listTraget.push(v.body);
				}
			});
		}
		let testsort = listTraget.sort(compare('time'));
		const sourceIdArrSort: Array<string> = testsort
			.filter((item) => {
				return item.isSelected;
			})
			.map((ele) => {
				return ele.sourceId;
			});
		this.props.getThresholdSourceIdArr(sourceIdArrSort);
	};
	//更改相似度
	changeThreshold = (value: number) => {
		const { prevTraceResult } = this.state;
		this.setState({
			defaultThreshold: value
		});
		this.checkThreshold(prevTraceResult, value);
	};
	// 查看大图
	handleShowBigPic = (
		info: IFStructuralInfo,
		index: number,
		list: Array<IFStructuralInfo>
	) => {
		this.props.onClick(info, index, list);
	};
	render() {
		const { searchType, changeTracePlayStatus, isTracePlay } = this.props;
		return (
			<div
				className={ModuleStyle['path-panel-container']}
				style={this.props.style}
			>
				<div
					className={`${ModuleStyle['path-panel-title']} ${
						this.state.showContent
							? ModuleStyle['open-content-panel-title']
							: ModuleStyle['default-panel-title']
					}`}
					onClick={this.onClickTitle}
				>
					<span>{intl.get('MAP_TRACE_SHOW_PATH').d('查看轨迹')}</span>
					{this.state.showContent && (
						<i
							className={ModuleStyle['close-btn']}
							onClick={(e) => {
								this.onShowContent(false, e);
							}}
						/>
					)}
				</div>
				{this.state.showContent && (
					<div className={ModuleStyle['path-panel-content']}>
						<div className={ModuleStyle['content-filter']}>
							<span className={ModuleStyle['filter-title']}>
								{intl.get('MAP_TRACE_SELECT_IMG').d('选择图片')}
							</span>
							{
								<div className={ModuleStyle['threhold']}>
									<span>{intl.get('MAP_TRACE_SIMILITY').d('相似度')}</span>
									<Select
										defaultValue={this.state.defaultThreshold}
										onChange={this.changeThreshold}
										className={ModuleStyle['select-list']}
										suffixIcon={<Icon type="caret-down" />}
									>
										<Option value={99}>99</Option>
										<Option value={98}>98</Option>
										<Option value={97}>97</Option>
										<Option value={96}>96</Option>
										<Option value={95}>95</Option>
										<Option value={94}>94</Option>
										<Option value={93}>93</Option>
										<Option value={92}>92</Option>
										<Option value={91}>91</Option>
										<Option value={90}>90</Option>
										<Option value={89}>89</Option>
										<Option value={88}>88</Option>
										<Option value={87}>87</Option>
										<Option value={86}>86</Option>
										<Option value={85}>85</Option>
										<Option value={84}>84</Option>
										<Option value={83}>83</Option>
										<Option value={82}>82</Option>
										<Option value={81}>81</Option>
										<Option value={80}>80</Option>
									</Select>
									<span>{intl.get('MAP_TRACE_BEYOND').d('以上')}</span>
								</div>
							}
						</div>
						<div className={ModuleStyle['list-container']}>
							{this.state.prevTraceResult.length ? (
								this.state.prevTraceResult.map(
									(item: ITraceResultType, index: number) => {
										const targetItem =
											searchType === ESearchType.Face ? (
												item.face.taskType !== ETaskType.AnalysisTask ? ( // 地图模式下不展示解析图片
													<StructuralItemFaceInteractive
														key={index}
														structuralItemInfo={item.face}
														onImgSelect={this.onImgSelect}
														showBigPic={() =>
															this.props.onClick(
																item.face,
																index,
																this.state.prevTraceResult.map(
																	(item: ITraceResultType) => item.face
																)
															)
														}
													/>
												) : null
											) : item.body.taskType !== ETaskType.AnalysisTask ? ( // 地图模式下不展示解析图片
												<StructuralItemBodyInteractive
													key={index}
													className={ModuleStyle['structural-item']}
													structuralItemInfo={item.body}
													onImgSelect={this.onImgSelect}
													showBigPic={() =>
														this.props.onClick(
															item.body,
															index,
															this.state.prevTraceResult.map(
																(item: ITraceResultType) => item.body
															)
														)
													}
												/>
											) : null;
										return targetItem;
									}
								)
							) : (
								<div className={ModuleStyle['no-data-container']}>
									{this.props.traceLoading ? (
										<StructuralSpinner />
									) : (
										intl.get('MAP_TRACE_NO_DATA').d('暂无数据')
									)}
								</div>
							)}
						</div>
						<div className={ModuleStyle['play-btn-container']}>
							<div
								className={ModuleStyle['play-btn']}
								onClick={changeTracePlayStatus}
							>
								{isTracePlay
									? intl.get('MAP_TRACE_PAUSE_PATH').d('暂停播放')
									: intl.get('MAP_TRACE_PLAY_PATH').d('播放轨迹')}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default MapTrace;

function compare(property) {
	return function(obj1, obj2) {
		let value1 = new Date(obj1[property]);
		let value2 = new Date(obj2[property]);
		return value1 - value2; // 升序
	};
}
