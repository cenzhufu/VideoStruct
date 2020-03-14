import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
// import ModuleStyle from '../assets/tree-title.module.scss';

interface PropsType {
	className: string;
	data: any;
	renderWhenMouseIn: (data: any) => React.ReactNode;
	renderWhenMouseOut: (data: any) => React.ReactNode;
}

interface StateType {
	isMouseOver: boolean;
}

class HoverTreeTitle extends STComponent<PropsType, StateType> {
	static defaultProps = {
		className: '',
		data: null,
		renderWhenMouseIn: () => null,
		renderWhenMouseOut: () => null
	};

	state = {
		isMouseOver: false
	};

	onMouseEnter = () => {
		this.setState({
			isMouseOver: true
		});
	};

	onMouseLeave = () => {
		this.setState({
			isMouseOver: false
		});
	};

	render() {
		return (
			<div
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				className={this.props.className}
			>
				{this.state.isMouseOver
					? this.props.renderWhenMouseIn(this.props.data)
					: this.props.renderWhenMouseOut(this.props.data)}
			</div>
		);
	}
}

export default HoverTreeTitle;
