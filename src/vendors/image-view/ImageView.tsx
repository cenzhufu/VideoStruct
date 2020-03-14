import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.less';

import Cropper from 'cropperjs';
// NOTE: storybook非要这么些，少了还不行
require('cropperjs/dist/cropper.css');
// import ReactResizeDetector from 'react-resize-detector';

/** 图片显示的模式 */
export enum ImageDisplayMode {
	Original = 'original', // 原始大小

	ScaleToFill = 'ScaleToFill',
	ScaleAspectFit = 'ScaleAspectFit',
	ScaleAspectFill = 'ScaleAspectFill',

	AutoOrginOrAscpectFill = 'AutoOrginOrAscpectFill', // 自动在在小图(origin),大图(AscpectFill)切换
	AutoOrginOrAscpectFit = 'AutoOrginOrAscpectFit' // 自动在在小图(origin),大图(AscpectFit)切换
}

/** 图片item的配置 */
export interface ImageItemConfigType {
	srcset: string; // 图片资源路径
	media: string; // 媒体查询
	type: string; // 图片类型
}

// 图片加载状态
enum LoadStatus {
	unknown = 'unknown',
	loading = 'loading', // 加载中
	failed = 'failed', // 失败
	finished = 'finished' // 成功
}

// 调整的模式
enum AdjustMode {
	Width = 'width',
	Height = 'height'
}

/** props type */
export interface ImageViewPropsType {
	className: string;
	style: React.CSSProperties;
	displayMode: ImageDisplayMode; // 显示模式
	images: Array<ImageItemConfigType>; // 执行picture标签时使用的数据，暂没有用到
	placeholder: React.ReactNode; // 加载状态下的占位图

	imageUrl: string; // 默认图片
	children: React.ReactNode;

	onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
	onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
	onClick: (event: React.SyntheticEvent<HTMLDivElement>) => void;

	// cropper
	isCropperState: boolean;
	isAutoCrop: boolean;
	isCropShow: boolean; // 裁剪框是否显示

	// 图片的尺寸
	imageHeight?: number;
	imageWidth?: number;
}

/** state type */
type ImageViewStateType = {
	lastImageSrc: string;
	imageWidth: number; // 图片真实宽度
	imageHeight: number; // 图片真实高度

	status: LoadStatus;
	inited: boolean;

	// cropper
	prevCropperState: boolean;
	lastDisplayMode: ImageDisplayMode;

	containerWidth: number;
	containerHeight: number;

	needCalcImageDimension: boolean;
};

function noop() {}
class ImageView extends React.Component<
	ImageViewPropsType,
	ImageViewStateType
> {
	static defaultProps = {
		className: '',
		style: {},
		displayMode: ImageDisplayMode.Original,
		images: [],
		children: [],
		placeholder: null,
		onMouseEnter: noop,
		onMouseLeave: noop,
		onClick: noop,

		isCropperState: false,
		isAutoCrop: true,
		isCropShow: true
	};
	imageRef: React.RefObject<HTMLImageElement>;
	imageContainerRef: React.RefObject<HTMLDivElement>;
	cropper: Cropper | null;

	_isMounted: boolean;
	constructor(props: ImageViewPropsType) {
		super(props);

		this.imageRef = React.createRef<HTMLImageElement>();
		this.imageContainerRef = React.createRef<HTMLDivElement>();

		this._isMounted = true;
		this.state = {
			lastDisplayMode: this.props.displayMode,
			imageWidth: props.imageWidth ? props.imageWidth : 1,
			imageHeight: props.imageHeight ? props.imageHeight : 1,
			lastImageSrc: '',
			status: LoadStatus.loading,
			inited: false,

			prevCropperState: false,

			containerWidth: 1,
			containerHeight: 1,

			needCalcImageDimension:
				// eslint-disable-next-line
				props.imageHeight != undefined && props.imageWidth != undefined
					? false
					: true
		};
	}

	static getDerivedStateFromProps(
		props: ImageViewPropsType,
		state: ImageViewStateType
	): Partial<ImageViewStateType> | null {
		let changeState: null | Partial<ImageViewStateType> = null;
		if (props.displayMode !== state.lastDisplayMode) {
			changeState = {
				lastDisplayMode: props.displayMode
			};
		}

		if (props.imageUrl !== state.lastImageSrc) {
			changeState = {
				...(changeState || {}),
				lastImageSrc: props.imageUrl
			};

			// 记录
			changeState = {
				...(changeState || {}),
				imageWidth: props.imageWidth ? props.imageWidth : 1,
				imageHeight: props.imageHeight ? props.imageHeight : 1
			};
		}

		if (props.isCropperState !== state.prevCropperState) {
			changeState = {
				...(changeState || {}),
				prevCropperState: props.isCropperState
			};
		}

		// eslint-disable-next-line
		if (props.imageHeight != undefined && props.imageWidth != undefined) {
			changeState = {
				...(changeState || {}),
				needCalcImageDimension: false
			};
		} else {
			changeState = {
				...(changeState || {}),
				needCalcImageDimension: true
			};
		}

		return changeState;
	}

	cropMove = (event: CustomEvent) => {
		// let orignalEvent = event.detail.originalEvent as PointerEvent;
		// this.props.onMove(orignalEvent.movementX, orignalEvent.movementY);
		// 这儿起不了作用，因为裁剪框也可以移动，背景图也可以移动，都走这个回调，而我们区分不了
	};

	cropZoom = (event: CustomEvent) => {
		console.log(event);
	};

	initCropperIfneeded() {
		if (!this.cropper && this.props.isCropperState) {
			if (this.imageRef.current) {
				let image = this.imageRef.current;
				if (image) {
					// @ts-ignore
					this.cropper = new Cropper(image, {
						viewMode: 1,
						autoCropArea: 0.5,
						dragMode: 'move',
						autoCrop: this.props.isAutoCrop,
						cropmove: this.cropMove,
						zoom: this.cropZoom,
						minContainerWidth: 50,
						minContainerHeight: 50
					});
					// @ts-ignore
					// this.cropper.clear();
				}
			}
		}
	}

	public getImageElement(): HTMLImageElement | null {
		if (this.imageRef.current) {
			return this.imageRef.current;
		} else {
			return null;
		}
	}

	componentDidMount() {
		this._isMounted = true;
		this.getContainerDimension();
	}

	componentDidUpdate(
		prevProps: ImageViewPropsType,
		prevState: ImageViewStateType
	) {
		if (
			this.props.imageUrl &&
			(this.props.displayMode !== prevProps.displayMode ||
				this.props.imageUrl !== prevProps.imageUrl)
		) {
			// 设置为加载状态
			this.setState({
				status: LoadStatus.loading
			});
		}

		if (this.props.isCropperState) {
			this.initCropperIfneeded();

			if (this.props.isCropShow) {
				// @ts-ignore
				this.cropper.crop();
			} else {
				// @ts-ignore
				this.cropper.clear();
			}
		} else {
			if (this.cropper) {
				// 销毁
				this.cropper.destroy();
				this.cropper = null;
			}
		}

		// cropper

		// 图片地址变化
		if (this.props.imageUrl && this.props.imageUrl !== prevProps.imageUrl) {
			if (this.cropper) {
				// 删除后创建，不然replace之后的destory将恢复最开始的图片
				// this.cropper
				// 	.reset()
				// 	.clear()
				// 	.replace(this.props.imageUrl);
				this.cropper.destroy();
				this.cropper = null;
			}

			this.initCropperIfneeded();
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
		if (this.cropper) {
			// Destroy the cropper, this makes sure events such as resize are cleaned up and do not leak
			this.cropper.destroy();
		}
	}

	getContainerDimension = () => {
		if (this.imageContainerRef.current) {
			let node = this.imageContainerRef.current;
			window.requestAnimationFrame(() => {
				let containerWidth = node.clientWidth;
				let containerHeight = node.clientHeight;
				if (this._isMounted) {
					this.setState({
						containerHeight: containerHeight,
						containerWidth: containerWidth
					});
				}
			});
		}
	};

	onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
		let img = event.target as HTMLImageElement;

		let width: number = img.naturalWidth;
		let height: number = img.naturalHeight;

		if (this._isMounted) {
			if (this.state.needCalcImageDimension) {
				this.setState({
					imageWidth: width,
					imageHeight: height,
					status: LoadStatus.finished,
					inited: true
				});
			} else {
				this.setState({
					status: LoadStatus.finished,
					inited: true
				});
			}
		}
	};

	onError = () => {
		if (this._isMounted) {
			this.setState({
				status: LoadStatus.failed
			});
		}
	};

	onMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
		this.props.onMouseEnter(event);
	};

	onMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
		this.props.onMouseLeave(event);
	};

	onClick = (event: React.SyntheticEvent<HTMLDivElement>) => {
		this.props.onClick(event);
	};

	render() {
		let containerWidth = this.state.containerWidth;
		let containerHeight = this.state.containerHeight;

		// 计算style
		let { style, adjustMode } = this.calculateImageStyle(
			this.state.imageWidth,
			this.state.imageHeight,
			containerWidth,
			containerHeight,
			this.state.lastDisplayMode
		);

		let ImageElement: React.ReactNode = (
			// <ReactResizeDetector
			// 	handleWidth={true}
			// 	handleHeight={true}
			// 	skipOnMount={false}
			// 	refreshMode={'debounce'}
			// 	onResize={this.getContainerDimension}
			// >
			<div style={style} className={ModuleStyle['image-container']}>
				<img
					ref={this.imageRef}
					draggable={false}
					style={
						adjustMode === AdjustMode.Width
							? { width: '100%' }
							: { height: '100%' }
					}
					src={
						// 防止空字符串导致页面重新加载
						this.props.imageUrl ? this.props.imageUrl : 'about:blank'
					}
					onLoad={this.onLoad}
					onError={this.onError}
					alt="img"
				/>
				{this.props.children}
			</div>

			// </ReactResizeDetector>
		);

		return (
			<div
				ref={this.imageContainerRef}
				style={this.props.style}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				onClick={this.onClick}
				className={`${this.props.className} ${
					ModuleStyle['image-view--container']
				}`}
			>
				{this.state.status === LoadStatus.loading && (
					<div className={ModuleStyle['place-holder']}>
						{this.props.placeholder}
					</div>
				)}
				{ImageElement}
			</div>
		);
	}

	/**
	 * 计算图片的样式
	 * @param {number} imageWidth  图片真实宽度
	 * @param {number} imageHeight 图片真实高度
	 * @param {number} containerWidth 容器的宽度
	 * @param {number} containerHeight 容器的高度
	 * @param {ImageDisplayMode} mode 图片的显示模式
	 * @returns {Object} 样式
	 * @memberof ImageView
	 */
	calculateImageStyle(
		imageWidth: number,
		imageHeight: number,
		containerWidth: number,
		containerHeight: number,
		mode: ImageDisplayMode
	): {
		style: Object;
		mode: ImageDisplayMode;
		adjustMode: AdjustMode;
	} {
		switch (mode) {
			case ImageDisplayMode.ScaleAspectFill: {
				let { style, adjustMode } = this.calculateImageStyleInAspectFill(
					imageWidth,
					imageHeight,
					containerWidth,
					containerHeight
				);
				return {
					style: style,
					adjustMode: adjustMode,
					mode: ImageDisplayMode.ScaleAspectFill
				};
			}

			case ImageDisplayMode.ScaleAspectFit: {
				let { style, adjustMode } = this.calculateImageStyleInAspectFit(
					imageWidth,
					imageHeight,
					containerWidth,
					containerHeight
				);
				return {
					style: style,
					adjustMode: adjustMode,
					mode: ImageDisplayMode.ScaleAspectFit
				};
			}

			case ImageDisplayMode.ScaleToFill: {
				return {
					style: { width: '100%', height: '100%' },
					adjustMode: AdjustMode.Width,
					mode: ImageDisplayMode.ScaleAspectFill
				};
			}

			case ImageDisplayMode.AutoOrginOrAscpectFill: {
				// 判断尺寸
				if (imageHeight <= containerHeight && imageWidth <= containerWidth) {
					// 原始尺寸
					return {
						style: {},
						adjustMode: AdjustMode.Width,
						mode: ImageDisplayMode.Original
					};
				} else {
					// 缩放
					let { style, adjustMode } = this.calculateImageStyleInAspectFill(
						imageWidth,
						imageHeight,
						containerWidth,
						containerHeight
					);
					return {
						style: style,
						adjustMode: adjustMode,
						mode: ImageDisplayMode.AutoOrginOrAscpectFill
					};
				}
			}

			case ImageDisplayMode.AutoOrginOrAscpectFit: {
				// 判断尺寸
				if (imageHeight <= containerHeight && imageWidth <= containerWidth) {
					// 原始尺寸
					return {
						style: {},
						adjustMode: AdjustMode.Width,
						mode: ImageDisplayMode.Original
					};
				} else {
					// 缩放
					let { style, adjustMode } = this.calculateImageStyleInAspectFit(
						imageWidth,
						imageHeight,
						containerWidth,
						containerHeight
					);
					return {
						style: style,
						adjustMode: adjustMode,
						mode: ImageDisplayMode.AutoOrginOrAscpectFit
					};
				}
			}

			case ImageDisplayMode.Original:
			default:
				return {
					style: {},
					adjustMode: AdjustMode.Width,
					mode: ImageDisplayMode.Original
				};
		}
	}

	/**
	 * 计算图片样式（aspect fill 模式下）
	 * @param {number} imageWidth 图片真实宽度
	 * @param {number} imageHeight 图片真实高度
	 * @param {number} containerWidth 容器宽度
	 * @param {number} containerHeight 容器高度
	 * @returns {{style: Object, adjustMode: AdjustMode}} 样式
	 * @memberof ImageView
	 */
	calculateImageStyleInAspectFill(
		imageWidth: number,
		imageHeight: number,
		containerWidth: number,
		containerHeight: number
	): { style: Object; adjustMode: AdjustMode } {
		// 保证短边全部显示
		let widthRatio = containerWidth / imageWidth;
		let heightRatio = containerHeight / imageHeight;
		if (widthRatio >= heightRatio) {
			// 说明imageWidth偏小
			return {
				style: {
					width: '100%'
				},
				adjustMode: AdjustMode.Width
			};
		} else {
			return {
				style: {
					height: '100%'
				},
				adjustMode: AdjustMode.Height
			};
		}
	}

	/**
	 * 计算图片样式（aspect fit 模式下）
	 * @param {number} imageWidth 图片真实宽度
	 * @param {number} imageHeight 图片真实高度
	 * @param {number} containerWidth 容器宽度
	 * @param {number} containerHeight 容器高度
	 * @returns {{ style: Object, adjustMode: AdjustMode }} 样式
	 * @memberof ImageView
	 */
	calculateImageStyleInAspectFit(
		imageWidth: number,
		imageHeight: number,
		containerWidth: number,
		containerHeight: number
	): { style: Object; adjustMode: AdjustMode } {
		// 保证长边全部显示
		let widthRatio = containerWidth / imageWidth;
		let heightRatio = containerHeight / imageHeight;
		if (widthRatio >= heightRatio) {
			// 宽度短了
			return {
				style: {
					width: Math.min(100, (heightRatio / widthRatio) * 100) + '%'
				},
				adjustMode: AdjustMode.Width
			};
		} else {
			// 高度短了
			return {
				style: {
					width: '100%'
				},
				adjustMode: AdjustMode.Width
			};
		}
	}

	/**********************cropper functions **********************/

	setDragMode(mode: Cropper.DragMode) {
		if (this.cropper) {
			this.cropper.setDragMode(mode);
		}
	}

	setAspectRatio(aspectRatio: number) {
		if (this.cropper) {
			this.cropper.setAspectRatio(aspectRatio);
		}
	}

	getCroppedCanvas(
		options?: Cropper.GetCroppedCanvasOptions
	): HTMLCanvasElement | null {
		if (this.cropper) {
			return this.cropper.getCroppedCanvas(options);
		}

		return null;
	}

	setCropBoxData(data: Partial<Cropper.CropBoxData>) {
		if (this.cropper) {
			this.cropper.setCropBoxData(data);
		}
	}

	getCropBoxData() {
		if (this.cropper) {
			return this.cropper.getCropBoxData();
		}
		return undefined;
	}

	setCanvasData(data: Partial<Cropper.CanvasData>) {
		if (this.cropper) {
			this.cropper.setCanvasData(data);
		}
	}

	getCanvasData() {
		if (this.cropper) {
			return this.cropper.getCanvasData();
		}
		return undefined;
	}

	getImageData() {
		if (this.cropper) {
			return this.cropper.getImageData();
		}
		return undefined;
	}

	getContainerData() {
		if (this.cropper) {
			return this.cropper.getContainerData();
		}
		return undefined;
	}

	setData(data: Partial<Cropper.Data>) {
		if (this.cropper) {
			this.cropper.setData(data);
		}
	}

	getData(rounded?: boolean) {
		if (this.cropper) {
			return this.cropper.getData(rounded);
		}
		return undefined;
	}

	crop() {
		if (this.cropper) {
			return this.cropper.crop();
		}
		return undefined;
	}

	move(offsetX: number, offsetY?: number) {
		if (this.cropper) {
			this.cropper.move(offsetX, offsetY);
		}
	}

	moveTo(x: number, y?: number) {
		if (this.cropper) {
			this.cropper.moveTo(x, y);
		}
	}

	zoom(ratio: number) {
		if (this.cropper) {
			this.cropper.zoom(ratio);
		}
	}

	zoomTo(ratio: number) {
		if (this.cropper) {
			this.cropper.zoomTo(ratio);
		}
	}

	rotate(degree: number) {
		if (this.cropper) {
			this.cropper.rotate(degree);
		}
	}

	rotateTo(degree: number) {
		if (this.cropper) {
			this.cropper.rotateTo(degree);
		}
	}

	enable() {
		if (this.cropper) {
			this.cropper.enable();
		}
	}

	disable() {
		if (this.cropper) {
			this.cropper.disable();
		}
	}

	reset() {
		if (this.cropper) {
			this.cropper.reset();
		}
	}

	clear() {
		if (this.cropper) {
			this.cropper.clear();
		}
	}

	replace(url: string, onlyColorChanged: boolean) {
		if (this.cropper) {
			this.cropper.replace(url);
		}
	}

	scale(scaleX: number, scaleY: number) {
		if (this.cropper) {
			this.cropper.scale(scaleX, scaleY);
		}
	}

	scaleX(scaleX: number) {
		if (this.cropper) {
			this.cropper.scaleX(scaleX);
		}
	}

	scaleY(scaleY: number) {
		if (this.cropper) {
			this.cropper.scaleY(scaleY);
		}
	}
}

export default ImageView;
