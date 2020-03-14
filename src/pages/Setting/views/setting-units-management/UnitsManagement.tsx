import * as React from 'react';
import * as intl from 'react-intl-universal';
import UnitsModuleStyle from './assets/styles/index.module.scss';
import { message, Icon, Input, Button } from 'antd';
import { OrganizationRequests } from 'stutils/requests/user-auth-requests';
import { IFOrganizationTree, IFUserInfo } from 'stsrc/type-define';
import TreeStructure from 'stsrc/components/tree-structure-component';
import STComponent from 'stcomponents/st-component';
import { withUserInfo } from 'stsrc/contexts';
import AddOrEditOrganizationDialog from './AddOrEditOrganization';

type PropsTypes = {
	userInfo: IFUserInfo;
};
interface StateTpye {
	searchStr: string;
	expandedKeys: string[];
	organizationTreeList: Array<IFOrganizationTree>;
	showModuleInput: boolean;
	modalVisible: boolean;
}

class UnitsManagement extends STComponent<PropsTypes, StateTpye> {
	constructor(props: PropsTypes) {
		super(props);
		this.state = {
			searchStr: '',
			expandedKeys: [],
			organizationTreeList: [],
			showModuleInput: false,
			modalVisible: false
		};
	}

	componentDidMount() {
		this.inquireOrganization();
	}

	//查询组织结构
	inquireOrganization = (): void => {
		OrganizationRequests.inquireOrganizationsByNode()
			.then((list: Array<IFOrganizationTree>) => {
				this.setState({
					organizationTreeList: list || []
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 根据组织名称查询其所在节点信息
	 * @param {string} orgName 组织名称
	 * @returns {void}
	 * @memberof UnitsManagement
	 */
	inquireOrganizationByNodeName = (orgName?: string) => {
		OrganizationRequests.inquireOrganizationsByNode(orgName)
			.then((orgList: Array<IFOrganizationTree>) => {
				this.setState({ organizationTreeList: orgList });
				if (orgList && orgList.length > 0) {
					console.log('组织列表：', orgList);
				} else {
					message.error(intl.get('empty-data').d('暂无数据'));
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 添加组织机构
	 * @param {string} parentId 父组织id
	 * @param {string} orgName 新增名称
	 * @param {string} description 描述
	 * @memberof UnitsManagement
	 * @returns {void}
	 */
	addOrganization = (
		parentId: string,
		orgName: string,
		description: string = ''
	) => {
		if (this.unitsNameCheck(orgName)) {
			OrganizationRequests.addOrganization(parentId, orgName, description)
				.then((res) => {
					message.success(intl.get('UNITS_ADD_SUCCESS').d('添加单位成功！'));
					this.setState({
						showModuleInput: false
					});
					this.inquireOrganization();
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		}
	};

	/**
	 * 修改组织结构
	 * @param {string} id 当前组织id
	 * @param {string} parentId 父组织id
	 * @param {string} orgName 修改名称
	 * @param {string} description 描述
	 * @memberof UnitsManagement
	 * @returns {void}
	 */
	editOrganization = (
		id: string,
		parentId: string,
		orgName: string,
		description: string
	) => {
		if (this.unitsNameCheck(orgName)) {
			OrganizationRequests.editOrganization(id, parentId, orgName, description)
				.then((res) => {
					message.success(
						intl.get('UNITS_EDIT_SUCCESS').d('修改组织机构成功！')
					);
					this.inquireOrganization();
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		}
	};

	/**
	 * 删除组织结构
	 * @param {string} id 组织id
	 * @memberof UnitsManagement
	 * @returns {void}
	 */
	deleteOrganization = (id: string) => {
		OrganizationRequests.deleteOrganization(id)
			.then((res) => {
				message.success(
					intl.get('UNITS_DELETE_SUCCESS').d('删除组织机构成功！')
				);
				this.inquireOrganization();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//输入字符串长度校验
	unitsNameCheck = (value: string) => {
		if (value && value.length > 10) {
			message.error(
				intl
					.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
					.d('请输入不超过10位字符')
			);
			return false;
		} else if (value === '' || value === null) {
			message.error(
				intl.get('UNITS_MANEMENT_EDIT_TITLE_NULL').d('请输入非空字符！')
			);
			return false;
		} else {
			return true;
		}
	};

	onClickEdit = (item: IFOrganizationTree) => {
		console.log(item);
		let handle = AddOrEditOrganizationDialog.show({
			title: intl.get('ddddddddddddd').d('编辑单位'),
			organizationTreeList: this.state.organizationTreeList,
			organizationInfo: item,
			onCancel: () => {
				handle.destory();
			},
			onOk: (
				name: string,
				id?: string,
				parentId?: string,
				description?: string
			) => {
				// 编辑单位
				// this.addAreaInfo(name, parentId || '0', description || '');
				this.editOrganization(
					id as string,
					parentId || '1',
					name,
					description || ''
				);
				handle.destory();
			}
		});
	};

	onClickDelete = (item: IFOrganizationTree) => {
		this.deleteOrganization(item.id);
	};

	renderPopover = (item: IFOrganizationTree) => {
		return (
			<div className={UnitsModuleStyle['popover-sheet']}>
				<div
					className={UnitsModuleStyle['popover-sheet-item']}
					onClick={() => {
						this.onClickEdit(item);
					}}
				>
					<Icon type="form" className={UnitsModuleStyle['icon']} />
					{intl.get('wwwwwwwwwwwwww').d('编辑')}
				</div>
				<div
					className={UnitsModuleStyle['popover-sheet-item']}
					onClick={() => {
						this.onClickDelete(item);
					}}
				>
					<Icon type="delete" className={UnitsModuleStyle['icon']} />
					{intl.get('wwwwwwwwwwwwww').d('删除')}
				</div>
			</div>
		);
	};

	onAddUnit = () => {
		let handle = AddOrEditOrganizationDialog.show({
			title: intl.get('ddddddddddddd').d('新增单位'),
			organizationTreeList: this.state.organizationTreeList,
			onCancel: () => {
				handle.destory();
			},
			onOk: (
				name: string,
				id?: string,
				parentId?: string,
				description?: string
			) => {
				// 创建组织
				this.addOrganization(parentId || '1', name, description || '');
				handle.destory();
			}
		});
	};

	onSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (this.unitsNameCheck(event.currentTarget.value)) {
			this.inquireOrganizationByNodeName(event.currentTarget.value);
		}

		this.setState({ searchStr: event.currentTarget.value });
	};

	render() {
		const { organizationTreeList } = this.state;
		return (
			<div className={`${UnitsModuleStyle['units-management-all']}`}>
				<Button type="primary" icon="plus-circle" onClick={this.onAddUnit}>
					{intl.get('ddddddddddddd').d('新增单位')}
				</Button>
				<Input
					className={UnitsModuleStyle['search-input']}
					prefix={<Icon type="search" />}
					onPressEnter={this.onSearch}
					placeholder={intl
						.get('2222222222222222333')
						.d('输入单位名称并回车搜索')}
				/>
				<div className={`${UnitsModuleStyle['units-area-show']}`}>
					<TreeStructure<IFOrganizationTree>
						treeList={organizationTreeList}
						renderPopover={this.renderPopover}
						refreshDataHandle={this.inquireOrganization}
					/>
				</div>
				<div />
			</div>
		);
	}
}

export default withUserInfo(UnitsManagement);
