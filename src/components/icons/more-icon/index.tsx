import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './more.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
	onClick: () => void;
};

function noop() {}
class MoreIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: '',
		onClick: noop
	};

	onClick = () => {
		this.props.onClick();
	};

	render() {
		return (
			<div onClick={this.onClick}>
				<Icon
					className={`${ModuleStyle['more-icon']} ${this.props.className}`}
					component={CameraSvg}
				/>
			</div>
		);
	}
}

export default MoreIconComponent;
