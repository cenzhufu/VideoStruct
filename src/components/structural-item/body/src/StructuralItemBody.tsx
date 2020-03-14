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
export enum EBodySize {
	Normal = 'normal',
	Big = 'big'
}

interface PropsType extends StructuralItemPropsType {
	size: EBodySize;
}
class StructuralItemBody extends STComponent<Partial<PropsType>> {
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
		omMouseLeave: noop,

		size: EBodySize.Normal
	};
	render() {
		let bodySizeClass = '';
		switch (this.props.size) {
			case EBodySize.Big:
				bodySizeClass = ModuleStyle['big-body'];
				break;
			default:
				bodySizeClass = '';
				break;
		}
		return (
			<StructuralItem
				className={`${ModuleStyle['structural-item-body']} ${bodySizeClass} ${
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
			>
				{this.props.children}
			</StructuralItem>
		);
	}
}

export default StructuralItemBody;
