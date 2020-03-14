import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './camera-icon.svg';
import { ReactComponent as CameraBlueSvg } from './camera-blue.svg';
import { ReactComponent as CameraBlueSpecialSvg } from './camera-three.svg';
import ModuleStyle from './camera-icon.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
};

class CameraIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['camera-icon']} ${this.props.className}`}
				component={CameraSvg}
			/>
		);
	}
}

class CameraBlueIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['camera-blue-icon']} ${this.props.className}`}
				component={CameraBlueSvg}
			/>
		);
	}
}

class CameraBlueSpecialIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['camera-blue-special-icon']} ${
					this.props.className
				}`}
				component={CameraBlueSpecialSvg}
			/>
		);
	}
}

export {
	CameraIconComponent,
	CameraBlueIconComponent,
	CameraBlueSpecialIconComponent
};
