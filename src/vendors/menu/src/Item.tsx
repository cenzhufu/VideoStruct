import * as React from 'react';
import { Icon } from 'antd';
import DomUtils from 'ifutils/dom-util';

interface ComponentStateTreeItem {
	parent?: ComponentStateTreeItem;
	active: boolean;
	activeExpend: boolean; // 展开的
	children?: Array<ComponentStateTreeItem>;
}

export type ItemPropsType = {
	title: string | React.ReactNode;
	children: React.ReactNode;
	className: string;
	titleClassName: string;
	style: React.CSSProperties;
	maxHeight: number;
	level: number;
	value: string;
	activeState: ComponentStateTreeItem;
	sidemenuComponent: React.ReactNode;
	clickCallBack: (value: string) => void;
	handleIconClick: (value: string) => void;
	handleItemClick: (value: string) => void; // 对外接口，点击item回调
	onHeight: (height: number) => void;

	// disable
	disabled: boolean;
};

type StateType = {
	height: number;
};

function noop() {}
export default class Item extends React.Component<ItemPropsType, StateType> {
	static defaultProps = {
		title: '',
		key: '',
		children: null,
		handleItemClick: noop,
		clickCallBack: noop,
		onHeight: noop,
		className: '',
		style: {},
		maxHeight: 9999,
		disabled: false
	};
	menuItemRef: React.RefObject<HTMLDivElement>;
	constructor(props: ItemPropsType) {
		super(props);

		this.state = {
			height: 0
		};

		this.menuItemRef = React.createRef<HTMLDivElement>();
	}

	// static getDerivedStateFromProps(
	// 	nextProps: ItemPropsType,
	// 	prevState: StateType
	// ) {
	// 	return null;
	// }

	componentDidMount() {
		if (this.menuItemRef.current) {
			DomUtils.getDomTotalHeight(this.menuItemRef.current, {
				callback: (height) => {
					console.log('menu item height', height);
					this.setState({
						height: height
					});

					this.props.onHeight(height);
				}
			});
		}
	}

	componentDidUpdate(prevProps: ItemPropsType, prevState: StateType) {
		//TODO:
	}

	// 渲染item
	renderItemContent() {
		const { title, children, activeState } = this.props;
		return (
			<span className="item-block">
				{children && (
					<Icon
						type={`${
							activeState && activeState.activeExpend
								? 'minus-square'
								: 'plus-square'
						}`}
						onClick={this.onIconClick}
						className="item-icon"
					/>
				)}
				<span className="item-label" onClick={this.onItemClick}>
					{title}
				</span>
			</span>
		);
	}

	onIconClick = () => {
		const { value, handleIconClick } = this.props;
		if (!this.props.disabled) {
			handleIconClick(value);
			// if (sidemenuComponent) {
			// 	sidemenuComponent.setState({
			// 		...sidemenuComponent.state,
			// 		activeExpendItem: value
			// 	});
			// }
		}
	};

	onItemClick = () => {
		const { clickCallBack, value } = this.props;
		// 外部调用回调函数 -- 待完善 留有value可做path接口？
		//TODO:点击展开，暂时使用ICON事件逻辑，key值没搞清楚
		// handleIconClick(activeState);
		if (!this.props.disabled) {
			this.props.handleItemClick(value);
			clickCallBack(value);
		}
	};

	render() {
		const {
			children,
			activeState,
			level,
			className,
			titleClassName
		} = this.props;

		let expanded: boolean = (activeState && activeState.activeExpend) || false;

		return (
			<div
				className={`item item-level-${level} ${
					activeState && activeState.activeExpend ? 'active' : ''
				} ${className}`}
			>
				<div
					ref={this.menuItemRef}
					className={`${`item-title`} ${titleClassName}`}
				>
					{this.renderItemContent()}
				</div>
				{children && (
					<div
						style={{
							maxHeight: `${expanded ? this.props.maxHeight : 0}px`,
							backgroundColor: '#303D54'
						}}
						className={`children ${expanded ? 'active' : 'inactive'}`}
					>
						{children}
					</div>
				)}
			</div>
		);
	}
}
