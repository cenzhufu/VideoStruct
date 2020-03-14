import * as React from 'react';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	show: boolean;
	className: string;
	style: React.CSSProperties;
	tip: string;
};

class Loading extends STComponent<PropsType> {
	static defaultProps = {
		show: false,
		className: '',
		style: {},
		tip: '加载中...'
	};

	render() {
		return this.props.show ? (
			<div
				className={`${ModuleStyle['loading-container']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				<div className={ModuleStyle['loading-animation-container']}>
					<div className={`${ModuleStyle['loader']} ${ModuleStyle['loader1']}`}>
						<div />
					</div>
					<span>{this.props.tip}</span>
				</div>
			</div>
		) : null;
	}
}

export default Loading;
