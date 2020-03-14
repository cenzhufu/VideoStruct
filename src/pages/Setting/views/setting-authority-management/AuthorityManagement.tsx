import * as React from 'react';
import { Button, Table, message, Pagination, Empty } from 'antd';
import * as intl from 'react-intl-universal';
import { RoleRequest } from 'stsrc/utils/requests/user-auth-requests/role';
import { IRoleInfo } from 'stsrc/utils/requests/user-auth-requests/role/role-type';
import ModuleStyle from './assets/index.module.scss';
import { withUserInfo } from 'stcontexts';
import { ListType } from 'stsrc/type-define';
import { ColumnProps } from 'antd/lib/table';
import {
	IBModuleTreeNode,
	EModuleGroupType
} from 'stsrc/utils/requests/user-auth-requests/module/module-type';
import AuthorityEditModalContainer, {
	Mode
} from './submodules/authority-edit-modal-container';
import DeleteConfirmModal from 'stsrc/components/delete-confirm-modal';
import STComponent from 'stcomponents/st-component';
import { IBUserInfo } from 'stsrc/utils/requests/user-auth-requests';
interface PropsType {
	// withUserInfo提供的数据
	userInfo: IBUserInfo;
}

interface CascaderType {
	label: string;
	value: string;
	children?: Array<CascaderType>;
}
interface StateType {
	authorityModalVisible: boolean;
	authorityModalTitle: string;
	organizationRoles: Array<IRoleInfo>; // 当前机构下的权限列表
	total: number;
	page: number;
	pageSize: number;

	authorityControlType: string;
	authorityRoleName: string;
	cacsaderOptions: Array<CascaderType>;
	orgId: string;
}
function noop() {}
class AuthorityManagement extends STComponent<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			authorityModalVisible: false,
			authorityModalTitle: intl
				.get('AUTHORITY_MANAGEMENT_ADDBTN')
				.d('新增权限'),
			organizationRoles: [],
			authorityControlType: 'add',
			authorityRoleName: '',
			cacsaderOptions: [],
			orgId: '',
			total: 0,
			page: 1,
			pageSize: 10
		};
	}
	componentDidMount() {
		console.log('登录账号信息', this.props.userInfo);
		//记录登陆账号组织id
		// this.setState({
		// 	orgId: this.props.userInfo.orgId
		// });
		//查询组织机构下面的角色
		this.getOrginationRoleList();
	}

	getOrginationRoleList = () => {
		//查询组织机构下面的角色
		RoleRequest.getRolesInOrg(
			(this.props.userInfo && this.props.userInfo.orgId) || ''
		)
			.then((list: ListType<IRoleInfo>) => {
				this.setState({
					organizationRoles: list.list,
					total: list.total
				});
			})
			.catch((err) => {
				console.log('err', err);
				message.error(err.message);
			});
	};

	addAuthorityRole = () => {
		let handle = AuthorityEditModalContainer.show({
			mode: Mode.Add,
			title: intl.get('AUTHORITY_MANAGEMENT_ADDBTN').d('新增权限'),
			organization: this.props.userInfo.organization,
			needCheckAuthorityName: true,
			onCancel: () => {
				handle.destory();
			},
			onOk: (name: string, orginatinId: string, moduleIds: Array<string>) => {
				handle.destory();

				let modules: Array<{ moduleId: string }> = moduleIds.map(
					(id: string) => {
						return {
							moduleId: id
						};
					}
				);
				if (name.length > 10) {
					message.error(
						intl.get('CANNOT_EXCEED_TEN_CHARACTERS').d('不能超过10个字符')
					);
					return;
				}
				RoleRequest.addRoleAndModules(name, modules, this.props.userInfo.orgId)
					.then(() => {
						// 刷新页面
						message.success(
							intl.get('AUTHORITY_ADD_USER_SUCCESS').d('新增权限成功')
						);
						this.getOrginationRoleList();
					})
					.catch((error: Error) => {
						console.error(error);
						message.error(error.message);
					});
			}
		});
	};

	checkRecord = (record: IRoleInfo, resourceCode: EModuleGroupType) => {
		//匹配展示对应项
		if (record.moduleNames) {
			let items = record.moduleNames;
			for (let i = 0; i < items.length; i++) {
				if (
					items[i].resourceCode === resourceCode &&
					items[i].childList &&
					items[i].childList.length > 0
				) {
					return this.createTableTd(items[i]);
				}
			}
		}
		return <span>-</span>;
	};

	createTableTd = (option: IBModuleTreeNode) => {
		//生成权限展示信息
		return (
			<div>
				{option.childList.map((item, index) => {
					if (index < option.childList.length - 1) {
						return <span key={item.id}>{item.name + ' | '}</span>;
					}
					return <span key={item.id}>{item.name}</span>;
				})}
			</div>
		);
	};

	modifyAuthority = (record: IRoleInfo) => {
		let handle = AuthorityEditModalContainer.show({
			mode: Mode.Edit,
			title: intl.get('AUTHORITY_MANAGEMENT_EDITMODALTITLE').d('修改权限'),
			roleInfo: record,
			orginationId: record.orgId,
			organization: this.props.userInfo.organization,
			needCheckAuthorityName: false,
			onCancel: () => {
				handle.destory();
			},
			onOk: (name: string, orginatinId: string, moduleIds: Array<string>) => {
				handle.destory();

				let modules: Array<{ moduleId: string }> = moduleIds.map(
					(id: string) => {
						return {
							moduleId: id
						};
					}
				);
				if (name.length > 10) {
					message.error(
						intl.get('CANNOT_EXCEED_TEN_CHARACTERS').d('不能超过10个字符')
					);
					return;
				}
				RoleRequest.editRoleAndModules(name, modules, orginatinId)
					.then(() => {
						// 刷新页面
						message.success(
							intl.get('AUTHORITY_EDIT_USER_SUCCESS').d('编辑权限成功')
						);
						this.getOrginationRoleList();
					})
					.catch((error: Error) => {
						console.error(error);
						message.error(error.message);
					});
			}
		});
	};
	//使用统一删除提示框
	deleteAuthorityConfirm = (record: IRoleInfo) => {
		let self = this;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onOk: function onOk() {
				handle.destory();
				self.deleteAuthority(record);
			},
			onCancel: function onCancel() {
				handle.destory();
			},
			onChange: noop
		});
	};

	deleteAuthority = (record: IRoleInfo) => {
		RoleRequest.deleteRole(record.id)
			.then((res) => {
				// TODO: （可以优化）查询组织机构下面的角色
				this.getOrginationRoleList();
				message.success(
					intl.get('AUTHORITY_DELETE_USER_SUCCESS').d('删除权限成功')
				);
			})
			.catch((err) => {
				console.log('err', err);
				message.error(err.message);
			});
	};

	onChangePagination = (page: number, pageSize: number) => {
		this.setState({
			page: page
		});
	};

	render() {
		let filterList = this.state.organizationRoles.filter(
			(item: IRoleInfo, index: number) => {
				let min = (this.state.page - 1) * this.state.pageSize;
				let max = this.state.page * this.state.pageSize;
				if (index >= min && index <= max) {
					return true;
				} else {
					return false;
				}
			}
		);
		const columns: Array<ColumnProps<IRoleInfo>> = [
			{
				title: intl.get('AUTHORITY_MANAGEMENT_MODALTIP_NAME').d('权限名称'),
				width: '15%',
				dataIndex: 'name'
			},
			{
				title: intl.get('DATA_ANALYSIS').d('数据查看'),
				width: '15%',
				render: (text: string, record: IRoleInfo) =>
					this.checkRecord(record, EModuleGroupType.DataView)
			},
			{
				title: intl.get('DATA_SEARCH').d('目标搜索'),
				width: '15%',
				render: (text: string, record: IRoleInfo) =>
					this.checkRecord(record, EModuleGroupType.TargetSearch)
			},
			// {
			// 	title: intl.get('REALTIME_MONITOR').d('实时告警'),
			// 	width: '15%',
			// 	render: (text: string, record: IRoleInfo) =>
			// 		this.checkRecord(record, EModuleGroupType.RealTimeAlarm)
			// },
			{
				title: intl.get('ADVANCE_SETTING').d('高级设置'),
				width: '20%',
				render: (text: string, record: IRoleInfo) =>
					this.checkRecord(record, EModuleGroupType.AdvancedSetting)
			},
			{
				title: intl.get('OPERATION').d('操作'),
				width: '20%',
				align: 'center',
				render: (text: string, record: IRoleInfo) => (
					<div>
						<Button
							type="primary"
							style={{ marginRight: 10 }}
							onClick={() => this.modifyAuthority(record)}
						>
							{intl.get('ACCOUNT_DATA_EDIT').d('编辑')}
						</Button>

						<Button
							type="danger"
							ghost
							onClick={this.deleteAuthorityConfirm.bind(this, record)}
						>
							{intl.get('ACCOUNT_DATA_DELETE').d('删除')}
						</Button>
					</div>
				)
			}
		];
		return (
			<div className={ModuleStyle['authority-management-container']}>
				<div className={`${ModuleStyle['authority-management-block']}`}>
					<span className={ModuleStyle['authority-top-title']}>
						{intl.get('AUTHORITY_MANAGEMENT').d('权限管理')}
					</span>
				</div>
				<div className={ModuleStyle['add-new']}>
					<Button type="primary" onClick={this.addAuthorityRole}>
						{intl.get('AUTHORITY_MANAGEMENT_ADDBTN').d('新增权限')}
					</Button>
				</div>

				<div className={ModuleStyle['authority-content']}>
					<div className={ModuleStyle['authority-content-table']}>
						<Table
							className={ModuleStyle['table']}
							pagination={false}
							columns={columns}
							rowKey={(record) => record.id}
							dataSource={filterList}
							locale={{
								emptyText: (
									<Empty
										description={
											<span>{intl.get('NO_DATA').d('暂无数据')}</span>
										}
									/>
								)
							}}
						/>
						<Pagination
							className={ModuleStyle['pagination']}
							total={this.state.total}
							current={this.state.page}
							pageSize={this.state.pageSize}
							onChange={this.onChangePagination}
							hideOnSinglePage={this.state.total === 0}
						/>
					</div>
				</div>
			</div>
		);
	}
}
export default withUserInfo(AuthorityManagement);
