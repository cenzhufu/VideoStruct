import * as React from 'react';
import Item, { ItemPropsType } from './Item';
import DomUtils from 'ifutils/dom-util';
import _isEqual from 'lodash/isEqual';

// 菜单展开的模式
export enum MenuExpandableMode {
	OnlyOne = 'only-one-at-the-same-time'
}

type PropsType = {
	className: string; // 传递入的classname
	style: React.CSSProperties; // 自定义样式
	children: React.ReactNode; // item
	mode: MenuExpandableMode; // 单选or多选
	expandedKeys: Array<string>; // 当前展开的key
	clickCallBack: (key: string) => void; // 对外接口，点击item回调
	onExpanded: (key: string) => void;
	onCollapsed: (key: string) => void;

	isNest: boolean; // 是否嵌套
};

type StateType = {
	componentStateTree: Array<ComponentStateTreeItem>; // 渲染控制的状态树
	activeExpendItems: Array<string>; // 展开的

	prevExpandedKeys: Array<string>;

	height: number; // 计算高..
	restHeight: number; // 剩余的高度
	childrenTotalHeight: number;
	background: string;
};

// 渲染控制的状态树
interface ComponentStateTreeItem {
	parent?: ComponentStateTreeItem;
	active: boolean;
	activeExpend: boolean; // 展开的
	children: ComponentStateTreeItem[];
}

function noop() {}

export default class SideMenu extends React.Component<PropsType, StateType> {
	static Item: typeof Item;
	static defaultProps = {
		children: null,
		mode: MenuExpandableMode.OnlyOne,
		className: '',
		style: {},
		expandedKeys: [],
		isNest: false,
		clickCallBack: noop
	};

	menuRef: React.RefObject<HTMLDivElement>;
	constructor(props: PropsType) {
		super(props);
		this.state = {
			componentStateTree: [],
			activeExpendItems: [...props.expandedKeys],
			height: 0,
			restHeight: 0,
			childrenTotalHeight: 0,
			prevExpandedKeys: []
		};

		this.menuRef = React.createRef<HTMLDivElement>();
	}

	componentDidMount() {
		// setTimeout(() => {
		if (this.menuRef.current) {
			DomUtils.getDomTotalHeight(this.menuRef.current, {
				callback: (height) => {
					// console.log('menu height', height);
					this.setState((prevState: StateType) => {
						return {
							height: height,
							restHeight: Math.max(0, height - prevState.childrenTotalHeight)
						};
					});
					// 得到子item的高度
				},
				ignoreSelfStyle: false
			});
		}
		// }, 500);
	}

	componentWillMount() {
		if (this.props.children) {
			this.setState({
				componentStateTree: this.buildComponentStateTree(this.props.children)
			});
		}
	}

	componentDidUpdate(prevProps: PropsType, prevState: StateType) {
		if (this.props.expandedKeys !== prevProps.expandedKeys) {
			this.setState(
				{
					activeExpendItems: this.props.expandedKeys
				},
				() => {
					this.setState({
						componentStateTree: this.buildComponentStateTree(
							this.props.children
						)
					});
				}
			);
		}
	}

	// 挂载前创建状态树
	buildComponentStateTree = (
		children: React.ReactNode,
		parent?: ComponentStateTreeItem
	): ComponentStateTreeItem[] => {
		const { activeExpendItems } = this.state;
		// 重组react nodes
		return React.Children.map(children, (child: React.ReactChild) => {
			// 初始化
			const newChild: ComponentStateTreeItem = {
				active: false,
				activeExpend: false,
				parent: parent,
				children: []
			};
			let subTree: ComponentStateTreeItem[] = [];

			activeExpendItems.forEach((ele: string) => {
				if (React.isValidElement<ItemPropsType>(child)) {
					// 只允许Item类型
					if (ele === child.props.value) {
						this.expendComponentTree(newChild, false);
					}
				}
			});

			// 只允许Item类型
			if (React.isValidElement<ItemPropsType>(child)) {
				if (child.props.children) {
					subTree = this.buildComponentStateTree(
						child.props.children,
						newChild
					);
				}
			}

			newChild.children = subTree;
			return newChild;
		});
	};

	// 点击icon展开
	handleIconClick = (item: ComponentStateTreeItem) => {
		const { componentStateTree } = this.state;
		const { mode } = this.props;
		if (!item || !item.children || !item.children.length) {
			return;
		}
		if (mode === MenuExpandableMode.OnlyOne) {
			let hasExpend = componentStateTree.filter((v) => {
				return v.activeExpend;
			});
			if (hasExpend.length) {
				hasExpend.forEach((hasItem) => {
					if (!_isEqual(hasItem, item)) {
						hasItem.activeExpend = false;
						// zmltodo 子元素的如果不是递归生成的收缩业务zuo?
					}
				});
			}
		}
		const activeBefore = item.activeExpend;
		this.expendComponentTree(item, activeBefore);
		this.setState({ componentStateTree: componentStateTree });
	};

	onChildHeight = (height: number) => {
		this.setState((prevState: StateType) => {
			return {
				childrenTotalHeight: prevState.childrenTotalHeight + height,
				restHeight: Math.max(0, height - prevState.childrenTotalHeight)
			};
		});
	};

	/**
	 * 展示激活的交互控制
	 * @param {ComponentStateTreeItem} item item
	 * @param {boolean} activeBefore activeBefore
	 * @returns {void}
	 * @memberof SideMenu
	 */
	expendComponentTree = (
		item: ComponentStateTreeItem,
		activeBefore: boolean
	) => {
		if (item) {
			if (activeBefore) {
				this.deExpendComponentTree(item.children);
			}
			item.activeExpend = !activeBefore;
			if (item.parent) {
				this.expendComponentTree(item.parent, false);
			}
		}
	};
	/**
	 * 取消展示激活
	 * @param {Array<ComponentStateTreeItem>} componentStateTree items
	 * @returns {Array<ComponentStateTreeItem>} 修改后的
	 * @memberof SideMenu
	 */
	deExpendComponentTree = (
		componentStateTree: Array<ComponentStateTreeItem>
	) => {
		if (!componentStateTree) {
			return [];
		}
		return componentStateTree.map((child: ComponentStateTreeItem) => {
			child.activeExpend = false;
			if (child.children) {
				child.children = this.deExpendComponentTree(child.children);
			}
			return child;
		});
	};

	render() {
		const { componentStateTree } = this.state;
		const { clickCallBack } = this.props;
		const sidemenuComponent = this;
		return (
			<div
				className={`side-menu ${this.props.className}`}
				style={this.props.style}
				ref={this.menuRef}
			>
				{React.Children.map(
					this.props.children,
					(child: React.ReactChild, index) => {
						if (React.isValidElement<ItemPropsType>(child)) {
							return React.cloneElement(child, {
								activeState: componentStateTree[index],
								sidemenuComponent,
								level: 1,
								clickCallBack,
								maxHeight: this.state.restHeight,
								onHeight: this.onChildHeight
							});
						} else {
							return null;
						}
					}
				)}
			</div>
		);
	}
}
