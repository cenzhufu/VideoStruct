import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ModuleStyle from './index.module.scss';
import * as intl from 'react-intl-universal';

import Previewer from 'ifvendors/previewer';
import StructuralListDetectedPanel from 'stcomponents/structual-list-detected-panel';

import ControlPanel from './submodules/control-panel';
import StructuralImageLabel from './submodules/structural-image-label';
import Language from 'stutils/locales';
import {
	CollectionResourceRequest,
	// IFDetectedStructualInfo,
	IFOriginalImageInfo,
	CollectionAnalysisSourceRequest,
	IFAnalysisSourceDetailInfo,
	CollectionCaptureRequests,
	CameraRequestDataType,
	IFDetectedStructualInfo
} from 'stutils/requests/collection-request';
import {
	IFStructuralInfo,
	ESourceType,
	IFDeviceInfo,
	DateFormat,
	ETaskType,
	ETargetType,
	generateUnvalidStructuralInfo
} from 'sttypedefine';
import ImageView, { ImageDisplayMode } from 'ifvendors/image-view';
import STComponent from 'stcomponents/st-component';
import SearchUploadImagePanel from 'stsrc/pages/Search/views/search-target-panel-container';
import { saveStructuralInfoMemo } from 'stsrc/pages/Search/views/search-result-page';
import VideoPlayer, { Player } from 'ifvendors/video-player';
import { TypeValidate } from 'ifvendors/utils/validate-tool';
import IFRequest from 'ifvendors/utils/requests';
import { message } from 'antd';

import {
	VideoCameraGreenIconComponent,
	ZipRedIconComponent,
	CameraBlueIconComponent
} from 'stsrc/components/icons';
// import CropStateControlBar from './submodules/crop-state-control-bar';
import * as moment from 'moment';
import { Provider } from 'react-redux';
import store from 'src/redux';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';

export enum ESourcePreviewerMode {
	StructuralMode = 'structural-mode',
	OriginalMode = 'original-mode',
	OriginalUnvalidTimeMode = 'original-unvalid-time-mode' // 大图，但是时间戳不对（地图模式下，这些数据是从小图抽离出来的，所有有这个模式）
}

type PropsType = {
	structuralInfoId: string; // 小图id, 用来获取大图信息，从中得到timeStamp
	sourceId: string;
	sourceType: ESourceType;
	strucutralInfo: IFStructuralInfo; // 小图信息

	originalImageId: Required<string>; // 大图的id
	originalImageUrl: Required<string>; // 大图的链接地址

	visible: boolean;
	// title: string | React.ReactNode;
	indicator: string | React.ReactNode;
	onClose: () => void;
	maxCount: number;
	onOk: (list: Array<IFStructuralInfo>) => void;

	currentIndex: number;
	goNext: (currentIndex: number) => void;
	goPrev: (currentIndex: number) => void;
	disableLeftArrow: boolean;
	disableRightArrow: boolean;
	allPointsArr: IFDeviceInfo[];

	//
	autoDetect: boolean; // 在图片改变的情况下自动执行检测
	defaultDetect: boolean; // 第一次显示时是否检测
	defaultShowStructuralLabel: boolean; // 模式是否显示标注

	originalImageWidth?: number;
	originalImageHeight?: number;

	onQuickSearch: () => void; // 快速搜索

	guid: string; // 用来过滤相关图片时使用

	// 二期添加
	mode: ESourcePreviewerMode;
	originalImageInfo?: IFOriginalImageInfo; // 为了不引起之前调用的lint error, 这儿先使用问号
};

type StateType = {
	prevImageId: string | undefined; // 上一次的imageId
	isCropperState: boolean;

	showStructuralLabel: boolean; // 是否显示标注
	structuralItemList: Array<IFStructuralInfo>; // 检测到的结构列表

	isLoading: boolean;
	timeStamp: number; //  对于视频来说，表示解析大图在视频中的时间(s)，实时视频流则是时间戳
	playing: boolean;
	videoUrl: string; // 视频地址
	isStream: boolean;
	isLoadingLiveUrl: boolean; // 是否加载实时视频

	showVideo: boolean;

	analysisSourceInfo: IFAnalysisSourceDetailInfo | null;

	totalDeltaX: number;
	totalDeltaY: number;
	sourcePoint?: IFDeviceInfo;
	detectNoFace: boolean;
};

function noop() {}

type VideoRelativeInfo = {
	timestamp: number;
	videoUrl: string;
	analysisSourceInfo: IFAnalysisSourceDetailInfo | null;
};

type MessagePropsType = {
	onSearchAnyway: () => void;
};

// 和multi里的重复了，后面优化
class CustomMessage extends STComponent<MessagePropsType> {
	static defaultProps = {
		onSearchAnyway: noop
	};
	onClickSearch = () => {
		this.props.onSearchAnyway();
	};
	render() {
		return (
			<div className={ModuleStyle['custom-message-container']}>
				<span>
					{intl
						.get('CUSTOM_MESSAGE_INFO')
						.d('未检测到人脸或人体，是否强制搜索？')}
				</span>
				<span
					className={ModuleStyle['custom-message-btn']}
					onClick={this.onClickSearch}
				>
					{intl.get('CUSTOM_MESSAGE_SEARCH').d('搜索')}
				</span>
			</div>
		);
	}
}

class SourcePreviewer extends STComponent<PropsType, StateType> {
	static defaultProps = {
		mode: ESourcePreviewerMode.StructuralMode,
		structuralInfoId: '',
		sourceId: '',
		sourceType: ESourceType.Unknown,

		visible: false,
		originalImageId: '',
		originalImageUrl: 'void',
		// title: '',
		onClose: noop,
		maxCount: 5,
		onOk: noop,
		goNext: noop,
		goPrev: noop,
		currentIndex: 0,
		disableLeftArrow: false,
		disableRightArrow: false,

		onQuickSearch: noop,
		indicator: '',

		autoDetect: true,
		defaultDetect: true,
		defaultShowStructuralLabel: true,

		originalImageInfo: undefined
	};

	previewRef: React.RefObject<Previewer>;
	videoPlayerRef: React.RefObject<VideoPlayer>;

	constructor(props: PropsType) {
		super(props);
		this.previewRef = React.createRef<Previewer>();
		this.videoPlayerRef = React.createRef<VideoPlayer>();
		this.state = {
			prevImageId: undefined,
			isCropperState: false,
			showStructuralLabel: this.props.defaultShowStructuralLabel,
			structuralItemList: [],

			isLoading: false,
			isLoadingLiveUrl: false,
			playing: false,
			timeStamp: 0,
			videoUrl: '',
			showVideo: false,
			isStream: false,

			analysisSourceInfo: null,

			totalDeltaX: 0,
			totalDeltaY: 0,

			sourcePoint: undefined,
			detectNoFace: false
		};
	}

	/**
	 * 初始化和重新渲染之前回调函数
	 * @NOTE: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
	 * @param {PropsType} props props
	 * @param {StateType} state state
	 * @returns {null | StateType} 返回Object来更新state, 返回null表明新的props不会引起state的更新
	 */
	static getDerivedStateFromProps(
		props: PropsType,
		state: StateType
	): Partial<StateType> | null {
		if (props.originalImageId && props.originalImageId !== state.prevImageId) {
			return {
				prevImageId: props.originalImageId,
				totalDeltaX: 0,
				totalDeltaY: 0
			};
		}

		return null;
	}

	static show(props: Partial<PropsType> = {}) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let realProps = {
			...props,
			visible: true
		};
		// @ts-ignore
		let element = <SourcePreviewer {...realProps} />;

		ReactDOM.render(element, container);

		return {
			destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			},

			update(
				newProps: Partial<PropsType> = {},
				ignoreUndefined: boolean = true
			) {
				let keys = Object.keys(newProps);

				let filterProps: Partial<PropsType> = {};
				for (let key of keys) {
					if (newProps[key] === undefined && ignoreUndefined) {
						// ignore
					} else {
						filterProps[key] = newProps[key];
					}
				}
				let config = {
					...realProps,
					...filterProps
				};
				// @ts-ignore
				ReactDOM.render(<SourcePreviewer {...config} />, container);
			}
		};
	}

	componentDidMount() {
		this.refreshVedioInfo();
		this.getCanmeraPoint();
	}

	componentDidUpdate(prevProps: PropsType, prevState: StateType) {
		if (
			this.props.sourceId !== prevProps.sourceId ||
			this.props.structuralInfoId !== prevProps.structuralInfoId ||
			this.props.sourceType !== prevProps.sourceType
		) {
			this.refreshVedioInfo();
			this.getCanmeraPoint();
		}
	}
	getCanmeraPoint = () => {
		const { allPointsArr, sourceId, sourceType } = this.props;
		if (allPointsArr && sourceType && sourceType === ESourceType.Camera) {
			let point = allPointsArr.find((m) => {
				if (m) {
					m.count = 0;
					return m.id === String(sourceId);
				} else {
					return false;
				}
			});
			this.setState({
				sourcePoint: point
			});
		}
	};
	refreshVedioInfo() {
		this.setState({
			isLoading: true
		});

		this.getVideoRelativedInfo()
			.then((info: VideoRelativeInfo) => {
				this.setState({
					isLoading: false,
					timeStamp: info.timestamp,
					videoUrl: info.videoUrl,
					isStream: this.props.sourceType === ESourceType.Camera,
					analysisSourceInfo: info.analysisSourceInfo
				});
			})
			.catch((error: Error) => {
				if (!IFRequest.isCancel(error)) {
					//
				}
				console.error(error);
				this.setState({
					isLoading: false,
					analysisSourceInfo: null,
					timeStamp: 0,
					videoUrl: '',
					isStream: false
				});
			});
	}

	/**
	 * 获取数据源信息
	 * @param {string} sourceId 数据源id
	 * @param {ESourceType} sourceType 数据源类型
	 * @returns {IFAnalysisSourceDetailInfo | null} 数据源信息
	 * @memberof SourcePreviewer
	 */
	async getAnalysisSourceInfo(sourceId: string, sourceType: ESourceType) {
		let result: IFAnalysisSourceDetailInfo | null = await CollectionAnalysisSourceRequest.getSingleAnalysisSourceInfo(
			sourceId,
			sourceType
		);

		return result;
	}

	/**
	 * 获取时间戳（从大图信息中获取）
	 * @param {string} structuralId 小图id
	 * @param {ETargetType} targetType 类型
	 * @returns {Promise<number>} timestamp
	 * @memberof SourcePreviewer
	 */
	async getTimeStamp(
		structuralId: string,
		targetType: ETargetType
	): Promise<number> {
		let info: IFOriginalImageInfo = await CollectionResourceRequest.getOriginalImage(
			structuralId,
			targetType
		);

		if (TypeValidate.isNumber(info.timeStamp)) {
			return Math.max(0, info.timeStamp);
		} else {
			return 0;
		}
	}

	/**
	 * 获取跟播放有关的信息
	 * @returns {Promise<VideoRelativeInfo>} 有关信息
	 * @memberof SourcePreviewer
	 */
	async getVideoRelativedInfo(): Promise<VideoRelativeInfo> {
		let timestamp = 0;
		let analysisSourceInfo: IFAnalysisSourceDetailInfo | null = null;
		let url: string = '';

		// 获取时间戳(非有效大图模式)
		if (this.props.mode !== ESourcePreviewerMode.OriginalMode) {
			try {
				timestamp = await this.getTimeStamp(
					this.props.structuralInfoId,
					this.props.strucutralInfo.targetType
				);
			} catch (error) {
				console.error(error);
				timestamp = 0;
			}
		} else {
			// 大图模式
			if (
				this.props.mode === ESourcePreviewerMode.OriginalMode &&
				this.props.originalImageInfo
			) {
				timestamp = this.props.originalImageInfo.timeStamp;
			}
		}

		// 获取数据源
		try {
			// 数据源
			analysisSourceInfo = await this.getAnalysisSourceInfo(
				this.props.sourceId,
				this.props.sourceType
			);
			url = (analysisSourceInfo && analysisSourceInfo['sourceUrl']) || '';
		} catch (error) {
			console.error(error);
			analysisSourceInfo = null;
			url = '';
		}

		if (this.props.sourceType === ESourceType.Camera) {
			try {
				url = await this.getLiveStream(this.props.sourceId, timestamp);
			} catch (error) {
				console.error(error);
				url = '';
			}
		}

		return {
			timestamp: timestamp,
			videoUrl: url,
			analysisSourceInfo: analysisSourceInfo
		};
	}

	/**
	 * 获得摄像头的视频流
	 * @param {string} cameraId 摄像头id
	 * @param {number} timestamp 时间戳(单位s)
	 * @returns {Promise<string>} 播放链接
	 * @memberof SourcePreviewer
	 */
	async getLiveStream(cameraId: string, timestamp: number): Promise<string> {
		let result: CameraRequestDataType = await CollectionCaptureRequests.getCapture10RangeLiveStream(
			cameraId,
			timestamp * 1000
		);

		return result['url'];
	}

	/**********事件 **********************/

	onImageMove = (deltaX: number, deltaY: number) => {
		this.setState((prevState: StateType) => {
			return {
				totalDeltaX: prevState.totalDeltaX + deltaX,
				totalDeltaY: prevState.totalDeltaY + deltaY
			};
		});
	};

	onClickCrop = () => {
		this.setState({
			isCropperState: true
		});

		eventEmiiter.emit(EventType.changeToQuickSearchTabIfNeeded);
	};

	onCanelCrop = () => {
		this.setState({
			isCropperState: false
		});
	};

	showPrev = () => {
		this.props.goPrev(this.props.currentIndex);
	};

	showNext = () => {
		this.props.goNext(this.props.currentIndex);
	};

	onChangeLabelState = () => {
		this.setState((prevState: StateType) => {
			return {
				showStructuralLabel: !prevState.showStructuralLabel
			};
		});
	};

	onDetectFinished = (list: Array<IFStructuralInfo>) => {
		this.setState({
			structuralItemList: list
		});
	};

	onClickQuickSelect = (item: IFStructuralInfo) => {
		saveStructuralInfoMemo([item]);
		this.props.onQuickSearch();
	};

	/**
	 * 获得结构化的小图信息
	 * @param {File} file 文件
	 * @returns {Promise<IFDetectedStructualInfo>} 检测结果
	 * @memberof SearchSelectDatasourceMainPanel
	 */
	async detectStructuralInfo(file: File): Promise<IFDetectedStructualInfo> {
		// 文件上传检测
		let detectResult: IFDetectedStructualInfo = await CollectionResourceRequest.uploadImageAndDetect(
			file
		);

		return detectResult;
	}

	/**
	 * 强制搜索
	 * @memberof MultiStructuralUploadPreviewer
	 * @param {string} imageUrl 图片地址
	 * @returns {void} 无
	 */
	onSearchAnyway = (imageUrl: string) => {
		message.destroy();

		let unvalidStructuralInfo: IFStructuralInfo = generateUnvalidStructuralInfo(
			imageUrl
		);
		saveStructuralInfoMemo([unvalidStructuralInfo]);
		this.props.onQuickSearch();
	};

	onClickSearch = () => {
		if (this.previewRef.current) {
			let result: HTMLCanvasElement | null = this.previewRef.current.getCroppedCanvas();
			if (result) {
				// SearchUploadImagePanel.saveMemo(result);
				// this.props.onQuickSearch();
				// 转换成图片
				result.toBlob((blob: File) => {
					// 上传图片检测
					this.detectStructuralInfo(blob)
						.then((detectResult: IFDetectedStructualInfo) => {
							if (result) {
								SearchUploadImagePanel.saveMemo(result);
								this.props.onQuickSearch();
								this.setState({
									detectNoFace: true
								});
							}
						})
						.catch((error: Error) => {
							console.error(error);
							this.setState({
								detectNoFace: true
							});
							message.warning(
								<CustomMessage
									onSearchAnyway={() => {
										// @ts-ignore
										this.onSearchAnyway(result.toDataURL('image/jpeg'));
									}}
								/>,
								5
							);
							this.setState({
								detectNoFace: false // 重置状态。若不设置这个，第二次点完成后，就一直处于检测中
							});
						});
				}, 'jpg');
			}
		}
	};

	onPlayVideo = () => {
		// NOTE: 实时视频的链接点击才请求
		if (this.props.sourceType === ESourceType.Camera) {
			// 请求
			this.setState({
				isLoadingLiveUrl: true
			});
			this.getLiveStream(this.props.sourceId, this.state.timeStamp)
				.then((url: string) => {
					this.setState({
						videoUrl: url,
						isLoadingLiveUrl: false,
						playing: true // 播放
					});
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(intl.get('00000000000').d('加载视频失败'));
					this.setState({
						isLoadingLiveUrl: false
					});
				});
		} else {
			if (this.canPlay()) {
				if (this.state.isStream) {
					this.setState({
						playing: true
					});
				} else {
					this.setState({
						playing: true,
						showVideo: true
					});
				}
			}
		}

		// if (this.videoPlayerRef.current) {
		// 	let player: Player | undefined = this.videoPlayerRef.current.getPlayer();
		// 	if (player) {
		// 		player.currentTime(Math.max(0, this.state.timeStamp - 10));
		// 		player.play();
		// 	}
		// }
	};

	// 播放进度的回调（离线视频）
	onTimeUpdate = (player: Player) => {
		// 做限制
		let end = Math.min(this.state.timeStamp + 10, player.duration());
		if (player.currentTime() >= end) {
			player.pause();
			this.setState({
				playing: false,
				showVideo: false
			});
		}
	};

	// 播放逻辑（离线视频）
	onPlay = () => {
		if (this.videoPlayerRef.current) {
			let player: Player | undefined = this.videoPlayerRef.current.getPlayer();
			if (player) {
				player.currentTime(Math.max(0, this.state.timeStamp - 10));
				// player.play();
				setTimeout(() => {
					this.setState({
						showVideo: false
					});
				}, 100);
			}
		}
	};

	onExitPlaying = () => {
		this.setState({
			playing: false,
			showVideo: false
		});
	};

	canPlay(): boolean {
		return (
			(this.props.sourceType === ESourceType.Camera ||
				this.props.sourceType === ESourceType.Video) &&
			!!this.state.videoUrl &&
			(this.state.timeStamp >= 0 && !this.state.isLoading)
		);
	}

	isStrucutralInfoMode() {
		return this.props.mode === ESourcePreviewerMode.StructuralMode;
	}

	renderPosLabel() {
		// 找到structural info(因为检索和采集返回的格式有些不统一，所以我们统一使用检测之后的结构化数据)
		let theWholdStrucuturalInfo = [this.props.strucutralInfo];
		if (this.isStrucutralInfoMode()) {
			for (let item of this.state.structuralItemList) {
				if (item.id === this.props.strucutralInfo.id) {
					theWholdStrucuturalInfo = [item];
					break;
				}
			}
		} else {
			theWholdStrucuturalInfo = [...this.state.structuralItemList];
		}

		// 渲染
		return theWholdStrucuturalInfo.map((item: IFStructuralInfo) => {
			return (
				<StructuralImageLabel
					structuralInfo={item}
					// style={style}
					key={item.guid + item.id}
				/>
			);
		});
	}

	render() {
		let IconTag: React.ComponentClass | null = null;

		if (this.props.sourceType === ESourceType.Camera) {
			IconTag = CameraBlueIconComponent;
		} else if (this.props.sourceType === ESourceType.Zip) {
			IconTag = ZipRedIconComponent;
		} else if (this.props.sourceType === ESourceType.Video) {
			IconTag = VideoCameraGreenIconComponent;
		}

		// 找到structural info(因为检索和采集返回的格式有些不统一，所以我们统一使用检测之后的结构化数据)
		let theWholdStrucuturalInfo = this.props.strucutralInfo;
		if (this.isStrucutralInfoMode()) {
			for (let item of this.state.structuralItemList) {
				if (item.id === theWholdStrucuturalInfo.id) {
					theWholdStrucuturalInfo = item;
					break;
				}
			}
		}

		let title = (
			<div className={ModuleStyle['preview-title']}>
				{IconTag && <IconTag />}
				<div className={ModuleStyle['title']}>
					{(this.state.analysisSourceInfo &&
						this.state.analysisSourceInfo.sourceName) ||
						intl.get('SOURCE_PREVIEW_UNKNOWN_SOURCE_URL').d('未知数据源')}
				</div>
				<div>
					{this.isStrucutralInfoMode()
						? this.props.strucutralInfo.time
						: this.props.originalImageInfo && this.props.originalImageInfo.time}
				</div>
			</div>
		);

		return (
			<Provider store={store}>
				<Previewer
					className={ModuleStyle['source-previewer']}
					ref={this.previewRef}
					visible={this.props.visible}
					imageUrl={this.props.originalImageUrl}
					imageWidth={this.props.originalImageWidth}
					imageHeight={this.props.originalImageHeight}
					title={title}
					onClose={this.props.onClose}
					isCropperState={true}
					isAutoCrop={false || this.state.isCropperState}
					isCropShow={this.state.isCropperState}
					imageMode={ImageDisplayMode.AutoOrginOrAscpectFit}
					onImageMove={this.onImageMove}
					imageChildren={[
						this.state.showStructuralLabel && this.renderPosLabel(),
						this.state.playing && (
							<VideoPlayer
								key={'video-player'}
								isStream={this.state.isStream}
								ref={this.videoPlayerRef}
								onTimeUpdate={this.onTimeUpdate}
								onPlay={this.onPlay}
								className={ModuleStyle['video']}
								options={{
									controls: false,
									autoplay: true,
									language: Language.getLocale()
								}}
								url={`${this.state.videoUrl}`}
							/>
						),
						this.state.showVideo && (
							// 用来在mp4文件播放开始前的一个遮挡，防止闪跳
							<ImageView
								key={'image-view-video'}
								displayMode={ImageDisplayMode.AutoOrginOrAscpectFit}
								className={ModuleStyle['video']}
								imageUrl={this.props.originalImageUrl}
							/>
						)
					]}
					right={
						<StructuralListDetectedPanel
							originalImageId={this.props.originalImageId}
							originalImageUrl={this.props.originalImageUrl}
							autoDetect={true}
							isStructuralMode={this.isStrucutralInfoMode()}
							className={ModuleStyle['detected-panel']}
							// title={intl.get('MULTI_STRUCTAL_QUICK_TO_SEARCH').d('快速选择')}
							onDetectFinished={this.onDetectFinished}
							onSelect={this.onClickQuickSelect}
							guid={this.props.guid}
							sourcePoint={this.state.sourcePoint}
							sourceTime={
								this.isStrucutralInfoMode()
									? this.props.strucutralInfo.time
									: this.props.originalImageInfo
									? this.props.originalImageInfo.time
									: moment().format(DateFormat)
							}
							sourceName={
								this.state.analysisSourceInfo
									? this.state.analysisSourceInfo.sourceName
									: ''
							}
							taskType={
								this.isStrucutralInfoMode()
									? this.props.strucutralInfo.taskType
									: ETaskType.CaptureTask
							}
							onClose={this.props.onClose}
							isStructuralInfo={this.isStrucutralInfoMode()}
						/>
					}
					center={[
						// this.state.isCropperState && (
						// 	<CropStateControlBar
						// 		key="center-controller-bar"
						// 		className={ModuleStyle['crop-controll-bar']}
						// 		onClickClose={this.onCanelCrop}
						// 		onClickSearch={this.onClickSearch}
						// 	/>
						// ),
						this.props.indicator && (
							<div className={ModuleStyle['indicator']} key="center-indicator">
								{this.props.indicator}
							</div>
						)
					]}
				>
					<div className={ModuleStyle['controller-bar']}>
						<ControlPanel
							targetType={
								this.isStrucutralInfoMode()
									? this.props.strucutralInfo.targetType
									: ETargetType.Unknown
							}
							isPlayingState={this.state.playing}
							imageUrl={this.props.originalImageUrl}
							onReturn={this.onExitPlaying}
							enablePlayIcon={this.canPlay()}
							selectCropIcon={this.state.isCropperState}
							selectPosIcon={this.state.showStructuralLabel}
							onClickCrop={this.onClickCrop}
							onClickPos={this.onChangeLabelState}
							onClickPlay={this.onPlayVideo}
							onClickClose={this.onCanelCrop}
							onClickSearch={this.onClickSearch}
							detectNoFace={this.state.detectNoFace} // 控制loading，无人脸则终止loading
						/>
					</div>
					{!this.state.playing && (
						// <LeftArrowIcon
						// 	onClick={this.showPrev}
						// 	className={`${ModuleStyle['arrow-item']} ${
						// 		this.props.disableLeftArrow ? ModuleStyle['disable'] : ''
						// 	} ${ModuleStyle['left-arrow']}`}
						// />
						<i
							onClick={this.showPrev}
							className={`${ModuleStyle['arrow-item']} ${
								this.props.disableLeftArrow ? ModuleStyle['disable'] : ''
							} ${ModuleStyle['left-arrow']}`}
						/>
					)}
					{!this.state.playing && (
						// <RightArrowIcon
						// 	onClick={this.showNext}
						// 	className={`${ModuleStyle['arrow-item']} ${
						// 		this.props.disableRightArrow ? ModuleStyle['disable'] : ''
						// 	} ${ModuleStyle['right-arrow']}`}
						// />
						<i
							onClick={this.showNext}
							className={`${ModuleStyle['arrow-item']} ${
								this.props.disableRightArrow ? ModuleStyle['disable'] : ''
							} ${ModuleStyle['right-arrow']}`}
						/>
					)}
				</Previewer>
			</Provider>
		);
	}
}

export default SourcePreviewer;
