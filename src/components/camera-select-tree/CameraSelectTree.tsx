import * as React from 'react';
import { Checkbox, Tree } from 'antd';
import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/styles/index.module.scss';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import {
	AntTreeNodeSelectedEvent,
	AntTreeNodeCheckedEvent
} from 'antd/lib/tree';
import { IFAreaInfo, IFDeviceInfo } from 'sttypedefine';
import STComponent from 'stcomponents/st-component';

const TreeNode = Tree.TreeNode;

type PropsType = {
	data: Array<IFAreaInfo>; //数据列表
	checkedCameraList: Array<IFDeviceInfo>; //已选择的摄像头列表
	style: object; //函内样式
	className: string;
	onChange: (
		//回调返回选择的区域key和摄像头列表
		checkedCameraListWorkCopy: Array<IFDeviceInfo>
	) => void; //回掉函数 返回选择的checkedList
	cameraMaximum: number | null; //允许摄像头最大选择数量
	showCheckBoxAll: boolean; //是否显示全选按钮
};

type StateType = {
	currentSelectedTreeItem?: IFAreaInfo; // 当前选择的区域对象
	checkedCameraListWorkCopy: Array<IFDeviceInfo>; // 选择的所有的摄像头列表

	indeterminate: boolean; // 左边区域全选的状态， true表示部分选择
	firstIn: boolean;
};

// 选择的状态
enum SelectedType {
	All, // 全选
	None, // 全不选
	Partial // 部分选择
}

function none() {}
class CameraSelectTree extends STComponent<PropsType, StateType> {
	static defaultProps = {
		className: '',
		onChange: none,
		data: [],
		checkedCameraList: [],
		style: {},
		cameraMaximum: null,
		showCheckBoxAll: false
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			checkedCameraListWorkCopy: [...this.props.checkedCameraList],
			firstIn: true,
			indeterminate: props.checkedCameraList.length > 0
		};
	}

	/**
	 * 回调函数给调用者
	 * @memberof SourceItemView
	 * @returns {void}
	 */
	onChange = () => {
		const { checkedCameraListWorkCopy } = this.state;
		this.props.onChange(checkedCameraListWorkCopy);
	};

	/**
	 * 全选区域
	 * @param {CheckboxChangeEvent} e 事件
	 * @returns {void}
	 * @memberof SourceItemView
	 */
	onchangeCheckAllArea = (e: CheckboxChangeEvent) => {
		if (e.target.checked) {
			if (this.state.firstIn) {
				this.setState({
					firstIn: false
				});
				return;
			}
			const { cameraMaximum } = this.props;
			let allCameraList = [];
			let indeterminate = false;
			for (let treeItem of this.props.data) {
				allCameraList.push(...this._getAllCameraList(treeItem));

				if (cameraMaximum && cameraMaximum <= allCameraList.length) {
					const cameras = [];
					for (let index = 0; index < cameraMaximum; index++) {
						const camera = allCameraList[index];
						cameras.push(camera);
					}
					allCameraList = [...cameras];

					indeterminate = true;
					break;
				}
			}

			this.setState(
				{
					indeterminate,
					checkedCameraListWorkCopy: allCameraList
				},
				() => {
					this.onChange();
				}
			);
		} else {
			// TODO: 删除
			this.setState(
				{
					checkedCameraListWorkCopy: [],
					indeterminate: false
				},
				() => {
					this.onChange();
				}
			);
		}
	};

	//全选获取所有的key
	_getAllKeys = (data: IFAreaInfo): Array<string> => {
		let keyList: Array<string> = data.id ? [data.id] : [];
		if (!data.children) {
			return keyList;
		}

		let children = data.children;
		for (let childItem of children) {
			let childKeyList: Array<string> = this._getAllKeys(childItem);
			keyList.push(...childKeyList);
		}

		return keyList;
	};

	/**
	 * 点击摄像头某个选项
	 * @memberof SourceItemView
	 */

	onChangeCheckCamera = (item: IFDeviceInfo, e: CheckboxChangeEvent) => {
		// 增加
		if (e.target.checked) {
			const { checkedCameraListWorkCopy } = this.state;
			const { cameraMaximum } = this.props;
			if (cameraMaximum && cameraMaximum <= checkedCameraListWorkCopy.length) {
				return;
			}

			this.setState(
				(prevState: StateType, props: PropsType) => {
					return {
						checkedCameraListWorkCopy: [
							...prevState.checkedCameraListWorkCopy,
							item
						]
					};
				},
				() => {
					this.onChange();
				}
			);
		} else {
			// 删除
			this.setState(
				(prevState: StateType, props: PropsType) => {
					let existList = [...prevState.checkedCameraListWorkCopy];
					for (let i = 0; i < existList.length; i++) {
						if (existList[i].id && existList[i].id === item.id) {
							existList.splice(i, 1);
							break;
						}
					}
					return {
						checkedCameraListWorkCopy: existList
					};
				},
				() => {
					this.onChange();
				}
			);
		}
	};

	/**
	 * 全选摄像头
	 * @param {CheckboxChangeEvent} e 事件
	 * @returns {void}
	 * @memberof SourceItemView
	 */
	onchangeCheckAllCamera = (e: CheckboxChangeEvent): void => {
		if (e.target.checked) {
			// 把当前显示的摄像头全部加入到选择列表
			const { cameraMaximum } = this.props;
			let currentCameraList: Array<IFDeviceInfo> = this._getAllCameraList(
				this.state.currentSelectedTreeItem
			);

			this.setState(
				(prevState: StateType, props: PropsType) => {
					let existList: Array<IFDeviceInfo> =
						prevState.checkedCameraListWorkCopy;

					for (let item of currentCameraList) {
						if (!this._isSelected(item)) {
							existList.push(item);

							if (cameraMaximum && cameraMaximum <= existList.length) {
								const cameras = [];
								for (let index = 0; index < cameraMaximum; index++) {
									const camera = existList[index];
									cameras.push(camera);
								}
								existList = [...cameras];
								break;
							}
						}
					}

					return {
						checkedCameraListWorkCopy: existList
					};
				},
				() => {
					this.onChange();
				}
			);
		} else {
			// 删除
			let currentCameraList: Array<IFDeviceInfo> = this._getAllCameraList(
				this.state.currentSelectedTreeItem
			);

			this.setState(
				(prevState: StateType, props: PropsType) => {
					let existList: Array<IFDeviceInfo> =
						prevState.checkedCameraListWorkCopy;

					for (let item of currentCameraList) {
						let index = this._findCameraItemIndex(item, existList);
						if (-1 !== index) {
							existList.splice(index, 1);
						}
					}

					return {
						checkedCameraListWorkCopy: existList
					};
				},
				() => {
					this.onChange();
				}
			);
		}
	};

	/********************************tree*****************/

	//点击区域树复选框
	onCheckArea = (checkedKeys: Array<string>, info: AntTreeNodeCheckedEvent) => {
		// dataRef是我们自己定义的属性
		let treeItem: IFAreaInfo = info.node.props.dataRef as IFAreaInfo;

		let allCameraListInArea: Array<IFDeviceInfo> = this._getAllCameraList(
			treeItem
		);
		// alert(info.checked);
		const { cameraMaximum } = this.props;
		if (info.checked) {
			if (
				//判断摄像头是否达到上限
				cameraMaximum &&
				cameraMaximum <= this.state.checkedCameraListWorkCopy.length
			) {
				this.setState(
					(prevState: StateType, props: PropsType) => {
						let selectedCameraList: Array<IFDeviceInfo> = [
							...prevState.checkedCameraListWorkCopy
						];
						// 添加
						for (let cameraItem of allCameraListInArea) {
							// 找出索引
							let index = this._findCameraItemIndex(
								cameraItem,
								selectedCameraList
							);
							if (index !== -1) {
								selectedCameraList.splice(index, 1);
							}
						}

						return {
							checkedCameraListWorkCopy: selectedCameraList,
							indeterminate: true
						};
					},
					() => {
						this.onChange();
					}
				);
				return;
			}

			this.setState(
				(prevState: StateType, props: PropsType) => {
					let selectedCameraList: Array<IFDeviceInfo> = [
						...prevState.checkedCameraListWorkCopy
					];
					// 添加
					for (let cameraItem of allCameraListInArea) {
						if (!this._isSelected(cameraItem, selectedCameraList)) {
							selectedCameraList.push(cameraItem);
						}

						if (cameraMaximum && cameraMaximum <= selectedCameraList.length) {
							const cameras = [];
							for (let index = 0; index < cameraMaximum; index++) {
								const camera = selectedCameraList[index];
								cameras.push(camera);
							}
							selectedCameraList = [...cameras];
							break;
						}
					}

					return {
						checkedCameraListWorkCopy: selectedCameraList
					};
				},
				() => {
					this.onChange();
				}
			);
		} else {
			// 删除
			this.setState(
				(prevState: StateType, props: PropsType) => {
					let selectedCameraList: Array<IFDeviceInfo> = [
						...prevState.checkedCameraListWorkCopy
					];
					// 添加
					for (let cameraItem of allCameraListInArea) {
						// 找出索引
						let index = this._findCameraItemIndex(
							cameraItem,
							selectedCameraList
						);
						if (index !== -1) {
							selectedCameraList.splice(index, 1);
						}
					}

					return {
						checkedCameraListWorkCopy: selectedCameraList,
						indeterminate: false
					};
				},
				() => {
					this.onChange();
				}
			);
		}
	};

	/**
	 * 点击树节点
	 * @param {Array<string>} selectedKeys Array
	 * @param {AntTreeNodeSelectedEvent} info 节点信息
	 * @returns {void}
	 */
	onSelect = (selectedKeys: Array<string>, info: AntTreeNodeSelectedEvent) => {
		// 记录当前选择的区域节点
		this.setState({
			currentSelectedTreeItem: info.node.props.dataRef as IFAreaInfo
		});
	};

	/**
	 * 获得cameraItem下的所有摄像头列表
	 * @param {IFAreaInfo} item IFAreaInfo
	 * @returns {Array<IFDeviceInfo>} 摄像头列表
	 * @memberof SourceItemView
	 */
	_getAllCameraList(item?: IFAreaInfo): Array<IFDeviceInfo> {
		if (!item) {
			return [];
		} else {
			let cameraList = item.cameraList ? [...item.cameraList] : [];
			if (!item.children) {
				return cameraList;
			}

			let children = item.children;
			for (let childItem of children) {
				let childCameraList: Array<IFDeviceInfo> = this._getAllCameraList(
					childItem
				);
				cameraList.push(...childCameraList);
			}

			return cameraList;
		}
	}

	//判断是否选择
	_isSelected = (
		item: IFDeviceInfo,
		itemList: Array<IFDeviceInfo> = this.state.checkedCameraListWorkCopy
	) => {
		for (let camera of itemList) {
			if (item.id && item.id === camera.id) {
				return true;
			}
		}
		return false;
	};

	/**
	 * 找出索引
	 * @param {IFDeviceInfo} item 数组元素
	 * @param {Array<IFDeviceInfo>} itemList 数组
	 * @memberof CameraSelectTree
	 * @returns {number} item的索引值
	 */
	_findCameraItemIndex = (
		item: IFDeviceInfo,
		itemList: Array<IFDeviceInfo> = this.state.checkedCameraListWorkCopy
	): number => {
		for (let i = 0; i < itemList.length; i++) {
			let camera = itemList[i];
			if (item.id && item.id === camera.id) {
				return i;
			}
		}
		return -1;
	};

	_isAllAreaCameraSelected = () => {
		for (let areaItem of this.props.data) {
			let result = this._isCheckedAllCamera(areaItem);
			if (result !== SelectedType.All) {
				return false;
			}
		}

		return true;
	};

	_isCheckedAllCamera = (areaItem?: IFAreaInfo): SelectedType => {
		if (!areaItem) {
			return SelectedType.None;
		}

		let showCameraList: Array<IFDeviceInfo> = this._getAllCameraList(areaItem);
		if (!showCameraList.length) {
			// 为空
			return SelectedType.All;
		} else {
			let hasSelectedItem = false; // 是否有选择的
			let hasUnselectedItem = false; // 是否有未选择的
			for (let cameraItem of showCameraList) {
				if (!this._isSelected(cameraItem)) {
					hasUnselectedItem = true;
					if (hasSelectedItem) {
						return SelectedType.Partial;
					}
				} else {
					// do nothing
					hasSelectedItem = true;
					if (hasUnselectedItem) {
						return SelectedType.Partial;
					}
				}
			}

			if (!hasSelectedItem) {
				// 没有选择的item
				return SelectedType.None;
			}

			if (!hasUnselectedItem) {
				// 没有未选择的
				return SelectedType.All;
			}

			return SelectedType.None;
		}
	};

	/**
	 * 获得某个AreaTreeItemType的所有的叶子结点
	 * @param {?IFAreaInfo} areaItem 节点
	 * @returns {Array<IFAreaInfo>} 叶子节点集合
	 * @memberof CameraSelectTree
	 */
	_getAllLeafItem = (areaItem?: IFAreaInfo) => {
		let result: Array<IFAreaInfo> = [];

		if (!areaItem) {
			return result;
		} else {
			// 叶子节点
			if (!areaItem.children || areaItem.children.length === 0) {
				result.push(areaItem);
			} else {
				// 遍历子节点
				for (let childItem of areaItem.children) {
					result.push(...this._getAllLeafItem(childItem));
				}
			}
		}
		return result;
	};

	/**
	 * 获得tree选择的key
	 * @memberof CameraSelectTree
	 * @returns {Array<string>} 选择的Key列表
	 */
	_getCheckedKey = (): Array<string> => {
		let result: Array<string> = [];
		for (let treeItem of this.props.data) {
			// 找到所有的叶子节点
			let leafTreeItemList: Array<IFAreaInfo> = this._getAllLeafItem(treeItem);

			// 遍历叶子节点
			for (let leafTreeItem of leafTreeItemList) {
				let key = leafTreeItem.id;
				let cameraList: Array<IFDeviceInfo> = this._getAllCameraList(
					leafTreeItem
				);
				// 判断叶子节点下的所有摄像头是否已经选择
				for (let cameraItem of cameraList) {
					if (
						this._isSelected(cameraItem, this.state.checkedCameraListWorkCopy)
					) {
						result.push(key);
						break;
					}
				}
			}
		}

		return result;
	};

	renderTreeNodes = (data: Array<IFAreaInfo>) => {
		return data.map((item: IFAreaInfo) => {
			// 判断是否有摄像头
			let cameraList = this._getAllCameraList(item);
			let disabled = cameraList.length === 0;
			if (item.children) {
				return (
					<TreeNode
						title={item.title}
						key={item.id}
						dataRef={item}
						disabled={disabled}
					>
						{this.renderTreeNodes(item.children)}
					</TreeNode>
				);
			}
			return (
				<TreeNode {...item} key={item.id} dataRef={item} disabled={disabled} />
			);
		});
	};

	render() {
		const { indeterminate } = this.state;

		let currentCameraList = this._getAllCameraList(
			this.state.currentSelectedTreeItem
		);

		// 计算当前显示的摄像头是否全选
		let checkAllCamera: SelectedType = this._isCheckedAllCamera(
			this.state.currentSelectedTreeItem
		);

		// let checkAll = this._isAllAreaCameraSelected();

		// 计算当前选择的tree node
		let checkedKeys = this._getCheckedKey();
		// console.log('checkedKeys', checkedKeys);

		return (
			<div
				className={`${ModuleStyle['camera-tree-wrap']} ${this.props.className}`}
				style={this.props.style}
			>
				<div className={`${ModuleStyle['camera-tree-content']}`}>
					<div className={`${ModuleStyle['camera-tree-left']}`}>
						<Tree
							checkable
							// onExpand={this.onExpand}
							// expandedKeys={this.state.expandedKeys}
							// autoExpandParent={this.state.autoExpandParent}
							onCheck={this.onCheckArea}
							checkedKeys={checkedKeys}
							onSelect={this.onSelect}
							// selectedKeys={this.state.selectedKeys}
						>
							{this.renderTreeNodes(this.props.data)}
						</Tree>
					</div>
					<div className={`${ModuleStyle['camera-tree-right']}`}>
						<ul>
							{currentCameraList.map((item, index) => {
								return (
									<li
										key={item.id}
										title={item.name}
										className={`${ModuleStyle['list-li']}`}
									>
										<div>
											<Checkbox
												checked={this._isSelected(item)}
												onChange={this.onChangeCheckCamera.bind(this, item)}
											/>
											<span>{item.name}</span>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
				<div className={`${ModuleStyle['camera-tree-footer']}`}>
					<div className={`${ModuleStyle['camera-checkbox-group']}`}>
						{this.props.showCheckBoxAll && (
							<Checkbox
								className={`${ModuleStyle['camera-checkbox']}`}
								onChange={this.onchangeCheckAllArea}
								indeterminate={indeterminate}
								// checked={indeterminate ? false : true}
							>
								{intl.get('SELECT_ALL').d('全选')}
							</Checkbox>
						)}
					</div>

					<div className={`${ModuleStyle['camera-checkbox-group']}`}>
						<Checkbox
							className={`${ModuleStyle['camera-checkbox']}`}
							onChange={this.onchangeCheckAllCamera}
							indeterminate={checkAllCamera === SelectedType.Partial}
							checked={checkAllCamera === SelectedType.All}
						>
							{intl.get('SELECT_ALL').d('全选')}
						</Checkbox>
					</div>
				</div>
			</div>
		);
	}
}

export default CameraSelectTree;
