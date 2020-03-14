import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as FileAllSVG } from './file.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
	onClick: () => void;
};

function noop() {}
class FileIconComponent extends STComponent<IconPropType> {
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
				className={`${ModuleStyle['file-icon']} ${this.props.className}`}
				component={FileAllSVG}
			/>
		);
	}
}

export default FileIconComponent;
