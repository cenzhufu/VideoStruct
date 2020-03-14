import * as React from 'react';
import { Icon } from 'antd';
import { ReactComponent as AdvanceSettingAddSvg } from './add.svg';
import { ReactComponent as AdvanceSettingEditSvg } from './edit.svg';
import { ReactComponent as AdvanceSettingDeleteSvg } from './delete.svg';
import ModuleStyle from './setting-icon.module.scss';
import STComponent from 'stcomponents/st-component';

type PropType = {
	className: string;
	unitNameText: string;
	showAddIcon: boolean;
	addUnitItemHandleClick: () => void;
	editdUnitItemHandleClick: () => void;
	deletedUnitItemHandleClick: () => void;
};

interface StateType {
	showModule: boolean;
}

class AdvanceSettingIconComponent extends STComponent<PropType, StateType> {
	static defaultProps = {
		className: '',
		unitNameText: '',
		showAddIcon: true,
		addUnitItemHandleClick: () => {},
		editdUnitItemHandleClick: () => {},
		deletedUnitItemHandleClick: () => {}
	};
	render() {
		let display = {};
		if (!this.props.showAddIcon) {
			display = { display: 'none' };
		}
		return (
			<div className={`${ModuleStyle['setting-icons']}`}>
				<span className={`${ModuleStyle['setting-unit-name']}`}>
					{this.props.unitNameText}
				</span>
				<div>
					<Icon
						style={display}
						className={`${ModuleStyle['setting-add-icon']} ${
							this.props.className
						}`}
						component={AdvanceSettingAddSvg}
						onClick={this.props.addUnitItemHandleClick}
					/>
					<Icon
						className={`${ModuleStyle['setting-edit-icon']} ${
							this.props.className
						}`}
						component={AdvanceSettingEditSvg}
						onClick={this.props.editdUnitItemHandleClick}
					/>
					<Icon
						className={`${ModuleStyle['setting-delete-icon']} ${
							this.props.className
						}`}
						component={AdvanceSettingDeleteSvg}
						onClick={this.props.deletedUnitItemHandleClick}
					/>
				</div>
			</div>
		);
	}
}

export default AdvanceSettingIconComponent;
