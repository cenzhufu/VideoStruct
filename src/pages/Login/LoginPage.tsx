import * as React from 'react';
import { match, Redirect } from 'react-router-dom';
import * as H from 'history';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/style/login-page.module.scss';

import { withUserInfo } from 'stcontexts';

import {
	UserAuthRequests,
	IFUserLoginInfo,
	IFLoginState
} from 'stutils/requests/user-auth-requests';
import LoginStateManager from 'stutils/login-state';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { IFUserInfo } from 'sttypedefine';
import STComponent from 'stcomponents/st-component';
const FormItem = Form.Item;

interface StateType {
	isWrong: boolean;
	isRemember: boolean; // 是否记住我
	accountErr: boolean;
	passwordErr: boolean;
}

interface LoginPagePropsType extends FormComponentProps {
	match: match;
	history: H.History;
	location: H.Location;

	// withUserInfo添加的props
	userInfo: IFUserInfo;
	logOut: () => void;
	loginIn: (loginInfo: IFUserLoginInfo) => void;
}
// 登录框
class LoginForm extends STComponent<LoginPagePropsType, StateType> {
	constructor(props: LoginPagePropsType) {
		super(props);
		this.state = {
			isWrong: false,
			isRemember: false,
			accountErr: false,
			passwordErr: false
		};
	}

	handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		this.props.form.validateFields(
			(err: Error, values: { userName: string; password: string }) => {
				if (!err && values.password && values.password.length >= 0) {
					// 数据请求
					UserAuthRequests.loginIn(values.userName, values.password)
						.then((loginInfo: IFUserLoginInfo) => {
							let state: IFLoginState = loginInfo.loginState;
							let expires;
							if (this.state.isRemember) {
								expires = 7; //  NOTE: 不使用后台返回的state.expires / (60 * 60 * 24);
							}
							let userId = loginInfo.userInfo.id;
							LoginStateManager.setLoginState(
								state.token,
								state.tokenType,
								userId,
								expires,
								this.state.isRemember
							);

							// app提供的context provider登录
							this.props.loginIn(loginInfo);
						})
						.catch((error: Error) => {
							console.error('error', error);
							message.error(error.message);
							this.setState({
								isWrong: true
							});
						});
				}
			}
		);
	};

	onChangeRemember = (e: CheckboxChangeEvent) => {
		this.setState({ isRemember: e.target.checked });
	};

	onUserNameChangeInput = (e: React.FormEvent) => {
		if (e.target.value.length === 0) {
			this.setState({
				accountErr: true
			});
		} else {
			this.setState({
				accountErr: false
			});
		}
		this.setState({ isWrong: false });
	};

	onPasswordChangeInput = (e: React.FormEvent<HTMLInputElement>) => {
		if (e.target.value.length === 0) {
			this.setState({
				passwordErr: true
			});
		} else {
			this.setState({
				passwordErr: false
			});
		}
		this.setState({ isWrong: false });
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { isWrong, accountErr, passwordErr, isRemember } = this.state;
		return (
			<div className={`${ModuleStyle['login-page']}`}>
				<div className={ModuleStyle['left-bottom-rectangle']} />
				<div className={ModuleStyle['right-top-rectangle']} />
				<div className={`${ModuleStyle['login-content']}`}>
					<div className={ModuleStyle['left-part']}>
						<div className={ModuleStyle['image-view']} />
					</div>
					<div className={ModuleStyle['right-part']}>
						<div className={ModuleStyle['system-info']}>
							<div className={ModuleStyle['logo']} />
							<div className={ModuleStyle['system-name']}>
								{intl.get('LOGIN_SYSTEM_NAME').d('视频结构化平台')}
							</div>
						</div>

						<Form
							onSubmit={this.handleSubmit}
							className={`${ModuleStyle['login-item-form']}`}
						>
							<FormItem>
								{getFieldDecorator('userName')(
									<Input
										placeholder={intl
											.get('LOGIN_INPUT_USERNAME_PLACEHOLD')
											.d('账号')}
										onChange={this.onUserNameChangeInput}
										className={
											accountErr || isWrong
												? ModuleStyle['login-account-error']
												: ''
										}
									/>
								)}
								<div className={ModuleStyle['login-error-text']}>
									{accountErr && (
										<span>
											{intl.get('LOGIN_INPUT_USERNAME_TIP').d('账号不能为空')}
										</span>
									)}
								</div>
							</FormItem>
							<FormItem>
								{getFieldDecorator('password')(
									<Input
										type="password"
										placeholder={intl
											.get('LOGIN_INPUT_PASSWORD_PLACEHOLD')
											.d('密码')}
										onChange={this.onPasswordChangeInput}
										className={
											isWrong || passwordErr ? ModuleStyle['login-error'] : ''
										}
									/>
								)}
								<div className={ModuleStyle['login-error-text']}>
									{passwordErr && (
										<span>
											{intl.get('LOGIN_INPUT_PASSWORD_TIP').d('请输入密码')}
										</span>
									)}
								</div>
								<div className={ModuleStyle['login-error-text']}>
									{isWrong && (
										<span>
											{intl
												.get('LOGIN_USERNAME_PASSWORD_IS_WRONG')
												.d('账号或密码输入不正确')}
										</span>
									)}
								</div>
								<div className={ModuleStyle['login-keep']}>
									{/* {getFieldDecorator('remember',{
											valuePropName: 'checked',
											initialValue: isRemember
										}
									)(
										<Checkbox
											style={{ color: 'rgba(255, 255, 255, 1)' }}
											onChange={this.onChangeRemember}
											defaultChecked={isRemember ? true : false}
										>
											<span className={ModuleStyle['keep-login-text']}>
												{intl.get('LOGIN_KEEP').d('保持登录')}
											</span>
										</Checkbox>
									)} */}
									<Checkbox
										style={{ color: 'rgba(255, 255, 255, 1)' }}
										onChange={this.onChangeRemember}
										defaultChecked={isRemember ? true : false}
									>
										<span className={ModuleStyle['keep-login-text']}>
											{intl.get('LOGIN_KEEP').d('自动登录')}
										</span>
									</Checkbox>
								</div>
							</FormItem>
							<FormItem>
								<Button
									htmlType="submit"
									className={ModuleStyle['login-button']}
									style={{ width: '100%', height: 44 }}
								>
									{intl.get('LOGIN_LOGIN').d('登录')}
								</Button>
							</FormItem>
						</Form>
					</div>
					{/* <div className={`${ModuleStyle['login-item-logo']}`}>
						<img src={Logourl} alt="logo" />
					</div> */}
				</div>
				{/* <div className={`${ModuleStyle['login-rights']}`}>
					<span>
						Copyright&2014-2016 intellif.com All Rights Reserved.云天励飞
						版权所有
					</span>
				</div> */}
			</div>
		);
	}
}

const Login = Form.create()(LoginForm);

class LoginPage extends STComponent<LoginPagePropsType> {
	render() {
		if (LoginStateManager.isLoginIn()) {
			const { from } = this.props.location.state || {
				from: { pathname: '/structuralize' }
			};
			return <Redirect to={from} />;
		} else {
			return <Login {...this.props} />;
		}
	}
}

export default withUserInfo(LoginPage);
