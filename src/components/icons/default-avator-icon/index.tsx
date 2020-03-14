import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as AvatorSvg } from './avator.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
};

class DefaultAvatorIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['default-avator-icon']} ${
					this.props.className
				}`}
				component={AvatorSvg}
			/>
		);
	}
}

export default DefaultAvatorIconComponent;
