import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './zip-icon.svg';
import { ReactComponent as ZipRedSvg } from './zip-red.svg';
import { ReactComponent as ZipRedThreeSvg } from './zip-three.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
};

class ZipIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['zip-icon']} ${this.props.className}`}
				component={CameraSvg}
			/>
		);
	}
}
class ZipRedIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['zip-red-icon']} ${this.props.className}`}
				component={ZipRedSvg}
			/>
		);
	}
}

class ZipRedIconSpecialComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['zip-red--special-icon']} ${
					this.props.className
				}`}
				component={ZipRedThreeSvg}
			/>
		);
	}
}

export { ZipIconComponent, ZipRedIconComponent, ZipRedIconSpecialComponent };
