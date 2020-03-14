import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import {
	IFStructuralLinkInfo,
	ETaskType,
	ETargetType,
	IFStructuralInfo,
	IFDeviceInfo
} from 'stsrc/type-define';
import {
	StructuralItemBodyWithTip,
	StructuralFaceBodyLinkItem
} from 'stsrc/components/structural-item';
import ModuleStyle from './assets/styles/index.module.scss';
import * as intl from 'react-intl-universal';
import * as InfiniteScroll from 'react-infinite-scroller';
import { EBodySize } from 'stsrc/components/structural-item/body-with-tip/src/StructuralItemBodyWithTip';
import { Empty } from 'antd';
import SourcePreviewer from 'stsrc/containers/source-previewer';
import Loading from 'stsrc/components/loading';

interface PropsType {
	resultsList: Array<IFStructuralLinkInfo>;
	showRelative: boolean; // 是否显示人体关联的信息
	loadMore: () => void; // 加载更多回调
	hasMore: boolean;
	isFirstLoading: boolean; // 是否第一次加载
	isLoadingMore: boolean; // 是否加载更多
	currentTargetType: ETargetType;
	searchTargetType: ETargetType;
	allPointsArr: IFDeviceInfo[];
	isUploading: boolean;
}
function noop() {}
class BodyResultPresentationPanel extends STComponent<PropsType> {
	static defaultProps = {
		resultsList: [],
		showRelative: false,
		hasMore: false,
		loadMore: noop,
		isFirstLoading: false,
		isLoadingMore: false,
		currentTargetType: ETargetType.Unknown,
		searchTargetType: ETargetType.Unknown,
		allPointsArr: [],
		isUploading: false
	};

	loadMore = () => {
		this.props.loadMore();
	};

	/**
	 * 点击小图查看大图 TODO:
	 * @param {IFStructuralInfo} info 点击的图片信息
	 * @param {number} index 索引
	 * @param {Array<IFStructuralInfo>} list 所有的数据
	 * @returns {void}
	 * @memberof SearchResultPage
	 */
	handleShowBigImage = (
		info: IFStructuralInfo,
		index: number,
		list: Array<IFStructuralLinkInfo>
	) => {
		let handle = SourcePreviewer.show({
			guid: info.guid,
			sourceId: String(info.sourceId),
			sourceType: info.sourceType,
			structuralInfoId: info.id,
			strucutralInfo: info,
			originalImageId: info.orignialImageId,
			originalImageUrl: info.originalImageUrl,
			originalImageWidth: info.originalImageWidth,
			originalImageHeight: info.originalImageHeight,
			// title,
			currentIndex: index,
			indicator: `${index + 1}/${list.length}`,
			disableLeftArrow: index <= 0,
			disableRightArrow: index >= list.length - 1,
			allPointsArr: this.props.allPointsArr,
			onQuickSearch: function onQuickSearch() {
				// handle.destory();
				// self.props.history.push(`/structuralize/search/result`);
				window.open(`${window.location.origin}/structuralize/search/result`);
			},
			goNext: (currentIndex: number) => {
				let nextIndex = Math.max(
					0,
					Math.min(list.length - 1, currentIndex + 1)
				);
				let nextLink: IFStructuralLinkInfo = list[nextIndex];
				let next: IFStructuralInfo | undefined = nextLink.body;
				handle.update({
					guid: next ? next.guid : undefined,
					sourceId: next ? next.sourceId : undefined,
					sourceType: next ? next.sourceType : undefined,
					structuralInfoId: next ? next.id : undefined,
					strucutralInfo: next,
					currentIndex: nextIndex,
					originalImageId: next ? next.orignialImageId : undefined,
					originalImageUrl: next ? next.originalImageUrl : undefined,
					originalImageWidth: next ? next.originalImageWidth : undefined,
					originalImageHeight: next ? next.originalImageHeight : undefined,
					indicator: `${nextIndex + 1}/${list.length}`,
					disableLeftArrow: false,
					disableRightArrow: nextIndex >= list.length - 1
				});
			},
			goPrev: (currentIndex: number) => {
				let prevIndex = Math.max(
					0,
					Math.min(list.length - 1, currentIndex - 1)
				);
				let prevLink: IFStructuralLinkInfo = list[prevIndex];
				let prev: IFStructuralInfo | undefined = prevLink.body;
				handle.update({
					guid: prev ? prev.guid : undefined,
					sourceId: prev ? prev.sourceId : undefined,
					sourceType: prev ? prev.sourceType : undefined,
					structuralInfoId: prev ? prev.id : undefined,
					strucutralInfo: prev ? prev : undefined,
					currentIndex: prevIndex,
					originalImageId: prev ? prev.orignialImageId : undefined,
					originalImageUrl: prev ? prev.originalImageUrl : undefined,
					originalImageWidth: prev ? prev.originalImageWidth : undefined,
					originalImageHeight: prev ? prev.originalImageHeight : undefined,
					indicator: `${prevIndex + 1}/${list.length}`,
					disableLeftArrow: prevIndex <= 0,
					disableRightArrow: false
				});
			},
			onClose: () => {
				handle.destory();
			},
			onOk: () => {
				handle.destory();
			}
		});
	};

	render() {
		let resultListComponent = this._renderResultsList(
			this.props.resultsList,
			this.props.showRelative
		);
		if (resultListComponent.length <= 0) {
			if (!this.props.isFirstLoading && !this.props.isLoadingMore) {
				// @ts-ignore
				resultListComponent = (
					<div className={ModuleStyle['no-results']}>
						<Empty description={intl.get('COMMON_NO_DATA').d('暂无数据')} />
					</div>
				);
			}
		}

		return (
			<div className={ModuleStyle['scroll-container']}>
				<InfiniteScroll
					className={ModuleStyle['scroll']}
					initialLoad={false}
					pageStart={1}
					loadMore={this.loadMore}
					hasMore={
						this.props.hasMore &&
						(!this.props.isLoadingMore || !this.props.isFirstLoading)
					}
					useWindow={false}
				>
					{resultListComponent}
					{
						<Loading
							show={!this.props.isUploading && this.props.isFirstLoading}
						/>
					}
					{/* {this.props.isLoadingMore && (
						<div className={ModuleStyle['loading-more-indicator']}>
							<Loading show={this.props.isLoadingMore} />
						</div>
					)} */}
				</InfiniteScroll>
			</div>
		);
	}

	isSearchTypeValid() {
		return this.props.searchTargetType !== ETargetType.Unknown;
	}

	_renderResultsList = (
		list: Array<IFStructuralLinkInfo>,
		showRelative: boolean = false
	) => {
		let bodyList: Array<IFStructuralLinkInfo> = list.filter(
			(item: IFStructuralLinkInfo) => {
				// eslint-disable-next-line
				return item.bodies.length > 0;
			}
		);
		return bodyList.reduce(
			(
				resultList: IFStructuralInfo[],
				item: IFStructuralLinkInfo,
				index: number
			) => {
				if (showRelative) {
					let bodyFaceResults: IFStructuralLinkInfo[] = [];
					for (let index = 0; index < item.bodies.length; index++) {
						let body = item.bodies[index];
						let linkInfo: IFStructuralLinkInfo = {
							uuid: `${body.uuid}_${index}`,
							body: body,
							faces: [],
							bodies: [],
							vehicles: []
						};
						for (let face of item.faces) {
							linkInfo.face = face;
						}
						bodyFaceResults.push(linkInfo);
					}

					return [
						...resultList,
						...bodyFaceResults.map((item: IFStructuralLinkInfo) => {
							// 关联的人脸人体
							let info: IFStructuralInfo = item.body as IFStructuralInfo;
							let uuid = item.uuid;
							let taskType: ETaskType = info.taskType;
							let taskTime = info.time || (item.face && item.face.time);
							let threshold = info.threshold || 0;

							if (
								this.isSearchTypeValid() ||
								this.props.currentTargetType !== this.props.searchTargetType
							) {
								threshold = 0;
							}
							return (
								<StructuralFaceBodyLinkItem
									className={ModuleStyle['structural-item']}
									key={uuid}
									structuralLinkInfo={item}
									taskType={taskType}
									taskTime={taskTime}
									threshold={threshold}
									structuralItemInfo={info}
									onClick={(structuralItemInfo: IFStructuralInfo) => {
										this.handleShowBigImage(
											structuralItemInfo,
											index,
											bodyList
										);
									}}
								/>
							);
						})
					];
				} else {
					return [
						...resultList,
						...item.bodies.map((body: IFStructuralInfo) => {
							return (
								<StructuralItemBodyWithTip
									className={ModuleStyle['result-list-item-body']}
									key={body.uuid}
									size={EBodySize.Big}
									structuralItemInfo={body}
									draggableData={body}
									clickable={true}
									onClick={(structuralItemInfo: IFStructuralInfo) => {
										this.handleShowBigImage(
											structuralItemInfo,
											index,
											bodyList
										);
									}}
								/>
							);
						})
					];
				}
			},
			[]
		);
	};
}

export default BodyResultPresentationPanel;
