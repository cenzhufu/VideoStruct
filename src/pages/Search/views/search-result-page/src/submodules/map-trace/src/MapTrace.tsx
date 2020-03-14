import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import ModuleStyle from './assets/styles/index.module.scss';
import StructuralItemBodyInteractive from 'stsrc/components/structural-item/body-interactive-item';
import StructuralItemFaceInteractive from 'stsrc/components/structural-item/face-interactive-item';
import { IFStructuralInfo } from 'stsrc/type-define';
import { Select } from 'antd';
import * as intl from 'react-intl-universal';
import Config from 'stsrc/utils/config';
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

class MapTrace extends STComponent<PropsType, StateType> {
	static defaultProps = {
		searchType: ESearchType.Face
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			showContent: false,
			prevTraceResult: this.props.traceResult,
			defaultThreshold: Config.getFaceDefaultThreshold()
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
	}
	componentWillUnmount() {
		console.log('zml 准备销毁');
	}
	onShowContent = (show: boolean, e: React.MouseEvent) => {
		e.stopPropagation();
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
			targetItem.isSelected = targetItem.threshold >= threshold;
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
		const sourceIdArr: Array<string> = traceResult
			.filter((item: ITraceResultType) => {
				const targetItem =
					searchType === ESearchType.Face ? item.face : item.body;
				return targetItem.isSelected;
			})
			.map((item: ITraceResultType) => {
				const targetItem =
					searchType === ESearchType.Face ? item.face : item.body;
				return targetItem.sourceId;
			});
		this.props.getThresholdSourceIdArr(sourceIdArr);
	};
	//更改相似度
	changeThreshold = (value: number) => {
		const { prevTraceResult } = this.state;
		this.setState({
			defaultThreshold: value
		});
		this.checkThreshold(prevTraceResult, value);
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
							onClick={(e) => {
								this.onShowContent(false, e);
							}}
						>
							x
						</i>
					)}
				</div>
				{this.state.showContent && (
					<div className={ModuleStyle['path-panel-content']}>
						<div className={ModuleStyle['content-filter']}>
							<span className={ModuleStyle['filter-title']}>
								{intl.get('MAP_TRACE_SELECT_IMG').d('选择图片')}
							</span>
							<div className={ModuleStyle['threhold']}>
								<span>{intl.get('MAP_TRACE_SIMILITY').d('相似度')}</span>
								<Select
									defaultValue={this.state.defaultThreshold}
									onChange={this.changeThreshold}
								>
									<Option value={93}>93</Option>
									<Option value={92}>92</Option>
									<Option value={85}>85</Option>
								</Select>
								<span>{intl.get('MAP_TRACE_BEYOND').d('以上')}</span>
							</div>
						</div>
						<div className={ModuleStyle['list-container']}>
							{this.state.prevTraceResult.length ? (
								this.state.prevTraceResult.map(
									(item: ITraceResultType, index: number) => {
										const targetItem =
											searchType === ESearchType.Face ? (
												<StructuralItemFaceInteractive
													key={index}
													structuralItemInfo={item.face}
													onImgSelect={this.onImgSelect}
												/>
											) : (
												<StructuralItemBodyInteractive
													key={index}
													structuralItemInfo={item.body}
													onImgSelect={this.onImgSelect}
												/>
											);
										return targetItem;
									}
								)
							) : (
								<div className={ModuleStyle['no-data-container']}>
									{intl.get('MAP_TRACE_NO_DATA').d('暂无数据')}
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
