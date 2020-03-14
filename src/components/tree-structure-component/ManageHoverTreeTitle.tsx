import { HoverTreeTitle } from 'stsrc/components/hover-tree-title';
import * as React from 'react';
import ModuleStyle from './assets/styles/title.module.scss';
import { Popover, Icon } from 'antd';
import STComponent from 'stsrc/components/st-component';

interface PropsType {
	className: string;
	title: string;
	content: React.ReactNode;
}

export default class ManageHoverTreeTitle extends STComponent<PropsType> {
	static defaultProps = {
		className: '',
		title: '',
		content: null
	};

	onClickInfo = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
	};

	renderWhenMouseIn = (data: any) => {
		return (
			<div className={ModuleStyle['content']}>
				<div className={ModuleStyle['title']} title={this.props.title}>
					{this.props.title}
				</div>
				<Popover
					overlayClassName={ModuleStyle['overlay']}
					content={this.props.content}
					trigger="click"
					placement="bottom"
				>
					<Icon className={ModuleStyle['icon']} type="ellipsis" />
				</Popover>
			</div>
		);
	};

	renderWhenMouseOut = (data: any) => {
		return (
			<div className={ModuleStyle['content']}>
				<div className={ModuleStyle['title']} title={this.props.title}>
					{this.props.title}
				</div>
			</div>
		);
	};

	render() {
		return (
			<HoverTreeTitle
				className={this.props.className}
				renderWhenMouseIn={this.renderWhenMouseIn}
				renderWhenMouseOut={this.renderWhenMouseOut}
			/>
		);
	}
}
