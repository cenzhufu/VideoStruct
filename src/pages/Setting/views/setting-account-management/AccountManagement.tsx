import * as React from 'react';
import * as intl from 'react-intl-universal';
import AccountModuleStyle from './assets/styles/index.module.scss';
import {
	Button,
	Input,
	Icon,
	Table,
	Modal,
	Cascader,
	message,
	Form,
	Pagination,
	Empty
} from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { FormComponentProps } from 'antd/lib/form';
import { IFOrganizationTree, IFUserInfo, ListType } from 'stsrc/type-define';
import {
	OrganizationRequests,
	UserAuthRequests,
	ModifyUserRequestType,
	DeleteUserRequestType,
	UserAuthorityType
} from 'stutils/requests/user-auth-requests';
import { RoleRequest } from 'stsrc/utils/requests/user-auth-requests/role';
import {
	IRoleInfo,
	RoleSearchPayload,
	RoleSearchType
} from 'stsrc/utils/requests/user-auth-requests/role/role-type';
import DeleteConfirmModal from 'stsrc/components/delete-confirm-modal';
import STComponent from 'stcomponents/st-component';
import AccountFormComponent from 'stsrc/components/account-form-component';
import { withUserInfo } from 'stsrc/contexts';
import { getvwInJS } from 'stassets/styles/js-adapt';
import { CascaderOptionType } from 'antd/lib/cascader';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
interface PropsType extends FormComponentProps {
	userInfo: IFUserInfo;
}

interface StateTpye {
	searchStr: string;
	addFormVisible: boolean;
	userTotalNumber: number;
	dataSource: Array<IFUserInfo>;
	organizationTreeList: Array<IFOrganizationTree>;
	roleList: Array<RoleSelectType>;
	page: number;
	pageSize: number;
	orgId: string;
	roleId: string;
	showEditForm: boolean;
	editDefaultOrg: Array<string>;
	addFormEnable: boolean;
	currentUserInfo: IFUserInfo;
}

interface RoleSelectType {
	id: string;
	name: string;
}

function noop() {}

class AccountManagement extends STComponent<PropsType, StateTpye> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			searchStr: '',
			addFormVisible: false,
			dataSource: [],
			organizationTreeList: [],
			roleList: [],
			userTotalNumber: 0,
			page: 1,
			pageSize: 10,
			orgId: '',
			roleId: '',
			showEditForm: false,
			editDefaultOrg: [],
			addFormEnable: false
		};
	}

	componentDidMount() {
		this.inquireUserOrganization();
		this.refreshUserList();
		this.searchOrgRole();
	}

	changeAreaToCascadeOption(area: IFOrganizationTree): CascaderOptionType {
		let result = {
			value: area.id,
			label: area.name
		};

		if (area.children.length > 0) {
			result['children'] = area.children.map((child: IFOrganizationTree) => {
				return this.changeAreaToCascadeOption(child);
			});
		}

		return result;
	}

	//查询用户所属组织机构
	inquireUserOrganization = () => {
		OrganizationRequests.inquireOrganizationsByNode()
			.then((userOrg: Array<IFOrganizationTree>) => {
				//
				if (userOrg && userOrg[0]) {
					let children = ValidateTool.getValidArray(userOrg[0]['children']);
					this.setState({ organizationTreeList: children });
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//查询用户角色列表
	searchOrgRole = () => {
		let payload: RoleSearchPayload = {
			needPage: false,
			config: RoleSearchType.SearchByLowAuthority
		};
		RoleRequest.inquireUserRoleByLevel(payload)
			.then((data: any) => {
				this.setState({
					roleList: this.roleDataFormat(data)
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//格式化组织机构下用户角色权限
	roleDataFormat = (rolelist: Array<IRoleInfo>) => {
		let roledata: Array<RoleSelectType> = [];
		if (rolelist && rolelist.length > 0) {
			for (let item of rolelist) {
				let roleObj: RoleSelectType = {
					id: item.id,
					name: item.name
				};
				roledata.push(roleObj);
			}
		}
		return roledata;
	};

	//获取用户列表数据
	getUserList = (pageIndex: number, pageSize: number) => {
		UserAuthRequests.searchUserList(pageIndex, pageSize, '')
			.then((userList: ListType<IFUserInfo>) => {
				this.setState({
					dataSource: userList.list,
					userTotalNumber: userList.total
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//刷新用户列表数据源
	refreshUserList = () => {
		this.getUserList(this.state.page, this.state.pageSize);
	};

	/**
	 * 删除用户接口
	 * NOTE:此处根据当前用户是否有账户管理权限进行校验，防止低权限或同权限删除
	 * @param {string} userId 用户id
	 * @param {IFUserInfo} userInfo 用户信息
	 * @memberof AccountManagement
	 * @returns {void}
	 */
	deleteUser(userId: string, userInfo: IFUserInfo) {
		let authorityType: UserAuthorityType = userInfo.hasAccountSettingAuthority
			? UserAuthorityType.HasAccoutAuthority
			: UserAuthorityType.NoAccoutAuthority;
		let payload: DeleteUserRequestType = {
			userId: userId,
			hardDelete: true,
			authorityType: authorityType
		};
		UserAuthRequests.deleteUserPost(payload)
			.then((deleteRes: boolean) => {
				message.success(
					intl.get('ACCOUNT_DELETE_USER_SUCCESS').d('删除账号成功')
				);
				this.refreshUserList();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	}

	//编辑用户接口
	editUser = (editInfo: ModifyUserRequestType) => {
		UserAuthRequests.modify(editInfo)
			.then((res: IFUserInfo) => {
				message.success(
					intl.get('ACCOUNT_EDIT_USER_SUCCESS').d('修改账号成功')
				);
				this.refreshUserList();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 搜索用户列表
	 * @param {number} pageIndex 当前页
	 * @param {number} pageSize 页面数据
	 * @param {string} content 模糊搜索内容:账号|单位|姓名
	 * @param {string} orgId 组织机构id
	 * @memberof AccountManagement
	 * @returns {void}
	 */
	searchUserListInfo = (
		pageIndex: number,
		pageSize: number,
		content: string,
		orgId?: string
	) => {
		UserAuthRequests.searchUserList(pageIndex, pageSize, content, orgId)
			.then((searchDataList: ListType<IFUserInfo>) => {
				this.setState({
					dataSource: searchDataList.list,
					userTotalNumber: searchDataList.total
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 新增表单提交处理事件
	 * @param {stirng} name
	 * @memberof AccountManagement
	 * @returns {void}
	 */

	addUserRequest = (
		name: string,
		account: string,
		password: string,
		orgId: string,
		roleId: string,
		avatarUrl: string
	) => {
		UserAuthRequests.signIn(name, account, password, roleId, orgId, avatarUrl)
			.then((userInfo: IFUserInfo) => {
				message.success(
					intl.get('ACCOUNT_ADD_USER_SUCCESS').d('新增用户成功！')
				);
				this.props.form.resetFields();
				this.setState({ addFormVisible: false });
				this.refreshUserList();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 编辑用户信息
	 * NOTE:此处根据当前用户是否有账户管理权限进行校验，防止低权限或同权限删除
	 * @param {UserFormInfo} values 表单信息
	 * @memberof AccountManagement
	 * @returns {void}
	 */

	editUserRequest = (
		name: string,
		account: string,
		password: string,
		orgId: string,
		roleId: string,
		avatarUrl: string
	) => {
		let authorityType: UserAuthorityType = (this.state
			.currentUserInfo as IFUserInfo).hasAccountSettingAuthority
			? UserAuthorityType.HasAccoutAuthority
			: UserAuthorityType.NoAccoutAuthority;
		let payload: ModifyUserRequestType = {
			id: (this.state.currentUserInfo as IFUserInfo).id as string,
			// name: values.username,
			// login: values.account,
			// password: md5(values.password as string),
			orgId: orgId,
			roleIdList: roleId,
			// imageUrl: this.state.imageUrl,
			authorityType: authorityType
		};

		UserAuthRequests.modify(payload)
			.then((userInfoRes: IFUserInfo) => {
				message.success(
					intl.get('ACCOUNT_EDIT_USER_SUCCESS').d('修改用户成功！')
				);
				this.setState({ showEditForm: false });
				this.refreshUserList();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//添加按钮响应
	addCountHandler = () => {
		this.props.form.resetFields();
		this.setState({
			addFormVisible: true,
			addFormEnable: true
		});
	};

	//搜索框事件
	searchStrOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		this.setState({ searchStr: value });
		if (value === '' || value === null) {
			this.searchUserListInfo(
				this.state.page,
				this.state.pageSize,
				value,
				this.state.orgId
			);
		}
	};

	searchStrOnPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		this.searchUserListInfo(
			this.state.page,
			this.state.pageSize,
			value,
			this.state.orgId
		);
	};
	searchStrOnClick = () => {
		this.searchUserListInfo(
			this.state.page,
			this.state.pageSize,
			this.state.searchStr,
			this.state.orgId
		);
	};
	//添加用户表单确认按键响应
	addUserConfirm = (e: React.FormEvent) => {
		this.setState({ addFormVisible: false });
	};

	editUserConfirm = (e: React.FormEvent) => {
		this.setState({ showEditForm: false });
	};

	//添加用户表单取消按键响应:清空表单
	addUserCancel = () => {
		this.setState({ addFormVisible: false });
		this.props.form.resetFields();
	};

	editUserCancel = () => {
		this.setState({ showEditForm: false });
	};

	//单位选过滤框回调
	unitSelectChange = (value: string[], selectedOption: Array<IFUserInfo>) => {
		let orgId: string = '';
		if (value && value.length > 0) {
			orgId = value[value.length - 1];
		}
		this.setState({ orgId: orgId });
		this.searchUserListInfo(this.state.page, this.state.pageSize, '', orgId);
	};

	/**
	 * 编辑按钮响应
	 * @param {IBUserInfo} itemInfo info
	 * @memberof AccountManagement
	 * @returns {void}
	 */
	editHandleClick = (itemInfo: IFUserInfo): void => {
		this.setState({
			showEditForm: true,
			currentUserInfo: itemInfo
		});
	};

	//确认删除
	userDeleteConfirm = (text: IFUserInfo) => {
		let self = this;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onOk: function onOk() {
				handle.destory();
				self.deleteUser(text.id, text);
			},
			onCancel: function onCancel() {
				handle.destory();
			},
			onChange: noop
		});
	};

	/**
	 * 页码设置
	 * @param {number} page 当前页
	 * @param {number} pageSize 页码数
	 * @memberof AccountManagement
	 * @returns {void}
	 */
	pageChange = (page: number, pageSize: number) => {
		this.setState({
			page: page,
			pageSize: pageSize
		});
		this.getUserList(page, pageSize);
	};

	roleListChange = (value: string, options: any) => {
		this.setState({ roleId: options.key });
	};

	//空值检测
	nullValueCheck = (args: any) => {
		return args || '---';
	};

	render() {
		const {
			dataSource,
			userTotalNumber,
			page,
			pageSize,
			searchStr,
			addFormVisible,
			showEditForm,
			roleList
		} = this.state;

		const columns: Array<ColumnProps<IFUserInfo>> = [
			{
				title: intl.get('ACCOUNT').d('账号'),
				dataIndex: 'account',
				width: '10%'
			},
			{
				title: intl.get('NAME').d('姓名'),
				dataIndex: 'name',
				width: '10%'
			},
			{
				title: intl.get('UNITS_DEPARTMENT').d('单位部门'),
				key: 'organization',
				width: '15%',
				render: (text: string, itemInfo: IFUserInfo) =>
					this.nullValueCheck(itemInfo.organization)
			},
			{
				title: intl.get('ACCOUNT_PERMISSION').d('账号权限'),
				key: 'roleList[0].roleName',
				render: (text: string, itemInfo: IFUserInfo) => {
					if (itemInfo) {
						if (itemInfo.roleList && itemInfo.roleList.length > 0) {
							return itemInfo.roleList[0].name;
						} else {
							return '---';
						}
					} else {
						return '---';
					}
				}
			},
			{
				title: intl.get('OPERATION').d('操作'),
				align: 'center',
				width: '25%',
				render: (text: string, itemInfo: IFUserInfo) =>
					this.state.dataSource.length >= 1 ? (
						<span className={`${AccountModuleStyle['account-data-operation']}`}>
							<Button
								type={'primary'}
								className={`${AccountModuleStyle['account-data-edit']}`}
								onClick={this.editHandleClick.bind(this, itemInfo)}
							>
								{intl.get('ACCOUNT_DATA_EDIT').d('编辑')}
							</Button>

							<Button
								type={'danger'}
								ghost
								className={`${AccountModuleStyle['account-data-delete']}`}
								onClick={this.userDeleteConfirm.bind(this, itemInfo)}
							>
								{intl.get('ACCOUNT_DATA_DELETE').d('删除')}
							</Button>
						</span>
					) : null
			}
		];

		let organizationCascadeOptions = this.state.organizationTreeList.map(
			(item: IFOrganizationTree) => {
				return this.changeAreaToCascadeOption(item);
			}
		);

		return (
			<div className={`${AccountModuleStyle['account-management-all']}`}>
				<div className={`${AccountModuleStyle['account-management-block']}`}>
					<span className={`${AccountModuleStyle['account-management-title']}`}>
						{intl.get('ACCOUNTS_MANAGEMENT').d('账号管理')}
					</span>
				</div>

				<div className={`${AccountModuleStyle['account-filter']}`}>
					<Button
						className={`${AccountModuleStyle['account-filter-add-button']}`}
						type={'primary'}
						onClick={this.addCountHandler}
					>
						{intl.get('ACCOUNT_ADD').d('添加账号')}
					</Button>
					<span className={`${AccountModuleStyle['unities-choose-title']}`}>
						{intl.get('UNITIES_SELECT').d('单位选择:')}
					</span>

					<div className={`${AccountModuleStyle['unities-choose-menus']}`}>
						<Cascader
							className={AccountModuleStyle['account-ant-cascader']}
							options={organizationCascadeOptions}
							expandTrigger={'hover'}
							placeholder={intl.get('UNITS_OPTION_SELECT_UNIT').d('请选择单位')}
							onChange={this.unitSelectChange}
							notFoundContent={intl
								.get('UNITS_OPTION_SELECT_UNIT')
								.d('请选择单位')}
							changeOnSelect
							style={{ width: getvwInJS(320) }}
						/>
					</div>

					<Input
						className={`${AccountModuleStyle['account-search-area']}`}
						placeholder={
							intl.get('ACCOUNT').d('账号') +
							'/' +
							intl.get('NAME').d('姓名') +
							'/' +
							intl.get('ACCOUNT_PERMISSION').d('账号权限')
						}
						prefix={
							<Icon
								type="search"
								style={{ color: '#57657' }}
								onClick={this.searchStrOnClick}
							/>
						}
						value={searchStr}
						onChange={this.searchStrOnChange}
						onPressEnter={this.searchStrOnPressEnter}
					/>
				</div>

				<div className={`${AccountModuleStyle['account-table-content']}`}>
					<Table
						className={`${AccountModuleStyle['account-table-show']}`}
						dataSource={dataSource}
						rowKey={'id'}
						columns={columns}
						pagination={false}
						locale={{
							emptyText: (
								<Empty
									description={<span>{intl.get('NO_DATA').d('暂无数据')}</span>}
								/>
							)
						}}
					/>
					<Pagination
						className={`${AccountModuleStyle['account-table-pagination']}`}
						onChange={this.pageChange}
						total={userTotalNumber}
						pageSize={pageSize}
						current={page}
						hideOnSinglePage={userTotalNumber === 0}
					/>
				</div>
				{/* 添加表单 */}
				<Modal
					className={`${AccountModuleStyle['account-add-form']}`}
					title={intl.get('ACCOUNT_ADD').d('添加账号')}
					visible={addFormVisible}
					onCancel={this.addUserCancel}
					onOk={this.addUserConfirm}
					closable={false}
					centered={true}
					footer={null}
					maskClosable={false}
					destroyOnClose={true}
				>
					<AccountFormComponent
						roleList={roleList}
						organizationTreeList={this.state.organizationTreeList}
						addUserCancel={this.addUserCancel}
						addUserRequest={this.addUserRequest}
					/>
				</Modal>

				{/* 编辑表单 */}
				<Modal
					className={`${AccountModuleStyle['account-edit-form']}`}
					title={intl.get('EDIT_ADD').d('编辑账号')}
					visible={showEditForm}
					onCancel={this.editUserCancel}
					onOk={this.editUserConfirm}
					closable={false}
					centered={true}
					footer={null}
					maskClosable={false}
					destroyOnClose={true}
				>
					<AccountFormComponent
						roleList={roleList}
						organizationTreeList={this.state.organizationTreeList}
						addUserCancel={this.editUserCancel}
						addUserRequest={this.editUserRequest}
						userInfo={this.state.currentUserInfo}
					/>
				</Modal>
			</div>
		);
	}
}

const WrappedAddCountForm = Form.create({})(withUserInfo(AccountManagement));

export default WrappedAddCountForm;
