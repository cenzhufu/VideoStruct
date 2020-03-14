import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './empty.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';
type IconPropType = {
	className: string;
};

class EmptyIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['empty-icon']} ${this.props.className}`}
				component={CameraSvg}
			/>
		);
	}
}

export default EmptyIconComponent;
