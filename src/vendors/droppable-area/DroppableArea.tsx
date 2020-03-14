// @flow

/**
 * 可放置的区域，可配合DraggableArea使用
 */

import * as React from 'react';
import { EventEmitter } from 'events';

type DroppableAreaPropsType = {
	className: string;
	onDragEnter: () => void;
	onDragLeave: () => void;
	onDrop: (dragData: Object, event: React.DragEvent<HTMLDivElement>) => void;
	onDropFiles: (
		files: Array<File>,
		event: React.DragEvent<HTMLDivElement>
	) => void;
	onDragOver: () => void;
	children: React.ReactNode;
	onClick: () => void;
};

// 初始化事件
let DropEventEmmiter: EventEmitter = new EventEmitter();

/**
 * do nothing
 * @return {void}
 */
function noop(): void {}

class DroppableArea extends React.Component<DroppableAreaPropsType> {
	static defaultProps = {
		onDragEnter: noop,
		onDragLeave: noop,
		onDrop: noop,
		onDropFiles: noop,
		onDragOver: noop,
		className: '',
		children: [],
		onClick: noop
	};

	constructor(props: DroppableAreaPropsType) {
		super(props);

		this.onDragEnter = this.onDragEnter.bind(this);
	}

	/**
	 * [onDragEnter description]
	 * @param  {DragEvent} event [description]
	 * @return {void}       [description]
	 */
	onDragEnter = (event: React.DragEvent<HTMLDivElement>): void => {
		event.preventDefault();
		this.props.onDragEnter();

		DropEventEmmiter.emit(`DragEnter`);
	};

	/**
	 * [onDragLeave description]
	 * @return {void} [description]
	 */
	onDragLeave = (): void => {
		this.props.onDragLeave();
		DropEventEmmiter.emit(`DragLeave`);
	};

	/**
	 * [onDrop description]
	 * @param  {DragEvent} event [description]
	 * @return {void}       [description]
	 */
	onDrop = (event: React.DragEvent<HTMLDivElement>): void => {
		event.preventDefault();
		if (event.dataTransfer) {
			// 判断有没有拖拽的数据（拖拽文件不会设置这个数据）
			let dragDataStr = event.dataTransfer.getData('text/plain');
			if (dragDataStr) {
				let dragDataJson = {};
				try {
					dragDataJson = JSON.parse(dragDataStr);
					this.props.onDrop(dragDataJson, event);
					DropEventEmmiter.emit(`Drop`);
				} catch (error) {
					dragDataJson = {};
					console.error(error);
				}

				return;
			}
		}

		// 是否拖拽文件
		let results: Array<File> = [];
		if (event.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (let i = 0; i < event.dataTransfer.items.length; i++) {
				// If dropped items aren't files, reject them
				if (event.dataTransfer.items[i].kind === 'file') {
					let file: File | null = event.dataTransfer.items[i].getAsFile();
					if (file) {
						results.push(file);
					}
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (let i = 0; i < event.dataTransfer.files.length; i++) {
				results.push(event.dataTransfer.files[i]);
			}
		}

		this.props.onDropFiles(results, event);
		DropEventEmmiter.emit(`DropFiles`);
	};

	/**
	 * [onDragOver description]
	 * @param  {DragEvent} event [description]
	 * @return {[type]}       [description]
	 */
	onDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}

		this.props.onDragOver();
		DropEventEmmiter.emit(`DragOver`);
	};

	onClick = () => {
		this.props.onClick();
	};

	render() {
		return (
			<div
				className={this.props.className}
				onDragEnter={this.onDragEnter}
				onDragOver={this.onDragOver}
				onDragLeave={this.onDragLeave}
				onDrop={this.onDrop}
				onClick={this.onClick}
			>
				{this.props.children}
			</div>
		);
	}
}

export { DroppableArea };
export { DroppableAreaPropsType };
export { DropEventEmmiter };
