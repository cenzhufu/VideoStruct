import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import { Tree } from 'antd';
import { AntTreeNodeSelectedEvent } from 'antd/lib/tree';
import STComponent from 'stcomponents/st-component';
import {
	ESourceType,
	IFTreeNode,
	IFStructuralLinkInfo,
	getStructuralLinkInfoSourceType,
	getStructuralLinkInfoSourceId
} from 'stsrc/type-define';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { formatCountTip } from '../../../util';

const TreeNode = Tree.TreeNode;

type PropsTypes = {
	sourceType: ESourceType;
	onSelected: (
		values: IFUniqueDataSource[],
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void;
	disabled: boolean;
	currentSourceType: ESourceType;

	nodeList: IFTreeNode<number>[];

	selectedNodes: IFTreeNode[];
};

interface StateTpye {
	selectedKeys: string[];
	selectedNode: IFTreeNode;
}

function noop() {}

class FlatTree extends STComponent<PropsTypes, StateTpye> {
	static defaultProps = {
		nodeList: [],
		disabled: false,
		sourceType: ESourceType.Unknown,
		onSelected: noop,
		currentSourceType: ESourceType.All,
		selectedNodes: []
	};
	constructor(props: PropsTypes) {
		super(props);
		this.state = {
			selectedKeys: []
		};
	}

	_selected() {
		let sourceInfo: Array<IFUniqueDataSource> = this.state.selectedKeys.map(
			(key: string) => {
				return {
					sourceId: key,
					sourceType: this.props.sourceType
				};
			}
		);
		this.props.onSelected(
			sourceInfo,
			this.state.selectedNode,
			(item: IFStructuralLinkInfo) => {
				let type: ESourceType = getStructuralLinkInfoSourceType(item);
				let sourceId: string = getStructuralLinkInfoSourceId(item);
				return (
					type === this.props.sourceType &&
					sourceInfo.some((source: IFUniqueDataSource) => {
						// eslint-disable-next-line
						return source.sourceId == sourceId;
					})
				);
			}
		);
	}

	selectedTreeNodes = (keys: string[], item: AntTreeNodeSelectedEvent) => {
		// 永远是选中的逻辑
		if (item.selected) {
			this.setState(
				{
					selectedKeys: keys,
					selectedNode:
						// @ts-ignore 因为是选中，所以一定有
						item.selectedNodes[item.selectedNodes.length - 1].props.node
				},
				() => {
					this._selected();
				}
			);
		} else {
			this._selected();
		}
	};

	render() {
		let selectedKeys = this.props.selectedNodes.map((node: IFTreeNode) => {
			return String(node.id);
		});

		const loop = (nodelist: Array<IFTreeNode>) =>
			nodelist.map((item) => {
				const key = String(item.id);
				let titleName = item.name;
				let count = 0;
				if (item.value) {
					// @NOTE: 此时value当作count
					count = item.value;
				}
				const title = (
					<span
						className={`${ModuleStyle['tree-item-title']}`}
						title={titleName}
					>
						<span className={`${ModuleStyle['tree-item-title-item']}`}>
							{titleName}
						</span>
						<span
							style={!count ? { display: 'none' } : {}}
							className={`${ModuleStyle['tree-item-title-count']}`}
						>
							{formatCountTip(count)}
						</span>
					</span>
				);

				return (
					<TreeNode
						key={key}
						title={title}
						className={`${ModuleStyle['tree-item']}`}
						node={item}
					/>
				);
			});

		return (
			<div>
				<Tree
					selectedKeys={selectedKeys}
					onSelect={this.selectedTreeNodes}
					disabled={this.props.disabled}
				>
					{loop(this.props.nodeList)}
				</Tree>
			</div>
		);
	}
}

export default FlatTree;
