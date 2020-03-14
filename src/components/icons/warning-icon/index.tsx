import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as WarningSvg } from './warning.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
	onClick: () => void;
};

function noop() {}
class WarningIconComponent extends STComponent<IconPropType> {
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
				className={`${ModuleStyle['warning-icon']} ${this.props.className}`}
				component={WarningSvg}
			/>
		);
	}
}

export default WarningIconComponent;
