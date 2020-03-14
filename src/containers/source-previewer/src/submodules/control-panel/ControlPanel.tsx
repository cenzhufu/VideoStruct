import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import ModuleStyle from './index.module.scss';
import { Button, Tooltip } from 'antd';
import * as intl from 'react-intl-universal';
// import PlayIcon from '../play-icon';
// import CropIcon from '../crop-icon';
// import PosIcon from '../pos-icon';
import returnIcon from './return.png';
import { ETargetType } from 'stsrc/type-define';

type PropsType = {
	targetType: ETargetType;
	selectPlayIcon: boolean;
	selectCropIcon: boolean;
	selectPosIcon: boolean;
	imageUrl: string;

	enablePlayIcon: boolean;
	isPlayingState: boolean;

	onClickPlay: () => void;
	onClickCrop: () => void;
	onClickPos: () => void;
	onReturn: () => void;
	onClickClose: () => void;
	onClickSearch: () => void;
	detectNoFace: boolean;
};

type StateType = {
	loading: boolean;
};

function noop() {}

class ControlPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		targetType: ETargetType.Unknown,
		selectPlayIcon: false,
		selectCropIcon: false,
		selectPosIcon: false,

		isPlayingState: false,
		enablePlayIcon: false,

		onClickPlay: noop,
		onClickCrop: noop,
		onClickPos: noop,
		onReturn: noop,
		onClickClose: noop,
		onClickSearch: noop,
		detectNoFace: false
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			loading: false
		};
	}

	componentDidUpdate(prevProps: PropsType) {
		if (
			prevProps.detectNoFace !== this.props.detectNoFace &&
			this.props.detectNoFace
		) {
			this.setState({
				loading: false
			});
		}
	}

	onClickPlay = () => {
		this.props.onClickPlay();
	};

	onClickCrop = () => {
		this.props.onClickCrop();
	};

	onClickPos = () => {
		this.props.onClickPos();
	};

	onReturn = () => {
		this.props.onReturn();
	};

	toggleCropperState = () => {
		this.setState({ loading: false });
		this.props.onClickClose();
	};

	onCropperContent = () => {
		this.setState({ loading: true });
		this.props.onClickSearch();
	};

	getCropperTip() {
		switch (this.props.targetType) {
			case ETargetType.Face:
				return this.props.selectPosIcon
					? intl.get('CONTROL_PANEL_HIDDEN_fACE_FRAME').d('隐藏人脸框')
					: intl.get('CONTROL_PANEL_DISPLAY_FACE_FRAME').d('显示人脸框');

			case ETargetType.Body:
				return this.props.selectPosIcon
					? intl.get('CONTROL_PANEL_HIDDEN_BODY_FRAME').d('隐藏人脸框')
					: intl.get('CONTROL_PANEL_DISPLAY_BODY_FRAME').d('显示人体框');

			case ETargetType.Vehicle:
				return this.props.selectPosIcon
					? intl.get('CONTROL_PANEL_HIDDEN_VEHICLE_FRAME').d('隐藏车辆框')
					: intl.get('CONTROL_PANEL_DISPLAY_VEHICLE_FRAME').d('显示车辆框');

			default:
				return '';
		}
	}
	// 保存
	saveImage = () => {
		const { imageUrl } = this.props;
		getUrlToBlob(imageUrl, function(blob: string) {
			let aLink = document.createElement('a');
			let evt = document.createEvent('HTMLEvents');
			evt.initEvent('click', true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
			aLink.download = new Date().getTime();
			aLink.href = URL.createObjectURL(blob);
			aLink.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					view: window
				})
			);
		});
	};

	render() {
		const { loading } = this.state;
		const faceFramePromptText = this.getCropperTip();
		return (
			<div className={ModuleStyle['control-panel']}>
				{/* {!this.props.isPlayingState && (
					<PlayIcon
						onClick={this.onClickPlay}
						className={`${ModuleStyle['item']} ${
							!this.props.enablePlayIcon ? ModuleStyle['disabled'] : ''
						}`}
					/>
				)} */}
				{!this.props.isPlayingState && (
					<Tooltip
						placement="bottom"
						title={
							<span>
								{intl.get('CONTROL_PANEL_PLAY_VIDEO').d('播放关联视频')}
							</span>
						}
					>
						<i
							className={`${ModuleStyle['item-icon']} ${
								!this.props.enablePlayIcon
									? ModuleStyle['play-disabled']
									: ModuleStyle['play-default']
							}`}
							onClick={this.onClickPlay}
						/>
					</Tooltip>
				)}
				{/* {!this.props.isPlayingState && (
					<CropIcon
						onClick={this.onClickCrop}
						className={`${ModuleStyle['item']} ${
							this.props.selectCropIcon ? ModuleStyle['selected'] : ''
						}`}
					/>
				)} */}
				{!this.props.isPlayingState && (
					<Tooltip
						placement="bottom"
						title={<span>{intl.get('CONTROL_PANEL_CROP').d('裁剪')}</span>}
					>
						<i
							className={`${ModuleStyle['item-icon']} ${
								this.props.selectCropIcon
									? ModuleStyle['crop-active']
									: ModuleStyle['crop-default']
							}`}
							onClick={
								this.props.selectCropIcon
									? this.props.onClickClose
									: this.props.onClickCrop
							}
						/>
					</Tooltip>
				)}
				{/* {!this.props.isPlayingState && (
					<PosIcon
						onClick={this.onClickPos}
						className={`${ModuleStyle['item']} ${
							this.props.selectPosIcon ? ModuleStyle['selected'] : ''
						}`}
					/>
				)} */}
				{!this.props.isPlayingState && (
					<Tooltip placement="bottom" title={faceFramePromptText}>
						<i
							className={`${ModuleStyle['item-icon']} ${
								this.props.selectPosIcon
									? ModuleStyle['pos-active']
									: ModuleStyle['pos-default']
							}`}
							onClick={this.onClickPos}
						/>
					</Tooltip>
				)}
				{!this.props.isPlayingState && (
					<Button onClick={this.saveImage} className={ModuleStyle.saveStyle}>
						保存
					</Button>
				)}
				{this.props.isPlayingState && (
					<div
						className={`${ModuleStyle['return-icon-container']} ${
							ModuleStyle['item']
						}`}
						onClick={this.onReturn}
					>
						<img
							src={returnIcon}
							className={ModuleStyle['return-icon']}
							alt="return"
						/>
					</div>
				)}
				{this.props.selectCropIcon && (
					<div className={ModuleStyle['crooper-buttons']}>
						<Button
							className={ModuleStyle['cancel-cropper-button']}
							// onClick={this.toggleCropperState}
							onClick={this.toggleCropperState}
						>
							取消
						</Button>
						<Button
							className={ModuleStyle['cropper-button']}
							type="primary"
							loading={loading}
							onClick={this.onCropperContent}
						>
							{loading ? '检测中' : '完成'}
						</Button>
					</div>
				)}
			</div>
		);
	}
}

export default ControlPanel;

function getUrlToBlob(url: string, callback: (res: string) => void) {
	let canvas = document.createElement('canvas'); //创建canvas DOM元素
	let ctx = canvas.getContext('2d');
	let img = new Image();
	img.crossOrigin = 'Anonymous';
	img.src = url;
	img.onload = function() {
		canvas.height = img.height; //指定画板的高度,自定义
		canvas.width = img.width; //指定画板的宽度，自定义

		ctx.drawImage(img, 0, 0, img.width, img.height); //参数可自定义
		// console.log('zml img', canvas, img.width, img.height, img);
		// 下载容易被浏览器组织
		canvas.toBlob((blob) => {
			callback.call(this, blob); //回掉函数获取Base64编码
		});
		canvas = null;
	};
}
