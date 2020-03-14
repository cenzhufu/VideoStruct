import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './video-camera.svg';
import { ReactComponent as VideoCameraSvg } from './video-camera-green.svg';
import { ReactComponent as SpecialVideoCameraSvg } from './video-three.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
};

class VideoCameraIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['video-camera-icon']} ${
					this.props.className
				}`}
				component={CameraSvg}
			/>
		);
	}
}

class VideoCameraGreenIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['video-camera-green-icon']} ${
					this.props.className
				}`}
				component={VideoCameraSvg}
			/>
		);
	}
}

class VideoCameraSpecialGreenIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['video-camera-green-icon-special']} ${
					this.props.className
				}`}
				component={SpecialVideoCameraSvg}
			/>
		);
	}
}

export {
	VideoCameraIconComponent,
	VideoCameraGreenIconComponent,
	VideoCameraSpecialGreenIconComponent
};
