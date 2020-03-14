import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './left-arrow-icon.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';
import { IconProps } from 'antd/lib/icon';

class LeftArrowIconComponent extends STComponent<IconProps> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				{...this.props}
				className={`${ModuleStyle['left-arrow-icon']} ${this.props.className}`}
				component={CameraSvg}
			/>
		);
	}
}

export default LeftArrowIconComponent;
