import STComponent from 'stsrc/components/st-component';
import StructuralItem from '../../base';
// import StructuralInfoTipSegements from 'stsrc/components/structural-info-segements';
import * as React from 'react';
import ModuleStyle from './index.module.scss';
import {
	StructuralItemPropsType,
	DeleteButtonShowMode
} from '../../base/StructuralItem';
import { ImageDisplayMode } from 'ifvendors/image-view';
import { EThumbFlag } from 'stsrc/utils/requests/tools';

function noop() {}
class StructuralItemCar extends STComponent<StructuralItemPropsType> {
	static defaultProps = {
		className: '',
		contentClassName: ModuleStyle['structrual-item-content'],
		style: {},

		children: [],
		imageChildren: [],

		clickable: false,
		onClick: noop,
		deletable: false,
		onDelete: noop,
		deleteButtonShowMode: DeleteButtonShowMode.Hover,
		deleteButtonClass: '',

		draggable: true,
		draggableData: {},
		onDragStart: noop,
		onDragEnd: noop,
		displayMode: ImageDisplayMode.ScaleAspectFit,
		thumbFlag: EThumbFlag.Thumb200x160,

		onMouseEnter: noop,
		onMouseLeave: noop
	};
	render() {
		return (
			<div
				className={`${this.props.className} ${
					ModuleStyle['structural-car-img']
				}`}
			>
				<StructuralItem
					contentClassName={this.props.contentClassName}
					structuralItemInfo={this.props.structuralItemInfo}
					imageChildren={this.props.imageChildren}
					displayMode={this.props.displayMode}
					clickable={this.props.clickable}
					onClick={this.props.onClick}
					deletable={this.props.deletable}
					onDelete={this.props.onDelete}
					deleteButtonShowMode={this.props.deleteButtonShowMode}
					deleteButton={this.props.deleteButton}
					deleteButtonClass={this.props.deleteButtonClass}
					draggable={this.props.draggable}
					draggableData={this.props.draggableData}
					onDragStart={this.props.onDragStart}
					onDragEnd={this.props.onDragEnd}
					thumbFlag={this.props.thumbFlag}
				>
					{this.props.children}
				</StructuralItem>
			</div>
		);
	}
}

export default StructuralItemCar;
