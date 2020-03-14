import * as React from 'react';
import { ImageDisplayMode } from 'ifvendors/image-view';
import LazyloadImageView from 'ifvendors/lazyload-imageview';
import DraggableArea from 'ifvendors/draggable-area';
import ModuleStyle from './assets/styles/index.module.scss';
import { Icon } from 'antd';
import { IFStructuralInfo } from 'sttypedefine';
import { ReactComponent as DeleteIcon } from './assets/imgs/close.svg';
import STComponent from 'stcomponents/st-component';
import { EThumbFlag, validateImageUrlField } from 'stsrc/utils/requests/tools';
import Config from 'stconfig';
import eventEmiiter, { EventType } from 'stutils/event-emit';
import { guid } from 'ifvendors/utils/guid';

/**
 * 结构化的对象信息类型
 */

export enum DeleteButtonShowMode {
	Always = 'always', // 一直显示
	Hover = 'hover' // hover的时候
}

/**
 * 结构化对象组件的props类型
 */
export interface StructuralItemPropsType {
	className: string;
	contentClassName: string; // imageView的className, 可以通过这个类来附加一些相应式布局，因为默认的整个组件的尺寸是通过子组件计算的。
	style: Object;
	structuralItemInfo: IFStructuralInfo;
	children: React.ReactNode;
	imageChildren: React.ReactNode;
	displayMode: ImageDisplayMode;

	clickable: boolean; // 是否可点击
	onClick: (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 点击事件

	deletable: boolean; // 是否可删除
	onDelete: (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 删除事件
	deleteButtonShowMode: DeleteButtonShowMode; // 删除按钮显示的模式
	deleteButton?: React.ReactNode; // 定制化的删除按钮
	deleteButtonClass: string;

	draggable: boolean; // 是否可拖动
	draggableData?: Object; // 拖动的数据
	onDragStart: (structuralItemInfo: IFStructuralInfo) => void;
	onDragEnd: () => void;

	thumbFlag: EThumbFlag;

	// v2新增的属性
	onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
	onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
}

type StucturalItemStateType = {
	showDeleteButton: boolean;
};

function noop() {}

class StructuralItem extends STComponent<
	StructuralItemPropsType,
	StucturalItemStateType
> {
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

	constructor(props: StructuralItemPropsType) {
		super(props);

		this.state = {
			showDeleteButton:
				props.deletable &&
				props.deleteButtonShowMode === DeleteButtonShowMode.Always
		};
	}

	onMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
		if (
			this.props.deletable &&
			this.props.deleteButtonShowMode === DeleteButtonShowMode.Hover
		) {
			this.setState(
				(prevState: StucturalItemStateType, props: StructuralItemPropsType) => {
					if (!prevState.showDeleteButton) {
						return {
							showDeleteButton: true
						};
					} else {
						return null;
					}
				}
			);
		}

		this.props.onMouseEnter(event);
	};

	onMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
		if (
			this.props.deletable &&
			this.props.deleteButtonShowMode === DeleteButtonShowMode.Hover
		) {
			this.setState(
				(prevState: StucturalItemStateType, props: StructuralItemPropsType) => {
					if (prevState.showDeleteButton) {
						return {
							showDeleteButton: false
						};
					} else {
						return null;
					}
				}
			);
		}

		this.props.onMouseLeave(event);
	};

	onClickImage = (event: React.SyntheticEvent<HTMLDivElement>) => {
		if (this.props.clickable) {
			const itemInfo = { ...this.props.structuralItemInfo };
			this.props.onClick(itemInfo, event);
		}
	};

	onDeleteClick = (event: React.SyntheticEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (this.props.deletable) {
			const itemInfo = { ...this.props.structuralItemInfo };
			this.props.onDelete(itemInfo, event);
		}
	};

	onDragStart = (dragData: IFStructuralInfo) => {
		// NOTE: 修改拖动的uuid
		dragData.uuid = guid();
		eventEmiiter.emit(EventType.dragStart, dragData);
		this.props.onDragStart(dragData);
	};

	onDragEnd = () => {
		eventEmiiter.emit(EventType.dragEnd);
		this.props.onDragEnd();
	};

	render() {
		let DeleteButton = this.props.deleteButton ? (
			this.props.deleteButton
		) : (
			<Icon className={ModuleStyle['delete-icon']} component={DeleteIcon} />
		);

		let imageClassNames = [ModuleStyle['cut'], this.props.contentClassName];
		if (this.props.clickable) {
			imageClassNames.push(ModuleStyle['clickable']);
		}

		let ContentComponent = (
			<div
				className={`${ModuleStyle['structrual-item-content']}`}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<LazyloadImageView
					onClick={this.onClickImage}
					className={imageClassNames.join(' ')}
					displayMode={this.props.displayMode}
					imageUrl={validateImageUrlField(
						this.props.structuralItemInfo.targetImageUrl,
						Config.isThumbnailEnabled(),
						this.props.thumbFlag
					)}
				>
					{this.props.imageChildren}
				</LazyloadImageView>

				{this.state.showDeleteButton ? (
					<div
						className={`${ModuleStyle['delete-icon-container']} ${
							this.props.deleteButtonClass
						}`}
						onClick={this.onDeleteClick}
					>
						{DeleteButton}
					</div>
				) : null}
				{this.props.children}
			</div>
		);

		if (this.props.draggable) {
			return (
				<DraggableArea
					onDragStart={this.onDragStart}
					onDragEnd={this.onDragEnd}
					style={this.props.style}
					className={`${ModuleStyle['structural-item']} ${
						this.props.className
					}`}
					name="name"
					dragData={
						this.props.draggableData
							? this.props.draggableData
							: this.props.structuralItemInfo
					}
				>
					{ContentComponent}
				</DraggableArea>
			);
		} else {
			return ContentComponent;
		}
	}
}

export default StructuralItem;
