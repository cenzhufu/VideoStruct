import * as React from 'react';

import ModuleStyle from './assets/styles/index.module.less';

type LazyloadPlaceHolderPropsType = {
	height?: number;
	className: string;
};

class LazyloadPlaceHolder extends React.Component<
	LazyloadPlaceHolderPropsType
> {
	static defaultProps = {
		className: ''
	};

	render() {
		// let height = this.props.height;
		// let style = height && height >= 0 ? { height: `${height}px` } : {};
		return (
			<div
				className={`${ModuleStyle['face-item--placeholder']} ${
					this.props.className
				}`}
			>
				<div className={ModuleStyle['lds-dual-ring']} />
			</div>
		);
	}
}

export default LazyloadPlaceHolder;
