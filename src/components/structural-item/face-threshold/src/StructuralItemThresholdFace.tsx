import StructuralItemFace from '../../face';
import STComponent from 'stsrc/components/st-component';
import {
	StructuralItemPropsType,
	DeleteButtonShowMode
} from '../../base/StructuralItem';
import * as React from 'react';
import ModuleStyle from './index.module.scss';
import { ImageDisplayMode } from 'ifvendors/image-view';
import { EThumbFlag } from 'stsrc/utils/requests/tools';

interface IPropsType extends StructuralItemPropsType {
	showThreshold: boolean;
}

function noop() {}
class StructuralItemThresholdFace extends STComponent<IPropsType> {
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

		showThreshold: false
	};
	render() {
		return (
			<StructuralItemFace
				className={`${this.props.className}`}
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
				{this.props.showThreshold &&
					this.props.structuralItemInfo.threshold !== 0 && (
						<div className={`${ModuleStyle['result-threshold']}`}>
							{this.props.structuralItemInfo.threshold}%
						</div>
					)}
			</StructuralItemFace>
		);
	}
}

export default StructuralItemThresholdFace;
