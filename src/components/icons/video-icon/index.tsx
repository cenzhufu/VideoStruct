import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as CameraSvg } from './video-icon.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
};

class VideoIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: ''
	};

	render() {
		return (
			<Icon
				className={`${ModuleStyle['video-icon']} ${this.props.className}`}
				component={CameraSvg}
			/>
		);
	}
}

export default VideoIconComponent;
