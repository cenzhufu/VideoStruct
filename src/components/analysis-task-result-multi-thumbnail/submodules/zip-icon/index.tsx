import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as ZipSvg } from './zip.svg';
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
				component={ZipSvg}
			/>
		);
	}
}

export default ZipIconComponent;
