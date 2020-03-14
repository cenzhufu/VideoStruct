import * as React from 'react';
import ModuleStyle from './index.module.scss';

type PropsType = {
	className: string;
	style: object;
	onClickMask: () => void;
};

function noop() {}

class MaskLayer extends React.Component<PropsType> {
	static defaultProps = {
		className: '',
		style: {},
		onClickMask: noop
	};

	onClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		this.props.onClickMask();
	};

	onMouseEnter(e: React.MouseEvent) {
		e.stopPropagation();
	}

	render() {
		return (
			<div
				className={`${ModuleStyle['mask-layer']} ${this.props.className}`}
				style={this.props.style}
				onClickCapture={this.onClick}
				onMouseMoveCapture={this.onMouseEnter}
				onMouseEnter={this.onMouseEnter}
			/>
		);
	}
}

export default MaskLayer;
