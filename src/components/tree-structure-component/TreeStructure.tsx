import * as React from 'react';
import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/styles/index.module.scss';
import { Tree, message } from 'antd';
import STComponent from 'stcomponents/st-component';
import ManageHoverTreeTitle from './ManageHoverTreeTitle';
// eslint-disable-next-line
import { IFTreeNode } from 'stsrc/type-define';

const TreeNode = Tree.TreeNode;

type PropsTypes<T> = {
	treeList: T[];
	renderPopover: (item: T) => React.ReactNode;
};

interface StateTpye {
	expandedKeys: string[];
}

function noop() {}

class TreeStructure<TreeNode extends IFTreeNode> extends STComponent<
	PropsTypes<TreeNode>,
	StateTpye
> {
	static defaultProps = {
		searchStr: '',
		treeList: [],
		addOperationHandle: noop,
		editOperationHandle: noop,
		deleteOperationHandle: noop,
		refreshDataHandle: noop,
		renderPopover: () => null
	};
	constructor(props: PropsTypes<TreeNode>) {
		super(props);
		this.state = {
			expandedKeys: []
		};
	}

	onExpand = (expandedKeys: string[]) => {
		this.setState({
			expandedKeys
		});
	};

	//输入字符串长度校验
	areasNameCheck = (value: string) => {
		if (value && value.length > 10) {
			message.error(
				intl
					.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
					.d('请输入不超过10位字符')
			);
			return false;
		} else {
			return true;
		}
	};

	_renderTree(rootNode: TreeNode): React.ReactNode {
		const TitleElement = (
			<ManageHoverTreeTitle
				className={ModuleStyle['title']}
				title={rootNode.name}
				content={this.props.renderPopover(rootNode)}
			/>
		);

		return (
			<TreeNode key={String(rootNode.uuid)} title={TitleElement}>
				{rootNode.children.map((child: TreeNode) => {
					return this._renderTree(child);
				})}
			</TreeNode>
		);
	}

	render() {
		const { expandedKeys } = this.state;

		return (
			<div className={`${ModuleStyle['tree-structure']}`}>
				<div className={`${ModuleStyle['units-area-show']}`}>
					<Tree
						showLine={true}
						onExpand={this.onExpand}
						expandedKeys={expandedKeys}
					>
						{this.props.treeList.map((tree: TreeNode) => {
							return this._renderTree(tree);
						})}
					</Tree>
				</div>
			</div>
		);
	}
}

export default TreeStructure;
