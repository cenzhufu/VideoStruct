import * as React from 'react';
import * as intl from 'react-intl-universal';
import AccountModuleStyle from './assets/styles/index.module.scss';
import { Input, Cascader, Form, Select, Avatar, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { IFOrganizationTree, IFUserInfo } from 'stsrc/type-define';
import STComponent from 'stcomponents/st-component';
import { CascaderOptionType } from 'antd/lib/cascader';
import FileSelect from 'ifvendors/utils/file-select';
import FileRequest from 'stsrc/utils/requests/file-server-requests';

const FormItem = Form.Item;
const Option = Select.Option;

interface PropsType extends FormComponentProps {
	userInfo?: IFUserInfo;
	roleList: Array<RoleSelectType>;
	organizationTreeList: Array<IFOrganizationTree>;

	addUserCancel: () => void;
	addUserRequest: (
		name: string,
		account: string,
		password: string,
		orgId: string,
		roleId: string,
		avatarUrl: string
	) => void;
}

interface StateTpye {
	avatarUrl: string;
}

interface RoleSelectType {
	id: string;
	name: string;
}
function noop() {}
class FormComponent extends STComponent<PropsType, StateTpye> {
	static defaultPropType = {
		userInfo: undefined,
		roleList: [],
		organizationTreeList: [],
		addUserCancel: noop,
		addUserRequest: noop
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			avatarUrl: props.userInfo ? props.userInfo.avatarUrl : ''
		};
	}

	editEnable(): boolean {
		// eslint-disable-next-line
		return this.props.userInfo != undefined;
	}

	submitHandle = (e: React.FormEvent): void => {
		e.preventDefault();
		this.props.form.validateFields(
			(
				error: Error,
				values: {
					username: string;
					account: string;
					password: string;
					roleId: string;
					orgId: string[];
				}
			) => {
				if (!error) {
					this.props.addUserRequest(
						values.username,
						values.account,
						values.password,
						values.orgId[values.orgId.length - 1],
						values.roleId,
						this.state.avatarUrl
					);
				}
			}
		);
	};

	addUserCancel = () => {
		this.props.form.resetFields();
		this.props.addUserCancel();
	};

	/**
	 * 根据选择value返回单位id
	 * @param {string[]} value 选择项
	 * @param {Array<IFOrganizationTree>} orgType 单位数据源
	 * @memberof AccountManagement
	 * @returns {void}
	 */
	inquierCacaaderId = (value: string[], orgType: Array<IFOrganizationTree>) => {
		if (value.length > 0) {
			return value[value.length - 1];
		} else {
			return '';
		}
	};

	/**
	 * 单位组件回调
	 * @param {string[]} values 选择项
	 * @param {Array<IFOrganizationTree>} selectedOption 单位数据源
	 * @memberof AccountManagement
	 * @returns {void}
	 */
	cacsaderOnChange = (
		values: string[],
		selectedOption: Array<IFOrganizationTree>
	) => {
		// let id: string = this.inquierCacaaderId(values, selectedOption);
		// this.setState({ orgId: id });
	};

	getIdPath(id: string, extendAreaList: IFOrganizationTree[]): string[] {
		for (let root of extendAreaList) {
			let result = this._getIdPath(id, root, []);
			if (result.length > 0) {
				return result;
			}
		}

		return [];
	}

	_getIdPath(
		id: string,
		root: IFOrganizationTree,
		paths: string[] = []
	): string[] {
		if (!id) {
			return [];
		}

		// eslint-disable-next-line
		if (root.id == id) {
			return [...paths, String(id)];
		}

		for (let child of root.children) {
			let result = this._getIdPath(id, child, [...paths, root.id]);
			if (result.length > 0) {
				return result;
			}

			continue;
		}

		return [];
	}

	nullValueCheck = (
		userInfo?: IFUserInfo,
		args: string = '',
		defaultValue: string = ''
	) => {
		if (userInfo && userInfo !== undefined) {
			if (userInfo[args]) {
				return userInfo[args];
			} else {
				return defaultValue;
			}
		} else {
			return defaultValue;
		}
	};

	//密码校验
	passwordCompareNext = (rule: any, value: string, callback: any) => {
		let form = this.props.form;
		if (value) {
			// @ts-ignore
			form.validateFields(['confirm'], { force: false });
		} else {
			callback();
		}
	};

	passwordConfirm = (rule: any, value: string, callback: any) => {
		let form = this.props.form;
		if (value.indexOf('') === -1 || value === '') {
			callback(
				intl.get('ACCOUNT_ADD_PASSWORD_CONFIRM').d('请输入6位以上确认密码!')
			);
		}
		if (value && value !== form.getFieldValue('password')) {
			callback(
				intl.get('ACCOUNT_ADD_PASSWORD_AGAIN_WRONG').d('两次输入密码不一致!')
			);
		} else {
			callback();
		}
	};

	//input 输入框表单自动填充默认值处理
	inputOnFocusHandle = (e: React.FocusEvent<HTMLInputElement>) => {
		// if (e.target.value === e.target.defaultValue) {
		// 	e.target.value = '';
		// }
	};

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

	avatarhandleClick = () => {
		if (this.props.userInfo) {
			// do nothing
		} else {
			this._avatarhandleClick();
		}
	};

	//上传用户图像图片
	_avatarhandleClick = () => {
		FileSelect.showFileSelectDialog(
			{
				accept: 'image/jpg, image/jpeg, .png',
				multiple: true
			},
			(files: Array<File>) => {
				FileRequest.uploadImageFile(files[0])
					.then((res) => {
						if (res && res.fileUrl) {
							//将返回imageUrl传递给新增
							//
							this.setState({
								avatarUrl: res.fileUrl
							});
						}
					})
					.catch((error: Error) => {
						console.error(error);
						message.error(error.message);
					});
			}
		);
	};

	// roleListChange = (value: string) => {
	// 	this.setState({
	// 		roleId: value
	// 	});
	// };

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 }
		};

		let organizationCascadeOptions = this.props.organizationTreeList.map(
			(item: IFOrganizationTree) => {
				return this.changeAreaToCascadeOption(item);
			}
		);

		return (
			<div className={`${AccountModuleStyle['account-management-all']}`}>
				<div className={`${AccountModuleStyle['account-filter']}`}>
					{
						<Form onSubmit={this.submitHandle}>
							<FormItem {...formItemLayout} label={intl.get('NAME').d('姓名')}>
								{getFieldDecorator('username', {
									rules: [
										{
											required: true,
											message: intl
												.get('ACCOUNT_ADD_NAME')
												.d('请输入2至10位字符'),
											min: 2,
											max: 10
										}
									],
									initialValue: this.nullValueCheck(this.props.userInfo, 'name')
								})(
									<Input
										disabled={this.props.userInfo ? true : false}
										className={`${AccountModuleStyle['account-add-input']}`}
										placeholder={intl
											.get('ACCOUNT_ADD_NAME')
											.d('请输入2至10位字符')}
										// onFocus={this.inputOnFocusHandle}
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label={intl.get('ACCOUNT').d('账号')}
							>
								{getFieldDecorator('account', {
									rules: [
										{
											required: true,
											message: intl
												.get('ACCOUNT_ADD_NAME')
												.d('请输入2位以上账号'),
											min: 2,
											max: 10
										}
									],
									initialValue: this.nullValueCheck(
										this.props.userInfo,
										'account'
									)
								})(
									<Input
										disabled={this.props.userInfo ? true : false}
										placeholder={intl
											.get('ACCOUNT_ADD_NAME')
											.d('请输入2位以上账号')}
										// onFocus={this.inputOnFocusHandle}
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label={intl.get('PASSWORDS').d('密码')}
							>
								{getFieldDecorator('password', {
									rules: [
										{
											required: true,
											min: 6,
											message: intl
												.get('ACCOUNT_ADD_PASSWORD')
												.d('请输入6位以上密码')
											// validator: this.passwordCompareNext
										}
									],
									initialValue: this.props.userInfo ? '******' : ''
								})(
									<Input
										disabled={this.props.userInfo ? true : false}
										type={'password'}
										placeholder={intl
											.get('ACCOUNT_ADD_PASSWORD')
											.d('请输入6位以上密码')}
										// onFocus={this.inputOnFocusHandle}
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label={intl.get('ACCOUNT_ADD_FORM_COMFIRM').d('密码确认')}
							>
								{getFieldDecorator('confirm', {
									rules: [
										{
											required: true,
											message: intl
												.get('ACCOUNT_ADD_PASSWORD_AGAIN_WRONG')
												.d('两次输入密码不一致!'),
											min: 6,
											validator: this.passwordConfirm
										}
									],
									initialValue: this.props.userInfo ? '******' : ''
								})(
									<Input
										disabled={this.props.userInfo ? true : false}
										type={'password'}
										placeholder={intl
											.get('ACCOUNT_ADD_PASSWORD_INPUT_AGAIN')
											.d('请再次输入密码')}
										onFocus={this.inputOnFocusHandle}
									/>
								)}
							</FormItem>
							<FormItem {...formItemLayout} label={intl.get('UNITS').d('单位')}>
								{getFieldDecorator('orgId', {
									rules: [
										{
											required: true,
											message: intl
												.get('ACCOUNT_ADD_ORGANIZATION')
												.d('请选择用户组织机构')
										}
									],
									initialValue: this.props.userInfo
										? this.getIdPath(
												this.props.userInfo.orgId,
												this.props.organizationTreeList
										  )
										: []
								})(
									<Cascader
										options={organizationCascadeOptions}
										expandTrigger={'hover'}
										placeholder={intl
											.get('UNITS_OPTION_SELECT_AREA')
											.d('请选择区域')}
										onChange={this.cacsaderOnChange}
										changeOnSelect
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label={intl.get('ACCOUNT_ADD_AUTHORITY').d('账号权限')}
							>
								{getFieldDecorator('roleId', {
									rules: [
										{
											required: true,
											message: intl.get('ACCOUNT_ADD_ROLES').d('请选择用户角色')
										}
									],
									initialValue: this.props.userInfo
										? (this.props.userInfo.roleList[0] &&
												this.props.userInfo.roleList[0].id) ||
										  ''
										: ''
								})(
									<Select>
										{this.props.roleList.map((item) => {
											return (
												<Option key={item.id} value={item.id}>
													{item.name}
												</Option>
											);
										})}
									</Select>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label={intl.get('ACCOUNT_ADD_UPLOAD_IMAGE').d('上传图像')}
							>
								{
									<div
										onClick={this.avatarhandleClick}
										className={
											this.props.userInfo
												? ''
												: AccountModuleStyle['avatar-contaniner']
										}
									>
										{
											<Avatar
												size={80}
												icon="user"
												src={
													this.props.userInfo
														? this.props.userInfo.avatarUrl
														: this.state.avatarUrl
												}
												alt={'avatar'}
											/>
										}
									</div>
								}
							</FormItem>
							<FormItem>
								<Button
									type={'ghost'}
									className={`${AccountModuleStyle['account-data-add-cancel']}`}
									onClick={this.addUserCancel}
								>
									{intl.get('CANCLE_BTN').d('取消')}
								</Button>
								<Button
									type={'primary'}
									htmlType={'submit'}
									className={`${
										AccountModuleStyle['account-data-add-confirm']
									}`}
									onClick={this.submitHandle}
								>
									{intl.get('SURE_BTN').d('确定')}
								</Button>
							</FormItem>
						</Form>
					}
				</div>
			</div>
		);
	}
}

const AccountFormComponent = Form.create()(FormComponent);

export default AccountFormComponent;
