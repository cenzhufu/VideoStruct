import * as React from 'react';
import * as intl from 'react-intl-universal';
import UnitsModuleStyle from './assets/styles/index.module.scss';
import { Input, Tree, Button, Icon, message } from 'antd';
import AdvanceSettingIconComponent from 'stcomponents/setting-units-icons';
import { UserOrganizationItemType } from 'stsrc/type-define';
import { guid } from 'ifvendors/utils/guid';
import DeleteConfirmModal from '../delete-confirm-modal';
import STComponent from 'stcomponents/st-component';

const TreeNode = Tree.TreeNode;

type PropsTypes = {
	addTitle?: string;
	serarchPlaceholderText?: string;
	searchStr?: string;
	datalist: Array<UserOrganizationItemType>;
	addOperationHandle: (parentId: string, value: string) => void;
	editOperationHandle: (id: string, parentId: string, value: string) => void;
	deleteOperationHandle: (id: string) => void;
	searchOperationnHandle: (searchStr: string) => void;
	addAreaInfoPressEnter: (value: string) => void;
	clickInputBlur: (value: string) => void;
	refreshDataHandle: () => void;
};

interface StateTpye {
	searchStr: string;
	expandedKeys: string[];
	showModuleInput: boolean;
	datalist: Array<UserOrganizationItemType>;
	modalVisible: boolean;
	deleteId: string;
}

function noop() {}

class OriginalTreeStructure extends STComponent<PropsTypes, StateTpye> {
	static defaultPropType = {
		searchStr: '',
		datalist: [],
		addOperationHandle: noop,
		editOperationHandle: noop,
		deleteOperationHandle: noop,
		refreshDataHandle: noop
	};
	constructor(props: PropsTypes) {
		super(props);
		this.state = {
			searchStr: '',
			expandedKeys: [],
			showModuleInput: false,
			datalist: [],
			modalVisible: false,
			deleteId: ''
		};
	}

	onExpand = (expandedKeys: string[]) => {
		this.setState({
			expandedKeys
		});
	};

	/**
	 * 设置Tree Item的hover状态
	 * @returns {void}
	 * @param {UserOrganizationItemType} selectedItem 当前选择Item
	 * @param {Array<UserOrganizationItemType>} itemList 传入数据源
	 * @param {boolean} hover 状态标记
	 * @memberof OriginalTreeStructure
	 */
	resetCurrentHoverItemStatus(
		selectedItem: UserOrganizationItemType,
		itemList: Array<UserOrganizationItemType>,
		hover: boolean
	) {
		if (selectedItem.id) {
			for (let item of itemList) {
				// eslint-disable-next-line
				if (item.id === selectedItem.id) {
					item.hover = hover;
				} else {
					item.hover = false;
				}

				// 递归子数组
				let children: Array<UserOrganizationItemType> = item.children || [];
				if (children && children.length > 0) {
					this.resetCurrentHoverItemStatus(selectedItem, children, hover);
				}
			}
		}
	}

	//鼠标进入事件
	onMouseEnter = (item: UserOrganizationItemType, e: React.MouseEvent) => {
		const copy = [...this.props.datalist];
		this.resetCurrentHoverItemStatus(item, copy, true);
		this.setState({ datalist: copy });
	};

	//鼠标离开事件
	onMouseLeave = (item: UserOrganizationItemType, e: React.MouseEvent) => {
		const copy = [...this.props.datalist];
		this.resetCurrentHoverItemStatus(item, copy, false);
		this.setState({ datalist: copy });
	};

	refreshDataSource = () => {
		this.props.refreshDataHandle();
	};

	/**
	 * 添加数据源操作事件
	 * @param {UserOrganizationItemType} selectedItem 当前选中item
	 * @param {Array<UserOrganizationItemType>} data 数据源
	 * @param {boolean} showInput 新增输入框
	 * @returns {void}
	 * @memberof OriginalTreeStructure
	 */
	addDataSource(
		selectedItem: UserOrganizationItemType,
		data: Array<UserOrganizationItemType>,
		showInput: boolean
	) {
		if (selectedItem.id) {
			for (let item of data) {
				let insertNode: UserOrganizationItemType = {
					id: guid(),
					parentId: selectedItem.id,
					value: '',
					hover: true,
					showAddInput: true,
					showEditInput: false
				};
				if (selectedItem.id === item.id) {
					item.showAddInput = showInput;
					item.hover = false;
					if (item.children) {
						item.children.unshift(insertNode);
					} else {
						item.children = [insertNode];
					}

					// 添加展开expandedKey
					if (this.state.expandedKeys.indexOf(selectedItem.id) === -1) {
						this.setState((prevState: StateTpye) => {
							return {
								expandedKeys: [...prevState.expandedKeys, selectedItem.id]
							};
						});
					}
					return;
				} else {
					item.showAddInput = false;
				}
				let children: Array<UserOrganizationItemType> = item.children || [];
				if (children && children.length > 0) {
					this.addDataSource(selectedItem, children, showInput);
				}
			}
		}
	}

	/**
	 * 编辑数据源操作事件
	 * @param {UserOrganizationItemType} selectedItem 当前选中item
	 * @param {Array<UserOrganizationItemType>} data 数据源
	 * @param {boolean} showInput 当前编辑框
	 * @returns {void}
	 * @memberof OriginalTreeStructure
	 */
	editDataSource(
		selectedItem: UserOrganizationItemType,
		data: Array<UserOrganizationItemType>,
		showInput: boolean
	) {
		if (selectedItem.id) {
			for (let item of data) {
				if (item.id === selectedItem.id) {
					item.showEditInput = showInput;
					item.hover = false;
				} else {
					item.showEditInput = false;
				}

				let children: Array<UserOrganizationItemType> = item.children || [];
				if (children && children.length > 0) {
					this.editDataSource(selectedItem, children, showInput);
				}
			}
		}
	}

	//hover状态下 添加ICON点击事件
	addUnitItemClick = (selectedItem: UserOrganizationItemType): void => {
		const data = [...this.props.datalist];
		this.addDataSource(selectedItem, data, true);
		this.setState({
			datalist: data
		});
	};

	//hover状态下 编辑ICON点击事件
	editUnitItemHandleClick = (selectedItem: UserOrganizationItemType): void => {
		const data = [...this.props.datalist];
		this.editDataSource(selectedItem, data, true);
		this.setState({
			datalist: data
		});
	};

	//hover状态下 删除ICON点击事件
	deletedUnitItemHandleClick = (item: UserOrganizationItemType): void => {
		let self = this;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onCancel: function onCancel() {
				handle.destory();
			},
			onOk: function onOk() {
				handle.destory();
				setTimeout(() => {
					self.deleteModalConfirm();
				}, 100);
			},
			onChange: noop
		});
		this.setState({
			modalVisible: true,
			deleteId: item.id
		});
	};

	//添加ICON-->INPUT框Enter事件
	addOperationPressEnter = (
		item: UserOrganizationItemType,
		e: React.KeyboardEvent<HTMLInputElement>
	): void => {
		const value = e.currentTarget.value.trim();
		if (!value) {
			message.warning(intl.get('COMMON_RIGHT_STRING'.d('请输入正确字符')));
			return;
		}
		this.props.addOperationHandle(item.parentId, String(value));
	};

	//编辑ICON-->INPUT框Enter事件
	editOperationPressEnter = (
		item: UserOrganizationItemType,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		const value = e.currentTarget.value.trim();
		if (!value) {
			message.warning(intl.get('COMMON_RIGHT_STRING'.d('请输入正确字符')));
			return;
		}

		this.props.editOperationHandle(item.id, item.parentId, value);
	};

	//添加ICON-->INPUT框Blur事件
	addInputBlur = (
		selectedItem: UserOrganizationItemType,
		datalist: Array<UserOrganizationItemType>
	) => {
		if (selectedItem.id) {
			for (let item of datalist) {
				if (item.id === selectedItem.id) {
					//数组第一个元素出栈
					datalist.shift();
					item.hover = true;
					item.showAddInput = false;
					break;
				} else {
					let children: Array<UserOrganizationItemType> = item.children || [];
					if (children && children.length > 0) {
						this.addInputBlur(selectedItem, item.children || []);
					}
				}
			}
		}
		this.setState({
			datalist: datalist
		});
		this.props.refreshDataHandle();
	};

	//编辑ICON-->INPUT框Blur事件
	editInputBlur = (selectedItem: UserOrganizationItemType) => {
		const data = [...this.props.datalist];

		if (selectedItem.id) {
			for (let item of data) {
				item.showEditInput = false;
				let children: Array<UserOrganizationItemType> = item.children || [];
				if (children && children.length > 0) {
					this.editDataSource(selectedItem, children, false);
				}
			}
		}
		this.setState({
			datalist: data
		});
	};

	datalistInputBlur = (selectedItem: UserOrganizationItemType) => {
		const copy = [...this.props.datalist];
		this.addInputBlur(selectedItem, copy);
	};

	deleteModalCancel = () => {
		this.setState({ modalVisible: false });
	};

	deleteModalConfirm() {
		this.props.deleteOperationHandle(String(this.state.deleteId));
		this.setState({ modalVisible: false });
	}

	/**
	 * 搜索框置空时刷新数据源，充值expendedKeys
	 * @param {React.ChangeEvent<HTMLInputElement>} e input
	 * @returns {void}
	 * @memberof OriginalTreeStructure
	 */
	searchOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let searchStr = e.target.value;
		this.setState({ searchStr: searchStr });
		if (searchStr === '' || searchStr === null) {
			this.props.refreshDataHandle();
			this.setState({ expandedKeys: [] });
		}
	};

	addAreaButton = () => {
		this.setState({
			showModuleInput: true
		});
	};

	pressEnterHandle = (e: React.KeyboardEvent<HTMLInputElement>) => {
		let value = e.currentTarget.value.trim();
		if (this.areasNameCheck(value)) {
			this.props.addAreaInfoPressEnter(value);
			this.setState({ showModuleInput: false });
		}
	};

	blurAddInput = (e: React.FocusEvent<HTMLInputElement>) => {
		let value = e.target.value;
		if (this.areasNameCheck(value) && value !== '' && value !== null) {
			this.props.clickInputBlur(value);
			this.setState({
				showModuleInput: false
			});
		} else {
			this.setState({ showModuleInput: false });
		}
	};

	/**
	 * 搜索确认逻辑,NOTE:需要记录返回数据id作为字符数组，用来展开树形结构
	 * @param {React.KeyboardEvent<HTMLInputElement>} e input
	 * @returns {void}
	 * @memberof OriginalTreeStructure
	 */
	searchStrOnPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const searchStr: string = e.currentTarget.value;
		this.props.searchOperationnHandle(searchStr);
		setTimeout(() => {
			let stringIds: Array<string> = [];
			function datadataLoop(list: Array<UserOrganizationItemType>) {
				for (let item of list) {
					if (item.id) {
						stringIds.push(item.id);
					}
					if (item.children) {
						datadataLoop(item.children);
					}
				}
			}
			datadataLoop(this.props.datalist);
			stringIds = this.props.datalist.map((item) => item.id).concat(stringIds);

			this.setState((preState: StateTpye) => {
				return {
					expandedKeys: [...preState.expandedKeys].concat(stringIds as [])
				};
			});
		}, 500);
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

	render() {
		const { expandedKeys, searchStr, showModuleInput } = this.state;
		const dataLoop = (datalist: Array<UserOrganizationItemType>) =>
			datalist.map((item) => {
				// 搜索字符配置，
				const index = item.value.indexOf(String(searchStr));
				const beforeStr = item.value.substr(0, index);
				const afterStr = item.value.substr(index + String(searchStr).length);

				const title =
					index > -1 ? (
						<span>
							{beforeStr}
							<span
								style={
									{
										/*NOTE:此处在style可设置搜索字符相关样式*/
									}
								}
							>
								{searchStr}
							</span>
							{afterStr}
						</span>
					) : (
						<span>{item.value}</span>
					);

				const TitleElement = item.hover ? (
					<div
						onMouseEnter={
							!item.showAddInput && !item.showEditInput
								? this.onMouseEnter.bind(this, item)
								: undefined
						}
						onMouseLeave={
							!item.showAddInput && !item.showEditInput
								? this.onMouseLeave.bind(this, item)
								: undefined
						}
					>
						{item.showAddInput ? (
							<Input
								autoFocus={true}
								onBlur={this.datalistInputBlur.bind(this, item)}
								placeholder={
									item.value +
									intl
										.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
										.d('请输入不超过10位字符')
								}
								onPressEnter={this.addOperationPressEnter.bind(this, item)}
								style={{ width: 227, backgroundColor: '#f3f4f5' }}
								onMouseLeave={this.refreshDataSource}
							/>
						) : (
							<AdvanceSettingIconComponent
								showAddIcon={item.hasOwnProperty('children')}
								unitNameText={item.value}
								addUnitItemHandleClick={this.addUnitItemClick.bind(this, item)}
								editdUnitItemHandleClick={this.editUnitItemHandleClick.bind(
									this,
									item
								)}
								deletedUnitItemHandleClick={this.deletedUnitItemHandleClick.bind(
									this,
									item
								)}
							/>
						)}
					</div>
				) : (
					<div
						onMouseEnter={
							!item.showAddInput && !item.showEditInput
								? this.onMouseEnter.bind(this, item)
								: undefined
						}
						onMouseLeave={
							!item.showAddInput && !item.showEditInput
								? this.onMouseLeave.bind(this, item)
								: undefined
						}
					>
						{item.showEditInput ? (
							<Input
								className={UnitsModuleStyle['area-tool-input']}
								autoFocus={true}
								onBlur={this.editInputBlur.bind(this, item)}
								placeholder={intl
									.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
									.d('请输入不超过10位字符')}
								defaultValue={item.value ? item.value : ''}
								onPressEnter={this.editOperationPressEnter.bind(this, item)}
								style={{ width: 227, backgroundColor: '#f3f4f5' }}
							/>
						) : (
							<span style={{ width: 100, overflow: 'hidden' }}>{title}</span>
						)}
					</div>
				);

				if (item.children) {
					return (
						<TreeNode
							key={String(item.id)}
							title={TitleElement}
							selectable={false}
							style={{ width: 100 }}
						>
							{dataLoop(item.children)}
						</TreeNode>
					);
				}
				return (
					<TreeNode
						key={String(item.id)}
						title={TitleElement}
						selectable={false}
						style={{ width: 100 }}
					/>
				);
			});

		return (
			<div className={`${UnitsModuleStyle['units-management-all']}`}>
				<div className={`${UnitsModuleStyle['units-area-show']}`}>
					<div className={UnitsModuleStyle['area-tool-container']}>
						<Button type="primary" onClick={this.addAreaButton}>
							{this.props.addTitle}
						</Button>
						<Input
							className={UnitsModuleStyle['area-search']}
							placeholder={this.props.serarchPlaceholderText}
							prefix={<Icon type="search" theme={'outlined'} />}
							value={searchStr}
							onChange={this.searchOnchange}
							onPressEnter={this.searchStrOnPressEnter}
							style={{
								width: 520
							}}
						/>
					</div>
					<div>
						{showModuleInput && (
							<Input
								className={`${UnitsModuleStyle['area-input-frame']}`}
								autoFocus={true}
								placeholder={intl
									.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
									.d('请输入不超过10位字符')}
								onPressEnter={this.pressEnterHandle}
								style={{
									width: 227,
									backgroundColor: '#f3f4f5',
									marginLeft: 30
								}}
								onBlur={this.blurAddInput}
							/>
						)}
					</div>
					<Tree onExpand={this.onExpand} expandedKeys={expandedKeys}>
						{dataLoop(this.props.datalist)}
					</Tree>
				</div>
			</div>
		);
	}
}

export { OriginalTreeStructure };
