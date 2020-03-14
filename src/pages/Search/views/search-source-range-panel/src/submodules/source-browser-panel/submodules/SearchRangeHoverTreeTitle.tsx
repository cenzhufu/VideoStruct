import { HoverTreeTitle } from 'stsrc/components/hover-tree-title';
import * as React from 'react';
import ModuleStyle from './assets/styles/tree-title.module.scss';
import { Popover, Icon } from 'antd';
import STComponent from 'stsrc/components/st-component';
import { formatCountTip } from '../../../util';

interface PropsType {
	title: string | number;
	showInfoIconOnHover: boolean;
	count: number;
	showCountEvenIfZero: boolean;
	content: React.ReactNode;
}

export default class SearchRangeHoverTreeTitle extends STComponent<PropsType> {
	onClickInfo = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
	};

	renderCountIfNeeded() {
		if (!this.props.showCountEvenIfZero && !this.props.count) {
			return null;
		} else {
			return (
				<div className={ModuleStyle['count']}>
					{formatCountTip(this.props.count)}
				</div>
			);
		}
	}

	renderWhenMouseIn = (data: any) => {
		return (
			<div className={ModuleStyle['content']}>
				<div className={ModuleStyle['title']}>{this.props.title}</div>
				<Popover content={this.props.content} trigger="click" placement="right">
					<Icon
						onClick={this.onClickInfo}
						type="info-circle"
						theme="filled"
						className={ModuleStyle['icon']}
					/>
				</Popover>
				{this.renderCountIfNeeded()}
			</div>
		);
	};

	renderWhenMouseOut = (data: any) => {
		return (
			<div className={ModuleStyle['content']}>
				<div className={ModuleStyle['title']}>{this.props.title}</div>
				{this.renderCountIfNeeded()}
			</div>
		);
	};

	render() {
		return (
			<HoverTreeTitle
				className={ModuleStyle['tree-title']}
				renderWhenMouseIn={this.renderWhenMouseIn}
				renderWhenMouseOut={this.renderWhenMouseOut}
			/>
		);
	}
}
