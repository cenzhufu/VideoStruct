import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Icon } from 'antd';
import ModuleStyle from './assets/styles/index.module.scss';
import LazyloadPlaceHolder from 'ifvendors/lazyload-placeholder';
// import LazyLoadImageView from 'ifvendors/lazyload-imageview';
import ImageView, { ImageDisplayMode } from 'ifvendors/image-view';
import { DraggableData } from 'react-draggable'; // The default
import * as intl from 'react-intl-universal';

type PreviewerPropsType = {
	// 必填
	imageUrl: string;
	imageMode: ImageDisplayMode;

	// 选填
	visible?: boolean;
	title?: string | React.ReactNode;
	footer?: string | React.ReactNode;
	className?: string;
	style?: Object;
	onClose: () => void;
	imageChildren?: React.ReactNode;
	children?: React.ReactNode;

	isCropperState: boolean;
	isAutoCrop: boolean;
	isCropShow: boolean;

	upper?: React.ReactNode;
	right?: React.ReactNode;
	center?: React.ReactNode;

	imageWidth?: number;
	imageHeight?: number;

	onImageMove: (deltaX: number, deltaY: number) => void;
};

type StateType = {
	// height: number;

	// 用来记录拖动的左上角坐标
	offsetX: number;
	offsetY: number;

	scale: number;
};

function noop() {}

class Previewer extends React.Component<PreviewerPropsType, StateType> {
	static defaultProps = {
		className: '',
		style: {},
		visible: false,
		title: null,
		footer: null,
		onClose: noop,
		isCropperState: false,
		isAutoCrop: true,
		isCropShow: true,
		upper: null,
		right: null,
		center: null,
		imageMode: ImageDisplayMode.Original,

		onImageMove: noop
	};

	imageViewRef: React.RefObject<ImageView>;
	centerDomRef: React.RefObject<HTMLDivElement>;

	constructor(props: PreviewerPropsType) {
		super(props);
		this.imageViewRef = React.createRef<ImageView>();
		this.centerDomRef = React.createRef<HTMLDivElement>();

		this.state = {
			// height: 0,
			scale: 1,
			offsetX: 0,
			offsetY: 0
		};
	}

	static showPreviewer(props: Partial<PreviewerPropsType>) {
		// div
		let container = document.createElement('div');
		document.body.appendChild(container);
		// @ts-ignore TODO: 待确认
		let element = <Previewer {...props} />;

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
		this.props.onClose();
	};

	getElementPosition(e: HTMLElement | null) {
		let x = 0;
		let y = 0;
		let ecopy = e;
		while (ecopy != null) {
			x += ecopy.offsetLeft;
			y += ecopy.offsetTop;
			// @ts-ignore
			ecopy = ecopy.offsetParent;
		}
		return {
			x: x,
			y: y
		};
	}

	mousePosition(x: number, y: number, event: React.WheelEvent<HTMLElement>) {
		let element = event.currentTarget;
		let rect = element.getBoundingClientRect();
		let style = getComputedStyle(element);
		return {
			x:
				(x -
					rect.left -
					parseFloat(style.paddingLeft || '0') -
					this.state.offsetX) /
				this.state.scale,
			y:
				(y -
					rect.top -
					parseFloat(style.paddingTop || '0') -
					this.state.offsetY) /
				this.state.scale
		};
	}

	onWheel = (event: React.WheelEvent<HTMLElement>) => {
		// console.log(
		// 	`event.pageX = ${event.pageX}`,
		// 	`event.pageY = ${event.pageY}`,
		// 	`reuslt x = ${result.x}, ${result.y}`,
		// 	`event x = ${event.pageX - result.x}`,
		// 	`event y = ${event.pageY - result.y}`,
		// 	`offsetX = ${event.nativeEvent.offsetX}`,
		// 	`offsetY = ${event.nativeEvent.offsetY}`,
		// 	// `pageX = ${event.pageX}`,
		// 	// `pageY = ${event.pageY}\n`,
		// 	// `screenX = ${event.screenX}`,
		// 	// `screenY = ${event.screenY}\n`,
		// 	// `offsetLeft = ${event.currentTarget.offsetLeft}`,
		// 	// `x = ${result.x}, y = ${result.y}\n`,
		// 	// `offsetTop = ${event.currentTarget.offsetTop}`,
		// 	// `offsetWidth = ${event.currentTarget.offsetWidth}`,
		// 	// `offsetHeight = ${event.currentTarget.offsetHeight}\n`,
		// 	// `clientWidth = ${event.currentTarget.clientWidth}`,
		// 	// `clientHeight = ${event.currentTarget.clientHeight}`,
		// 	// `clientTop = ${event.currentTarget.clientTop}`,
		// 	// `clientLeft = ${event.currentTarget.clientLeft}`,
		// 	// `clientX = ${event.clientX}`,
		// 	// `clientY = ${event.clientY}`,
		// 	event.deltaX,
		// 	event.deltaY,
		// 	event.deltaZ,
		// 	event.deltaMode
		// );

		event.preventDefault();

		let scaleFactor = 1.1;
		let pos = this.mousePosition(
			event.nativeEvent.clientX,
			event.nativeEvent.clientY,
			event
		);
		let zoom = 1;
		if (event.deltaY < 0) {
			zoom = scaleFactor;
		} else if (event.deltaY > 0) {
			zoom = 1 / scaleFactor;
		}

		this.setState((prevState: StateType) => {
			return {
				scale: prevState.scale * zoom,
				offsetX: prevState.offsetX - pos.x * prevState.scale * (zoom - 1),
				offsetY: prevState.offsetY - pos.y * prevState.scale * (zoom - 1)
			};
		});
		// this.zoom(delta * 0.1, event);
	};

	zoom(ratio: number, event: React.WheelEvent<HTMLElement>) {
		// let rr = ratio;
		// if (ratio < 0) {
		// 	rr = 1 / (1 - ratio);
		// } else {
		// 	rr = 1 + ratio;
		// }

		console.log('zoom ration', ratio);
		this.zoomTo(ratio, event);
	}

	zoomTo(ratio: number, event: React.WheelEvent<HTMLElement>) {
		// let result = this.getElementPosition(event.currentTarget);
		// let offsetX = event.nativeEvent.offsetX;
		// let offsetY = event.nativeEvent.offsetY;
		// this.setState((prevState: StateType) => {
		// 	return {
		// 		scale: prevState.scale * (1 + ratio),
		// 		left: -ratio * offsetX + result.x - 37,
		// 		top: -ratio * offsetY + result.y - 156
		// 	};
		// });
	}

	onDragStop = (e: React.MouseEvent<HTMLElement>, dragData: DraggableData) => {
		console.log(`drag deltaX = ${dragData.deltaX}`);
		console.log(`drag deltaY = ${dragData.deltaY}`);
		console.log(`drag lastX = ${dragData.lastX}`);
		console.log(`drag lastY = ${dragData.lastY}`);
		console.log(`drag x = ${dragData.x}`);
		console.log(`drag y = ${dragData.y}`);

		// this.setState({
		// 	left: dragData.x,
		// 	top: dragData.y
		// });
	};

	render() {
		let style = {
			// height: this.state.height + 'px'
		};
		return (
			<Modal
				className={`${ModuleStyle['previewer']} ${this.props.className}`}
				style={this.props.style}
				maskClosable={false}
				visible={this.props.visible}
				footer={null}
				closable={false}
				onCancel={this.handleClose}
			>
				<div className={ModuleStyle['previewer-all-panel']}>
					<div className={ModuleStyle['previewer-left-panel']} />
					<div
						className={ModuleStyle['previewer-center-panel']}
						ref={this.centerDomRef}
					>
						<div className={ModuleStyle['previewer-upper']}>
							{this.props.upper}
						</div>
						<div className={ModuleStyle['previewer-core']}>
							<div className={ModuleStyle['previewer-header']}>
								<Icon
									type="close"
									theme="outlined"
									className={ModuleStyle['close-icon']}
									onClick={this.handleClose}
								/>
								<span className={ModuleStyle['previewer-header-font']}>
									{intl.get('VIEW_IMAGE').d('查看图片')}
								</span>
							</div>
							<div className={ModuleStyle['previewer-body']}>
								{/* // 赋值key可以重新在不同的key时重新渲染 */}
								{/* <div
									style={{
										position: 'absolute',
										width: `${100}%`,
										height: `${100}%`,
										// transform: `scale(${this.state.scale})`,
										// left: `${this.state.left}px`,
										// top: `${this.state.top}px`
										transform: `translate(${this.state.offsetX}px, ${
											this.state.offsetY
										}px) scale(${this.state.scale})`
									}}
								> */}
								{/* <Draggable onStop={this.onDragStop}> */}
								<ImageView
									ref={this.imageViewRef}
									imageUrl={this.props.imageUrl}
									className={`${ModuleStyle['cropper']}`}
									displayMode={this.props.imageMode}
									isCropperState={this.props.isCropperState}
									isAutoCrop={this.props.isAutoCrop}
									isCropShow={this.props.isCropShow}
									imageWidth={this.props.imageWidth}
									imageHeight={this.props.imageHeight}
									placeholder={
										<LazyloadPlaceHolder
											className={`${ModuleStyle['cropper']}`}
										/>
									}
								>
									{this.props.imageChildren}
								</ImageView>
								{/* </Draggable> */}
								{/* </div> */}

								{this.props.center}
							</div>
							{this.props.children}
						</div>
					</div>
					<div className={ModuleStyle['previewer-right-panel']} style={style}>
						{this.props.right}
					</div>
				</div>
			</Modal>
		);
	}

	getCroppedCanvas(): HTMLCanvasElement | null {
		if (this.imageViewRef.current) {
			return this.imageViewRef.current.getCroppedCanvas();
		}

		return null;
	}

	getImageView(): ImageView | null {
		return this.imageViewRef.current;
	}
}

export default Previewer;
