import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as ArrowSVG } from './arrow.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
	onClick: () => void;
};

function noop() {}
class ArrowIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: '',
		onClick: noop
	};

	onClick = () => {
		this.props.onClick();
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['arrow-icon']} ${this.props.className}`}
				component={ArrowSVG}
			/>
		);
	}
}

export default ArrowIconComponent;
