import * as React from 'react';
// import {
// 	StructuralItem,
// 	SearchImageItem,
// 	DeleteButtonShowMode
// } from 'stcomponents/structural-item';
import { IFStructuralInfo } from 'sttypedefine';
import ModuleStyle from './assets/styles/index.module.scss';
// import DroppableArea from 'ifvendors/droppable-area';
import STComponent from 'stcomponents/st-component';

export enum EListMode {
	Default = 'PlaceHolder',
	OneByOne = 'OneByOne'
}

interface SearchStructualListPropsType {
	className: string;
	style: Object;
	itemClassName: string; // 每个item的class
	structualItemList: Array<IFStructuralInfo>;
	placeHolder: React.ReactNode;
	// selectedId:
	onDelete: (structualItemInfo: IFStructuralInfo, index: number) => void;
	clickable: boolean; // 是否可点击
	onClick: (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 点击事件
	children: React.ReactNode;
	maxCount: number; // 最大显示的数量
	onDrop: (structuralItemInfo: IFStructuralInfo) => void;
	listMode: EListMode;
	selectedIds: Array<string>; // 选中的ids
}

function noop() {}

class SearchStructuralTargetItemList extends STComponent<
	SearchStructualListPropsType
> {
	static defaultProps = {
		className: '',
		style: {},
		structualItemList: [],
		onDelete: noop,
		itemClassName: '',
		children: undefined,
		maxCount: 5,
		onDrop: noop,
		listMode: EListMode.Default,
		clickable: false,
		onClick: noop,
		selectedIds: [],
		placeHolder: null
	};

	onDelete = (
		index: number,
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => {
		this.props.onDelete(structuralItemInfo, index);
	};

	onDrop = (data: Object) => {
		// 验证数据的有效性
		let result = data as IFStructuralInfo;
		if (result.id) {
			this.props.onDrop(result);
		}
	};

	render() {
		// let StructualItemList = this.props.structualItemList.map(
		// 	(structualItemInfo: IFStructuralInfo, index: number) => {
		// 		if (index >= this.props.maxCount) {
		// 			return null;
		// 		}
		// 		let selected: boolean =
		// 			this.props.selectedIds.indexOf(structualItemInfo.id) !== -1;
		// 		return (
		// 			<SearchImageItem
		// 				key={structualItemInfo.uuid}
		// 				selected={selected}
		// 				deletable={true}
		// 				onDelete={this.onDelete.bind(this, index)}
		// 				clickable={this.props.clickable}
		// 				onClick={this.props.onClick}
		// 				deleteButtonShowMode={DeleteButtonShowMode.Always}
		// 				structuralItemInfo={structualItemInfo}
		// 				draggableData={structualItemInfo}
		// 				className={`${ModuleStyle['structual-list-item']} ${
		// 					this.props.itemClassName
		// 				}`}
		// 				contentClassName={`${ModuleStyle['structual-list-item--content']} ${
		// 					this.props.itemClassName
		// 				}`}
		// 			/>
		// 		);
		// 	}
		// );

		// let PlaceHolders = [];
		// if (this.props.listMode === EListMode.Default) {
		// 	for (
		// 		let index = 0;
		// 		index < this.props.maxCount - this.props.structualItemList.length;
		// 		index++
		// 	) {
		// 		PlaceHolders.push(
		// 			<DroppableArea
		// 				onDrop={this.onDrop}
		// 				key={index}
		// 				className={`${ModuleStyle['placeholder']} ${
		// 					this.props.itemClassName
		// 				}`}
		// 			>
		// 				{this.props.placeHolder}
		// 			</DroppableArea>
		// 		);
		// 	}
		// } else {
		// 	PlaceHolders = [];
		// }

		return (
			<div
				className={`${ModuleStyle['structual-list']} ${this.props.className}`}
				style={this.props.style}
			>
				{/* {StructualItemList} */}
				{/* {PlaceHolders} */}
				{this.props.children}
			</div>
		);
	}
}

export default SearchStructuralTargetItemList;
