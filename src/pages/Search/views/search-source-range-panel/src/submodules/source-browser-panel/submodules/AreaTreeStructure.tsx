import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import { Tree, Icon } from 'antd';
import {
	AntTreeNodeSelectedEvent,
	AntTreeNodeExpandedEvent
} from 'antd/lib/tree';
import STComponent from 'stcomponents/st-component';
import {
	IFAreaInfo,
	ESourceType,
	IFDeviceInfo,
	ETargetType,
	IFTreeNode,
	getDefaultIFTreeNode,
	IFStructuralLinkInfo,
	getStructuralLinkInfoSourceType,
	getStructuralLinkInfoSourceId
} from 'stsrc/type-define';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import DeviceInfoPanel from './DeviceInfoPanel';
import SearchRangeHoverTreeTitle from './SearchRangeHoverTreeTitle';
import { formatCountTip } from '../../../util';

const TreeNode = Tree.TreeNode;

type PropsTypes = {
	datalist: Array<IFAreaInfo>;
	sourceType: ESourceType;
	currentTargetType: ETargetType;
	disabled: boolean;
	onSelected: (
		selectedSourceItemList: Array<IFUniqueDataSource>,
		node: IFTreeNode,
		filter: (item: IFStructuralLinkInfo) => boolean
	) => void; //叶子节点
	currentSourceType: ESourceType;
	onViewVideo: (deviceId: string) => void;
	isSearchMode: boolean;

	selectedNodes: IFTreeNode[];
};

interface StateTpye {
	selectedKeys: string[];
	controlTreeIcon: boolean;
}

function noop() {}

class AreaTreeStructItem extends STComponent<PropsTypes, StateTpye> {
	static defaultProps = {
		datalist: [],
		disabled: false,
		currentSourceType: ESourceType.All,
		onViewVideo: noop,
		isSearchMode: false,
		currentTargetType: ETargetType.Unknown
	};
	TreeIcon = <Icon type="plus-square" />;
	constructor(props: PropsTypes) {
		super(props);
		this.state = {
			selectedNodes: [],
			controlTreeIcon: true
			// areaLeafNodeInfo: { sourceId: '', sourceType: '' }
		};
	}

	onExpand = (expandedKeys: string[], evne: AntTreeNodeExpandedEvent) => {
		if (evne.expanded) {
			this.setState({
				controlTreeIcon: false
			});
		} else {
			this.setState({
				controlTreeIcon: true
			});
		}
	};

	_selected(itemInfo: AntTreeNodeSelectedEvent) {
		// 如果是area节点,则有areaInfo信息
		// 如果是device节点，则有deviceInfo信息
		let areaNodeInfo: IFAreaInfo | null = itemInfo.node.props.areaInfo;
		let deviceNodeInfo: IFDeviceInfo | null = itemInfo.node.props.deviceInfo;

		if (areaNodeInfo) {
			// 选择了区域
			let sourceInfos: Array<
				IFUniqueDataSource
			> = this.getAllDeviceSourceInfosInArea(areaNodeInfo);
			this.props.onSelected(
				sourceInfos,
				areaNodeInfo,
				(item: IFStructuralLinkInfo) => {
					let type: ESourceType = getStructuralLinkInfoSourceType(item);
					let sourceId: string = getStructuralLinkInfoSourceId(item);
					return (
						type === this.props.currentSourceType &&
						sourceInfos.some((source: IFUniqueDataSource) => {
							// eslint-disable-next-line
							return source.sourceId == sourceId;
						})
					);
				}
			);
		} else if (deviceNodeInfo) {
			// 选择了设备
			let soources: Array<IFUniqueDataSource> = [
				{
					sourceId: deviceNodeInfo.id,
					sourceType: this.props.sourceType
				}
			];

			// 将deviceInfo转换成IFTreeNode
			let treeNode: IFTreeNode = {
				...getDefaultIFTreeNode<any>(0),
				parent: deviceNodeInfo.parent,
				parentId: deviceNodeInfo.areaId,
				name: deviceNodeInfo.name,
				id: deviceNodeInfo.id,
				uuid: deviceNodeInfo.uuid
			};

			this.props.onSelected(
				soources,
				treeNode,
				(item: IFStructuralLinkInfo) => {
					let type: ESourceType = getStructuralLinkInfoSourceType(item);
					let sourceId: string = getStructuralLinkInfoSourceId(item);
					return (
						type === this.props.currentSourceType &&
						soources.some((source: IFUniqueDataSource) => {
							// eslint-disable-next-line
							return source.sourceId == sourceId;
						})
					);
				}
			);
		}
	}

	/**
	 * 區域和節點點擊事件
	 * @param {string[]} keys 選中節點
	 * @param {AntTreeNodeSelectedEvent} itemInfo 節點信息
	 * @returns {void}
	 * @memberof AreaTreeStructItem
	 */
	selectedTreeNodes = (keys: string[], itemInfo: AntTreeNodeSelectedEvent) => {
		if (this.props.disabled) {
			return;
		}

		if (itemInfo.selected) {
			this.setState(
				{
					selectedKeys: keys
				},
				() => {
					this._selected(itemInfo);
				}
			);
		} else {
			this._selected(itemInfo);
		}
	};

	getAllDeviceSourceInfosInArea(area: IFAreaInfo): Array<IFUniqueDataSource> {
		let deviceList: Array<IFDeviceInfo> = ValidateTool.getValidArray(
			(area && area.cameraList) || []
		);

		let results: Array<IFUniqueDataSource> = [];
		results.push(
			...deviceList.map((value: IFDeviceInfo) => {
				return {
					sourceId: value.id,
					sourceType: ESourceType.Camera
				};
			})
		);

		let childern: IFAreaInfo[] = ValidateTool.getValidArray(
			(area && area.children) || []
		);
		for (let childArea of childern) {
			results.push(...this.getAllDeviceSourceInfosInArea(childArea));
		}

		return results;
	}

	onClickInfo = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
	};

	onVisibleChange = (visible: boolean) => {
		console.log('onVisibleChange', visible);
	};

	onViewVideo = (deviceId: string) => {
		this.props.onViewVideo(deviceId);
	};

	_renderCameraList = (
		cameraList: IFDeviceInfo[],
		areaInfo: IFAreaInfo
	): React.ReactNode => {
		if (!cameraList) {
			return null;
		} else {
			//@ts-ignore
			return cameraList.map((deviceItem) => {
				let titleName = deviceItem.name;
				const title = (
					<SearchRangeHoverTreeTitle
						key={deviceItem.id}
						count={deviceItem.count || 0}
						content={
							<DeviceInfoPanel
								targetTypes={[
									ETargetType.Face,
									ETargetType.Body,
									ETargetType.Vehicle
								]}
								deviceId={deviceItem.id}
								deviceName={deviceItem.name}
								areaName={areaInfo.name}
								onViewVideo={this.onViewVideo}
							/>
						}
						title={titleName}
						showInfoIconOnHover={true}
						showCountEvenIfZero={false}
					/>
				);

				return (
					<TreeNode
						key={deviceItem.uuid}
						title={title}
						deviceInfo={deviceItem}
						isLeaf={true}
					/>
				);
			});
		}
	};

	loop = (datalist: IFAreaInfo[]) =>
		//@ts-ignore
		datalist.map((item) => {
			let titleName = item.name;

			const title = (
				<span className={`${ModuleStyle['tree-item-title']}`} title={titleName}>
					<span className={`${ModuleStyle['tree-item-title-item']}`}>
						{titleName}
					</span>
					{item.count ? (
						<span className={`${ModuleStyle['tree-item-title-count']}`}>
							{`(${formatCountTip(item.count)})`}
						</span>
					) : null}
				</span>
			);

			if (item.children) {
				return (
					<TreeNode
						icon={null}
						key={item.uuid}
						title={title}
						className={`${ModuleStyle['tree-item']}`}
						areaInfo={item}
					>
						{this._renderCameraList(
							ValidateTool.getValidArray(item.cameraList),
							item
						)}
						{this.loop(item.children)}
					</TreeNode>
				);
			} else {
				return (
					<TreeNode
						key={item.uuid}
						title={title}
						className={`${ModuleStyle['tree-item']}`}
						areaInfo={item}
					>
						{this._renderCameraList(
							ValidateTool.getValidArray(item.cameraList),
							item
						)}
					</TreeNode>
				);
			}
		});

	render() {
		let selectedKeys = this.props.selectedNodes.map((node: IFTreeNode) => {
			return node.uuid;
		});

		return (
			<div className={ModuleStyle['hide-file-icon']}>
				<Tree
					onExpand={this.onExpand}
					showLine={true}
					selectedKeys={selectedKeys}
					onSelect={this.selectedTreeNodes}
				>
					{this.loop(this.props.datalist)}
				</Tree>
			</div>
		);
	}
}

export default AreaTreeStructItem;
