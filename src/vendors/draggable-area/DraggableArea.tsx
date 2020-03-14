// @flow

/**
 * 可拖动的区域封装，可配合DroppableArea使用
 */

import * as React from 'react';
import { EventEmitter } from 'events';

interface DraggableAreaPropsType {
	name: string;
	className: string;
	style: Object;
	children: React.ReactNode;
	onDragStart: (
		dragData: {
			[key: string]: any;
		},
		event: React.DragEvent<HTMLDivElement>
	) => void;
	onDragEnd: () => void;
	onDrag: () => void;
	onDragExit: () => void;
	dragData: {
		[key: string]: any;
	}; // 拖动的数据
}

function noop() {}

// 初始化事件
let DragEventEmmiter: EventEmitter = new EventEmitter();

/**
 * [DraggableArea description]
 * @extends React
 */
class DraggableArea extends React.Component<DraggableAreaPropsType> {
	static defaultProps = {
		className: '',
		style: {},
		onDragStart: noop,
		onDragEnd: noop,
		onDrag: noop,
		onDragExit: noop,
		dragData: {}
	};
	/**
	 * [onDragStart description]
	 * @param  {React.DragEvent<HTMLDivElement>} event [description]
	 * @return {void}       [description]
	 */
	onDragStart = (event: React.DragEvent<HTMLDivElement>): void => {
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'copy';
			event.dataTransfer.setData(
				'text/plain',
				JSON.stringify(this.props.dragData)
			);

			this.props.onDragStart(this.props.dragData, event);

			DragEventEmmiter.emit(`${this.props.name}_DragStart`);
		}
	};

	/**
	 * [onDragEnd description]
	 * @return {void} [description]
	 */
	onDragEnd = (): void => {
		this.props.onDragEnd();
		DragEventEmmiter.emit(`${this.props.name}_DragEnd`);
	};

	/**
	 * [onDrag description]
	 * @return {void} [description]
	 */
	onDrag = (): void => {
		this.props.onDrag();
		DragEventEmmiter.emit(`${this.props.name}_Drag`);
	};

	/**
	 * [onDragExit description]
	 * @return {void} [description]
	 */
	onDragExit = (): void => {
		this.props.onDragExit();
		DragEventEmmiter.emit(`${this.props.name}_DragExist`);
	};

	render() {
		return (
			<div
				style={this.props.style}
				className={this.props.className}
				draggable={true}
				onDragStart={this.onDragStart}
				onDragEnd={this.onDragEnd}
				onDragExit={this.onDragExit}
			>
				{this.props.children}
			</div>
		);
	}
}

export { DraggableArea };
export { DraggableAreaPropsType };
export { DragEventEmmiter };
