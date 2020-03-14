import * as React from 'react';
import { Button, Input, Row, Col, message } from 'antd';
import * as intl from 'react-intl-universal';
import { withUserInfo } from 'stcontexts';
import ModuleStyle from './assets/styles/index.module.scss';
import { IFUserInfo } from 'sttypedefine';
import { UserAuthRequests } from 'stutils/requests/user-auth-requests';
import STComponent from 'stcomponents/st-component';
interface PropsType {
	userInfo: IFUserInfo;
	updateUserInfo: (info: Partial<IFUserInfo>) => {};
	logOut: () => void;
}

interface StateType {
	confirmDirty: boolean;
	currentPassword: string;
	newPassword: string;
	secondPassword: string;
	currentPasswordIsErr: boolean;
	newPasswordIsErr: boolean;
}
class ChangePassword extends STComponent<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			confirmDirty: true, //二次确认
			currentPassword: '', //当前密码
			newPassword: '', //新密码
			secondPassword: '', //第二次密码
			currentPasswordIsErr: false,
			newPasswordIsErr: false
		};
	}

	/**
	 *  输入当前密码
	 * @param {React.ChangeEvent<HTMLInputElement>} e Event事件
	 * @memberof ChangePassword
	 * @returns {void}
	 */
	onChangeCurrentPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		let currentPasswordIsErr = false;
		if (value.split('').length === 0) {
			currentPasswordIsErr = true;
		}
		this.setState({
			currentPassword: value,
			currentPasswordIsErr
		});
	};

	/**
	 *  输入新密码
	 * @param {React.ChangeEvent<HTMLInputElement>} e Event事件
	 * @memberof ChangePassword
	 * @returns {void}
	 */
	onChangeNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { secondPassword } = this.state;
		const value = e.target.value;
		let confirmDirty = true;
		let newPasswordIsErr = false;
		if (secondPassword && secondPassword !== value) {
			confirmDirty = false;
		}
		if (value.split('').length < 6) {
			newPasswordIsErr = true;
		}
		this.setState({
			newPassword: value,
			confirmDirty,
			newPasswordIsErr
		});
	};

	/**
	 *  二次密码
	 * @param {React.ChangeEvent<HTMLInputElement>} e Event事件
	 * @memberof ChangePassword
	 * @returns {void}
	 */
	onChangeSecondPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { newPassword } = this.state;
		const value = e.target.value;
		let confirmDirty = true;
		if (value !== newPassword) {
			confirmDirty = false;
		}

		this.setState({
			secondPassword: value,
			confirmDirty
		});
	};

	/**
	 * 修改密码操作
	 * @memberof ChangePassword
	 * @returns {void}
	 */
	hangleClickSubmit = () => {
		const {
			currentPassword,
			newPassword,
			secondPassword,
			confirmDirty
		} = this.state;

		if (!currentPassword || currentPassword.split('').length === 0) {
			this.setState({ currentPasswordIsErr: true });
			return;
		}

		if (!newPassword || newPassword.split('').length < 6) {
			this.setState({ newPasswordIsErr: true });
			return;
		}
		if (secondPassword !== newPassword) {
			this.setState({
				confirmDirty: false
			});
			return;
		}

		if (confirmDirty) {
			const userId = this.props.userInfo ? this.props.userInfo.id : '';
			UserAuthRequests.changePassword(newPassword, currentPassword, userId)
				.then((res) => {
					if (res) {
						message.success('修改密码成功！即将跳转到登录页面重新登录！');
						setTimeout(() => {
							this.props.logOut();
						}, 2000);
					} else {
						message.error('修改密码失败！');
					}
				})
				.catch((error) => {
					console.error(error);
					message.error(error.message);
				});
		}
	};

	render() {
		const {
			confirmDirty,
			currentPassword,
			newPassword,
			secondPassword,
			currentPasswordIsErr,
			newPasswordIsErr
		} = this.state;
		console.log({ confirmDirty });

		return (
			<div className={`${ModuleStyle['change-passeord-wrap']}`}>
				<div className={ModuleStyle['title']}>
					<h5 className={`${ModuleStyle['content-title']}`}>
						{intl.get('USER_CHANGE_PASSWORD').d('修改密码')}
					</h5>
				</div>
				<div className={`${ModuleStyle['password-container']}`}>
					<div className={`${ModuleStyle['password-form']}`}>
						<Row
							type="flex"
							align="middle"
							justify="center"
							className={`${ModuleStyle['password-row']}`}
						>
							<Col span={3} style={{ textAlign: 'right', color: '#576574' }}>
								{intl.get('USER_CURRENT_PASSWORD').d('当前密码')}：
							</Col>
							<Col className={`${ModuleStyle['password-item']}`}>
								<Input
									type="password"
									maxLength={12}
									className={`${ModuleStyle['password-item-input']}`}
									placeholder={intl
										.get('SURE_PLEASE_INPUT_PASSWORD')
										.d('请填写密码')}
									value={currentPassword}
									onChange={this.onChangeCurrentPassword}
								/>
								<div className={`${ModuleStyle['password-error']}`}>
									{currentPasswordIsErr && (
										<span>
											{intl.get('SURE_PLEASE_INPUT_PASSWORD').d('请填写密码')}
										</span>
									)}
								</div>
							</Col>
						</Row>
						<Row
							type="flex"
							align="middle"
							justify="center"
							className={`${ModuleStyle['password-row']}`}
						>
							<Col span={3} style={{ textAlign: 'right', color: '#576574' }}>
								{intl.get('USER_NEW_PASSWORD').d('新密码')}：
							</Col>
							<Col className={`${ModuleStyle['password-item']}`}>
								<Input
									type="password"
									maxLength={12}
									className={`${ModuleStyle['password-item-input']}`}
									placeholder={intl
										.get('SURE_PLEASE_INPUT_PASSWORD')
										.d('请填写密码')}
									value={newPassword}
									onChange={this.onChangeNewPassword}
								/>
								<div className={`${ModuleStyle['password-error']}`}>
									{newPasswordIsErr && (
										<span>
											{intl
												.get('SURE_PLEASE_INPUT_NEW_PASSWORD')
												.d('请填写新密码（6~12位）！')}
										</span>
									)}
								</div>
							</Col>
						</Row>
						<Row
							type="flex"
							align="middle"
							justify="center"
							className={`${ModuleStyle['password-row']}`}
						>
							<Col span={3} style={{ textAlign: 'right', color: '#576574' }}>
								{intl.get('SURE_CONFIRM_PASSWORD').d('确认密码')}：
							</Col>
							<Col className={`${ModuleStyle['password-item']}`}>
								<Input
									type="password"
									maxLength={12}
									className={`${ModuleStyle['password-item-input']}`}
									placeholder={intl
										.get('SURE_PLEASE_INPUT_PASSWORD')
										.d('请填写密码')}
									value={secondPassword}
									onChange={this.onChangeSecondPassword}
								/>
								<div className={`${ModuleStyle['password-error']}`}>
									{/* {secondPasswordIsErr && (
										<span>
											{intl
												.get('SURE_PLEASE_INPUT_NEW_PASSWORD')
												.d('请填写新密码（6~12位）')}
										</span>
									)} */}
									{!confirmDirty && (
										<span>
											{intl
												.get('SURE_PASSWORD_IS_DIFFERENT')
												.d('两次输入密码不一致！')}
										</span>
									)}
								</div>
							</Col>
						</Row>
						<Row
							type="flex"
							align="middle"
							justify="center"
							className={`${ModuleStyle['password-row']}`}
						>
							<Col span={3} />
							<Col>
								<Button
									type="primary"
									block
									className={`${ModuleStyle['sure-btn']}`}
									onClick={this.hangleClickSubmit}
								>
									确定
								</Button>
							</Col>
						</Row>
					</div>
				</div>
			</div>
		);
	}
}

export default withUserInfo(ChangePassword);
