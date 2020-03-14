import * as React from 'react';
import AnaylysisResultDetailListitem from 'stcomponents/analysis-result-detail-list-item';
import ModuleStyle from './index.module.scss';
import { match } from 'react-router';
import * as H from 'history';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import {
	IFAnalysisSourceDetailInfo,
	CollectionAnalysisResultRequest,
	IFAnalysisResourceResPayload,
	AnalysisResourceDetailProxyHandler,
	IFUniqueDataSource
} from 'stsrc/utils/requests/collection-request';
import * as intl from 'react-intl-universal';
import { Button, Tabs, message } from 'antd';
import AttributeFilterPanel, {
	IFNewAttributesFilterInfo
} from 'stcomponents/attribute-filter-panel';
import {
	ETargetType,
	ESourceType,
	IFStructuralInfo,
	ListType,
	IFStructuralLinkInfo
} from 'stsrc/type-define';
import {
	StructuralItemFaceWithTip,
	StructuralItemBodyWithTip
} from 'stcomponents/structural-item';
import SourcePreviewer from 'stcontainers/source-previewer';
import * as InfiniteScroll from 'react-infinite-scroller';
import Loading from 'stcomponents/loading';
import {
	DataServerRequests,
	IStatisticItemInfo
} from 'stsrc/utils/requests/data-server-requests';

import { ImageDisplayMode } from 'ifvendors/image-view';
import STComponent from 'stcomponents/st-component';
import IFRequest, { IFCancelTokenSource } from 'ifvendors/utils/requests';

const TabPane = Tabs.TabPane;

type PropsType = {
	match: match;
	history: H.History;
	location: H.Location;
};

type StateType = {
	sourceList: Array<IFAnalysisSourceDetailInfo>; // 数据源id列表
	selectedSourceIdSet: Set<string>; // 选择的id集合
	resultList: Array<IFStructuralLinkInfo>; // 结果
	total: number;

	taskType: ETargetType;
	page: number;
	pageSize: number;

	loading: boolean;

	faceCount: number;
	bodyCount: number;
};

class AnalysisDetailPage extends STComponent<PropsType, StateType> {
	static defaultProps = {};

	attributeFilterPanelRef: React.RefObject<AttributeFilterPanel>;
	_isUmnounted: boolean;
	_source: IFCancelTokenSource | null; // 请求取消handle

	constructor(props: PropsType) {
		super(props);
		this.state = {
			sourceList: [],
			selectedSourceIdSet: new Set(),
			taskType: ETargetType.All,
			page: 1,
			pageSize: 100,
			resultList: [],
			loading: true,
			total: 0,

			faceCount: -1,
			bodyCount: -1
		};

		this.attributeFilterPanelRef = React.createRef<AttributeFilterPanel>();
		this._isUmnounted = false;

		this._source = null;
	}

	componentDidMount() {
		let state = this.props.location.state || { sourceList: [] };

		let sourceList: Array<
			IFAnalysisSourceDetailInfo
		> = ValidateTool.getValidArray(state['sourceList']);
		let idSet = new Set();
		for (let item of sourceList) {
			idSet.add(item.id);
		}

		// 转换成Proxy对象
		let proxyList: Array<IFAnalysisSourceDetailInfo> = [];
		for (let info of sourceList) {
			proxyList.push(new Proxy(info, AnalysisResourceDetailProxyHandler));
		}
		this.setState(
			{
				sourceList: proxyList,
				selectedSourceIdSet: idSet
			},
			() => {
				this.refreshPage();
			}
		);
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

	refreshPage(
		page: number = this.state.page,
		pageSize: number = this.state.pageSize
	) {
		this.setState({
			loading: true
		});
		this.getAnalysisTaskResult(page, pageSize)
			.then((result: ListType<IFStructuralLinkInfo>) => {
				this._source = null; // IMPORTANT: 防止取消
				this.setState((prevState: StateType) => {
					console.log('收到的数据', result);
					return {
						loading: false,
						page: page,
						pageSize: pageSize,
						resultList: result.list,
						total: result.total
					};
				});

				// 统计数据请求
				this.getStatisticInfo();
			})
			.catch((error: Error) => {
				if (!IFRequest.isCancel(error)) {
					console.error(error);
					message.error(error.message);
					// 我们已经开始refresh loading == true，如果因为cancel之后而设置这个为false，则页面中的加载状态则不会出现
					// 样式就会有问题
					// 所以在cancel为true时我们也不设置loading: false
					this.setState({
						loading: false
					});
				}
			});
	}

	loadMore = () => {
		this.setState(
			(prevState: StateType) => {
				return {
					loading: true,
					page: prevState.page + 1
				};
			},
			() => {
				let page: number = this.state.page;
				let pageSize = this.state.pageSize;
				this.getAnalysisTaskResult(page, pageSize)
					.then((result: ListType<IFStructuralLinkInfo>) => {
						this.setState((prevState: StateType) => {
							return {
								loading: false,
								page: page,
								pageSize: pageSize,
								resultList: [...prevState.resultList, ...result.list],
								// NOTE: 不再忽略total字段，因为切换的时候可能造成一次load more
								total: result.total
							};
						});
					})
					.catch((error: Error) => {
						if (!IFRequest.isCancel(error)) {
							console.error(error);
							message.error(error.message);
						}

						this.setState({
							loading: false
						});
					});
			}
		);
	};

	getAnalysisTaskResult(page: number, pageSize: number) {
		let requestPayload: IFAnalysisResourceResPayload | null = this.getRequestPayload(
			page,
			pageSize
		);

		this.cancelRequest();

		if (requestPayload) {
			this._source = IFRequest.getCancelSource();
			return CollectionAnalysisResultRequest.getAnalysisResult(requestPayload, {
				cancelToken: this._source.token
			});
		} else {
			return Promise.reject(intl.get('---------ddddundddd').d('错误的参数'));
		}
	}

	/**
	 * 获取请求的参数
	 * @param {number} page page
	 * @param {number} pageSize pageSize
	 * @returns {IFAnalysisResourceResPayload | null} 请求参数
	 * @memberof AnalysisDetailPage
	 */
	getRequestPayload(
		page: number = this.state.page,
		pageSize: number = this.state.pageSize
	): IFAnalysisResourceResPayload | null {
		if (this.attributeFilterPanelRef.current) {
			let attributeParam: IFNewAttributesFilterInfo = this.attributeFilterPanelRef.current.getNewParams();
			// let sourceIds: Array<string> = [];
			// let sourceTypes: Array<ESourceType> = [];

			let selectedInfoList: Array<
				IFAnalysisSourceDetailInfo
			> = this.state.sourceList.filter((item: IFAnalysisSourceDetailInfo) => {
				return this.state.selectedSourceIdSet.has(item.id);
			});

			let sources: Array<IFUniqueDataSource> = [];
			selectedInfoList.forEach((item: IFAnalysisSourceDetailInfo) => {
				sources.push({
					sourceId: item.sourceId,
					sourceType: item.sourceType
				});
				// sourceIds.push(item.sourceId);
				// sourceTypes.push(item.sourceType);
			});

			let result: IFAnalysisResourceResPayload = {
				// sourceIds: sourceIds,
				// sourceTypes: sourceTypes,
				sources: sources,
				targetTypes: [this.state.taskType],
				page: page,
				pageSize: pageSize,

				...attributeParam
			};
			// console.log('params', { result });
			return result;
		} else {
			return null;
		}
	}

	async getStatisticInfo() {
		if (this.attributeFilterPanelRef.current) {
			let attributeParam: IFNewAttributesFilterInfo = this.attributeFilterPanelRef.current.getNewParams();
			let sourceIds: Array<string> = [];
			let sourceTypes: Array<ESourceType> = [];

			let selectedInfoList: Array<
				IFAnalysisSourceDetailInfo
			> = this.state.sourceList.filter((item: IFAnalysisSourceDetailInfo) => {
				return this.state.selectedSourceIdSet.has(item.id);
			});

			selectedInfoList.forEach((item: IFAnalysisSourceDetailInfo) => {
				sourceIds.push(item.sourceId);
				sourceTypes.push(item.sourceType);
			});
			Promise.all([
				this.getAllFaceStatisticInfo(sourceIds, sourceTypes, attributeParam),
				this.getAllBodyStatisticInfo(sourceIds, sourceTypes, attributeParam)
			])
				.then((resultList: [Array<number>, Array<number>]) => {
					let faceCount = resultList[0].reduce(
						(previousValue: number, currentValue: number) => {
							return previousValue + currentValue;
						},
						0
					);
					let totalCount = resultList[1].reduce(
						(previousValue: number, currentValue: number) => {
							return previousValue + currentValue;
						},
						0
					);
					if (!this._isUmnounted) {
						// 设置state
						this.setState({
							faceCount: faceCount,
							bodyCount: totalCount
						});
					}
				})
				.catch((error: Error) => {
					console.error(error);
				});
		}
	}

	async getAllFaceStatisticInfo(
		sourceIds: Array<string>,
		sourceTypes: Array<ESourceType>,
		attributeParam: IFNewAttributesFilterInfo
	): Promise<Array<number>> {
		if (sourceIds.length !== sourceTypes.length) {
			return Promise.reject(new Error('请求参数长度不一致'));
		}

		let allRequest = [];
		for (let i = 0; i < sourceIds.length; i++) {
			let sourceId: string = sourceIds[i];
			let sourceType: ESourceType = sourceTypes[i];
			allRequest.push(
				this.getFaceStatisticInfo(sourceId, sourceType, attributeParam)
			);
		}

		return Promise.all(allRequest);
	}

	getAllBodyStatisticInfo(
		sourceIds: Array<string>,
		sourceTypes: Array<ESourceType>,
		attributeParam: IFNewAttributesFilterInfo
	): Promise<Array<number>> {
		if (sourceIds.length !== sourceTypes.length) {
			return Promise.reject(new Error('请求参数长度不一致'));
		}

		let allRequest = [];
		for (let i = 0; i < sourceIds.length; i++) {
			let sourceId: string = sourceIds[i];
			let sourceType: ESourceType = sourceTypes[i];
			allRequest.push(
				this.getBodyStatisticInfo(sourceId, sourceType, attributeParam)
			);
		}

		return Promise.all(allRequest);
	}

	async getFaceStatisticInfo(
		sourceId: string,
		sourceType: ESourceType,
		attributeParam: IFNewAttributesFilterInfo
	): Promise<number> {
		return DataServerRequests.getAnalysisFaceStaticResult({
			// sourceIds: [sourceId],
			// sourceTypes: [sourceType],
			sources: [
				{
					sourceId: sourceId,
					sourceType: sourceType
				}
			],
			...attributeParam
		}).then((result: Array<IStatisticItemInfo>) => {
			// 直接获取结果
			return (result[0] && result[0].statisticalResult) || 0;
		});
	}

	async getBodyStatisticInfo(
		sourceId: string,
		sourceType: ESourceType,
		attributeParam: IFNewAttributesFilterInfo
	): Promise<number> {
		return DataServerRequests.getAnalysisBodyStaticResult({
			// sourceIds: sourceIds,
			// sourceTypes: sourceTypes,
			sources: [
				{
					sourceId: sourceId,
					sourceType: sourceType
				}
			],
			...attributeParam
		}).then((result: Array<IStatisticItemInfo>) => {
			// 直接获取结果
			return (result[0] && result[0].statisticalResult) || 0;
		});
	}

	onChangeTaskType = (key: string) => {
		this.setState(
			// @ts-ignore
			{
				taskType: key,
				page: 1,
				resultList: [], // 清空数据
				total: 0
			},
			() => {
				this.refreshPage(1, this.state.pageSize);
			}
		);
	};

	selectSource = (sourceInfo: IFAnalysisSourceDetailInfo) => {
		this.setState(
			(prevState: StateType) => {
				let newSet = new Set(prevState.selectedSourceIdSet);
				newSet.add(sourceInfo.id);
				return {
					selectedSourceIdSet: newSet
				};
			},
			() => {
				this.refreshPage();
			}
		);
	};

	unselectSource = (sourceInfo: IFAnalysisSourceDetailInfo) => {
		this.setState(
			(prevState: StateType) => {
				let newSet = new Set(prevState.selectedSourceIdSet);
				newSet.delete(sourceInfo.id);
				return {
					selectedSourceIdSet: newSet
				};
			},
			() => {
				this.refreshPage();
			}
		);
	};

	onBack = () => {
		this.props.history.goBack();
	};

	onChangeAttribute = (attribute: IFNewAttributesFilterInfo) => {
		this.setState(
			{
				page: 1
			},
			() => {
				this.refreshPage();
			}
		);
	};

	showSourcePreview = (
		structuralItemInfo: IFStructuralInfo,
		index: number,
		list: IFStructuralInfo[]
	) => {
		let handle = SourcePreviewer.show({
			sourceId: structuralItemInfo.sourceId,
			sourceType: structuralItemInfo.sourceType,
			structuralInfoId: structuralItemInfo.id,
			strucutralInfo: structuralItemInfo,
			originalImageId: structuralItemInfo.orignialImageId,
			originalImageUrl: structuralItemInfo.originalImageUrl,
			originalImageWidth: structuralItemInfo.originalImageWidth,
			originalImageHeight: structuralItemInfo.originalImageHeight,
			currentIndex: index,
			disableLeftArrow: index <= 0,
			disableRightArrow: index >= this.state.resultList.length - 1,
			// title: title,
			indicator: `${index + 1}/${this.state.resultList.length}`,
			goNext: (currentIndex: number) => {
				let nextIndex = Math.max(
					0,
					Math.min(this.state.resultList.length - 1, currentIndex + 1)
				);
				let next: IFStructuralInfo = list[nextIndex];

				handle.update({
					sourceId: next.sourceId,
					sourceType: next.sourceType,
					structuralInfoId: next.id,
					strucutralInfo: next,
					currentIndex: nextIndex,
					originalImageId: next.orignialImageId,
					originalImageUrl: next.originalImageUrl,
					originalImageWidth: next.originalImageWidth,
					originalImageHeight: next.originalImageHeight,
					indicator: `${nextIndex + 1}/${this.state.resultList.length}`,
					disableLeftArrow: false,
					disableRightArrow: nextIndex >= this.state.resultList.length - 1
				});
			},
			goPrev: (currentIndex: number) => {
				let prevIndex = Math.max(
					0,
					Math.min(this.state.resultList.length - 1, currentIndex - 1)
				);
				let prev: IFStructuralInfo = list[prevIndex];
				handle.update({
					sourceId: prev.sourceId,
					sourceType: prev.sourceType,
					structuralInfoId: prev.id,
					strucutralInfo: prev,
					currentIndex: prevIndex,
					originalImageId: prev.orignialImageId,
					originalImageUrl: prev.originalImageUrl,
					originalImageWidth: prev.originalImageWidth,
					originalImageHeight: prev.originalImageHeight,
					indicator: `${prevIndex + 1}/${this.state.resultList.length}`,
					disableLeftArrow: prevIndex <= 0,
					disableRightArrow: false
				});
			},
			onClose: function onClock() {
				handle.destory();
			},
			onQuickSearch: function onQuickSearch() {
				handle.destory();
				window.open(`${window.location.origin}/structuralize/search/result`);
				// self.props.history.push(`/structuralize/search/result`);
			},
			onOk: function onClock() {
				handle.destory();
			}
		});
	};

	render() {
		let totalCountTip = '---';
		let faceCountTip = '---';
		let bodyCountTip = '---';

		if (this.state.faceCount !== -1 && this.state.bodyCount !== -1) {
			totalCountTip =
				this.state.faceCount +
				this.state.bodyCount +
				intl.get('COMMON_COUNT').d('张');
		}

		if (this.state.faceCount !== -1) {
			faceCountTip = this.state.faceCount + intl.get('COMMON_COUNT').d('张');
		}

		if (this.state.bodyCount !== -1) {
			bodyCountTip = this.state.bodyCount + intl.get('COMMON_COUNT').d('张');
		}

		//
		let list: Array<IFStructuralInfo> = this.state.resultList.reduce<
			IFStructuralInfo[]
		>((prevValue: IFStructuralInfo[], currentValue: IFStructuralLinkInfo) => {
			if (currentValue.face) {
				prevValue.push(currentValue.face);
			}

			if (currentValue.body) {
				prevValue.push(currentValue.body);
			}
			return prevValue;
		}, []);

		return (
			<div className={ModuleStyle['analysis-detail-page']}>
				<div className={ModuleStyle['source-list-panel']}>
					<div className={ModuleStyle['source-list-title']}>
						<div>
							{intl.get('ANALYSIS_DETIAL_PAGE_VIEW_FILE').d('文件查看')}
						</div>
						<Button
							className={ModuleStyle['return-button']}
							onClick={this.onBack}
						>
							{intl.get('COMMON_RETURE').d('返回')}
						</Button>
					</div>
					<ul className={ModuleStyle['source-list-content']}>
						{this.state.sourceList.map(
							(sourceInfo: IFAnalysisSourceDetailInfo) => {
								return (
									<AnaylysisResultDetailListitem
										disabled={
											this.state.selectedSourceIdSet.has(sourceInfo.id) &&
											this.state.selectedSourceIdSet.size === 1
										}
										className={ModuleStyle['source-item']}
										anylysisSourceInfo={sourceInfo}
										key={sourceInfo.id}
										isSelected={this.state.selectedSourceIdSet.has(
											sourceInfo.id
										)}
										selectSource={this.selectSource}
										unselectSource={this.unselectSource}
									/>
								);
							}
						)}
					</ul>
				</div>
				<div className={ModuleStyle['filter-result-panel']}>
					<div className={ModuleStyle['task-fileter-panel']}>
						<Tabs
							className={ModuleStyle['tabs-panel']}
							defaultActiveKey={ETargetType.All}
							activeKey={this.state.taskType}
							onChange={this.onChangeTaskType}
						>
							<TabPane
								tab={
									<div>
										{
											<span>
												{intl.get('ANALYSIS_INFO_TARGET_ALL').d('全部')}
											</span>
										}
										&nbsp;
										{<span>{`(${totalCountTip})`}</span>}
									</div>
								}
								key={ETargetType.All}
							/>
							<TabPane
								tab={
									<div>
										{
											<span>
												{intl.get('ANALYSIS_INFO_TARGET_FACE').d('人脸')}
											</span>
										}
										&nbsp;
										{<span>{`(${faceCountTip})`}</span>}
									</div>
								}
								key={ETargetType.Face}
							/>
							<TabPane
								tab={
									<div>
										{
											<span>
												{intl.get('ANALYSIS_INFO_TARGET_BODY').d('人体')}
											</span>
										}
										&nbsp;
										{<span>{`(${bodyCountTip})`}</span>}
									</div>
								}
								key={ETargetType.Body}
							/>
							<TabPane
								disabled={true}
								tab={intl.get('ANALYSIS_INFO_TARGET_CAR').d('车辆')}
								key={ETargetType.Vehicle}
							/>
						</Tabs>
					</div>

					{/* <AttributeFilterPanel
						ref={this.attributeFilterPanelRef}
						className={ModuleStyle['attribute-filter-panel']}
						searchType={this.state.taskType}
						showThreshold={false}
						showAttributeConfidence={true}
						onConfirm={this.onChangeAttribute}
					/> */}

					<div className={ModuleStyle['result-content']}>
						<div className={ModuleStyle['scroll-container']}>
							<InfiniteScroll
								className={ModuleStyle['result-content-scroller']}
								initialLoad={false}
								pageStart={1}
								loadMore={this.loadMore}
								hasMore={
									this.state.total > this.state.resultList.length &&
									!this.state.loading
								}
								useWindow={false}
							>
								{list.map((structuralInfo: IFStructuralInfo, index: number) => {
									// let className = `${ModuleStyle['structural-item']}`;
									if (structuralInfo.targetType === ETargetType.Body) {
										return (
											<StructuralItemBodyWithTip
												// className={`${className}`}
												key={structuralInfo.uuid}
												structuralItemInfo={structuralInfo}
												draggableData={structuralInfo}
												clickable={true}
												onClick={(item: IFStructuralInfo) => {
													this.showSourcePreview(item, index, list);
												}}
												displayMode={ImageDisplayMode.ScaleAspectFit}
											/>
										);
									} else {
										return (
											<StructuralItemFaceWithTip
												// className={`${className}`}
												key={structuralInfo.uuid}
												structuralItemInfo={structuralInfo}
												draggableData={structuralInfo}
												clickable={true}
												onClick={(item: IFStructuralInfo) => {
													this.showSourcePreview(item, index, list);
												}}
												displayMode={ImageDisplayMode.ScaleAspectFit}
											/>
										);
									}
								})}
							</InfiniteScroll>
						</div>

						<Loading
							show={this.state.loading}
							tip={intl.get('COMMON_LOADING').d('加载中....')}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default AnalysisDetailPage;
