import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import ModuleStyle from './index.module.scss';

import SearchIcon from '../search-icon';
import CloseIcon from '../close-icon';

type PropsType = {
	className: string;

	onClickClose: () => void;
	onClickSearch: () => void;
};

function noop() {}

class CropStateControlBar extends STComponent<PropsType> {
	static defaultProps = {
		className: '',
		onClickClose: noop,
		onClickSearch: noop
	};

	onClickClose = () => {
		this.props.onClickClose();
	};

	onClickSearch = () => {
		this.props.onClickSearch();
	};

	render() {
		return (
			<div
				className={`${ModuleStyle['crop-state-control-bar']} ${
					this.props.className
				}`}
			>
				<SearchIcon
					className={`${ModuleStyle['item']}`}
					onClick={this.onClickSearch}
				/>
				<CloseIcon
					className={ModuleStyle['item']}
					onClick={this.onClickClose}
				/>
			</div>
		);
	}
}

export default CropStateControlBar;
