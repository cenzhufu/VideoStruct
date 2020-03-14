import STComponent from 'stsrc/components/st-component';
import StructuralItem from '../../base';
import { ImageDisplayMode } from 'ifvendors/image-view';
import {
	DeleteButtonShowMode,
	StructuralItemPropsType
} from '../../base/StructuralItem';
import ModuleStyle from './assets/styles/index.module.scss';
import * as React from 'react';
import { EThumbFlag } from 'stsrc/utils/requests/tools';

function noop() {}

class StructuralItemFace extends STComponent<StructuralItemPropsType> {
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
		thumbFlag: EThumbFlag.Thumb100x100,

		onMouseEnter: noop,
		onMouseLeave: noop
	};
	render() {
		return (
			<StructuralItem
				className={`${ModuleStyle['structural-item-face']} ${
					this.props.className
				}`}
				style={this.props.style}
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
				onMouseEnter={this.props.onMouseEnter}
				onMouseLeave={this.props.onMouseLeave}
			>
				{this.props.children}
			</StructuralItem>
		);
	}
}

export default StructuralItemFace;
