import * as React from 'react';
// import { Icon } from 'antd';
// import { ReactComponent as CameraSvg } from './delete-icon.svg';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

type IconPropType = {
	className: string;
	onDelete: () => void;
};

class DeleteIconComponent extends STComponent<IconPropType> {
	static defaultProps = {
		className: '',
		onDelete: () => {}
	};

	onDelete = () => {
		this.props.onDelete();
	};

	render() {
		return (
			<div className={ModuleStyle['delete-icon']} onClick={this.onDelete}>
				{/* <Icon
					className={`${ModuleStyle['delete-icon']} ${this.props.className}`}
					component={CameraSvg}
				/> */}
			</div>
		);
	}
}

export default DeleteIconComponent;
