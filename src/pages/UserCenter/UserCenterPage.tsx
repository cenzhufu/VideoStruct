import * as React from 'react';
import { Layout, Avatar, Card, Modal, Button, message } from 'antd';
import * as intl from 'react-intl-universal';
import UploadRecord from './views/upload-record';
import ChangePassword from './views/change-password';
import ModuleStyle from './assets/style/index.module.scss';

import { getvwInJS } from 'stsrc/assets/styles/js-adapt';

import { IFUserInfo } from 'sttypedefine';
import { withUserInfo } from 'stcontexts';
import { DefaultAvatorIconComponent } from 'stcomponents/icons';
import FileSelect from 'ifvendors/utils/file-select';
import FileRequest from 'stsrc/utils/requests/file-server-requests';
import { UserAuthRequests } from 'stsrc/utils/requests/user-auth-requests';
import STComponent from 'stcomponents/st-component';
import { guid } from 'ifvendors/utils/guid';
const { Content, Sider } = Layout;

interface PropsType {
	// withUserInfo添加的props
	userInfo: IFUserInfo;
	updateUserInfo: (info: Partial<IFUserInfo>) => {};
}
interface StateType {
	showModule: string;
	changeAvatarModuleVisible: boolean;
	userInfo: IFUserInfo;
	randomKey: string;
}
class UserCenter extends STComponent<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			userInfo: props.userInfo,
			showModule: 'uploadRecord', //uploadRecord changePassword
			changeAvatarModuleVisible: false, //是否修改头像
			randomKey: guid()
		};
	}

	//点击头像修改
	handleChangeAvatar = () => {
		this.setState({
			changeAvatarModuleVisible: true
		});
	};
	//确定
	handleOk = () => {
		this.setState({
			changeAvatarModuleVisible: false
		});
	};
	handleCancel = (e: React.MouseEvent<any>) => {
		const userInfo = { ...this.state.userInfo };
		this.props.updateUserInfo(userInfo);
		this.setState({
			changeAvatarModuleVisible: false
		});
	};

	/**
	 * 选择头像上传
	 * @memberof UserCenter
	 * @returns {void}
	 */
	handleUploadAvatar = () => {
		FileSelect.showFileSelectDialog(
			{
				accept: 'image/jpg, image/jpeg, .png, .bmp',
				multiple: true
			},
			(files: Array<File>) => {
				let reg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/;
				//检测文件大写
				if (files[0] && reg.test(files[0].name)) {
					const fileSize = files[0].size / (1024 * 1024);
					if (fileSize > 10) {
						message.warning(
							intl.get('IMG_SIZE_MORE_TANN_TIP').d('上传的图片不能大于10M！')
						);
						return;
					}
				} else {
					message.warning(
						intl
							.get('UPLOAD_IMAGE_ONLY_ACCEPTED')
							.d('只支持.jpg, .jpeg,.png, .bmp格式的文件')
					);
					return;
				}
				// 文件上传
				FileRequest.uploadImageFile(files[0])
					.then((res) => {
						if (res && res.fileUrl) {
							this._updateUserInfo(res.fileUrl);
						}
					})
					.catch((error) => {
						console.error(error);
						message.error(error.message);
					});
			}
		);
	};

	/**
	 *编辑用户头像
	 * @param {string} imageUrl 图片url
	 * @memberof UserCenter
	 * @returns {void}
	 */
	_updateUserInfo = (imageUrl: string): void => {
		const userInfo = this.props.userInfo;
		if (userInfo) {
			const { id } = userInfo;
			UserAuthRequests.modify({
				id,
				imageUrl
			})
				.then((res) => {
					if (res) {
						this.setState({
							userInfo: { ...this.props.userInfo }
						});
						this.props.updateUserInfo(res);
					}
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		}
	};

	//切换菜单
	handleChangePassword = (showModule: string) => {
		this.setState({ showModule, randomKey: guid() });
	};
	render() {
		console.log('zml this.props.userInfo', this.props.userInfo);
		const { showModule, changeAvatarModuleVisible } = this.state;
		const { userInfo } = this.props;
		return (
			<div className={`${ModuleStyle['user-center-wrap']}`}>
				<Layout>
					<Modal
						width={512}
						title={intl.get('SURE_CHANGE_AVATAR').d('修改头像')}
						centered
						closable={false}
						maskClosable={false}
						className={`${ModuleStyle['change-avatar-modal']}`}
						visible={changeAvatarModuleVisible}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						footer={[
							<div key="btnGroup">
								<Button
									type="primary"
									style={{
										width: '80px',
										height: '28px',
										lineHeight: '28px'
									}}
									onClick={this.handleOk}
								>
									{intl.get('SURE_BTN').d('确定')}
								</Button>
								<Button
									style={{
										width: '80px',
										height: '28px',
										lineHeight: '28px',
										opacity: 0.4993,
										border: '1px solid rgba(191, 191, 191, 1)',
										background: '$component-background-color'
									}}
									// className={`${ModuleStyle['btn-cancle']}`}
									onClick={this.handleCancel}
								>
									{intl.get('CANCLE_BTN').d('取消')}
								</Button>
							</div>
						]}
					>
						<div
							style={{ display: 'inline-block' }}
							onClick={this.handleUploadAvatar}
						>
							{this.getUserAvatorElement()}
						</div>
					</Modal>
					<Sider width={getvwInJS(328)} style={{ background: '#424F66' }}>
						<Card
							bordered={false}
							className={`${ModuleStyle['user-card']}`}
							style={{ marginBottom: 16 }}
						>
							<div className={ModuleStyle['avator']}>
								<div
									style={{ display: 'inline-block' }}
									onClick={this.handleChangeAvatar}
								>
									{this.getUserAvatorElement()}
								</div>
							</div>
							<div className={`${ModuleStyle['name']}`}>
								{this.getUserName()}
							</div>
							<div className={ModuleStyle['text']}>
								{userInfo &&
									userInfo.roleList &&
									userInfo.roleList.length &&
									userInfo.roleList[0].roleCnName}
							</div>
							<div className={ModuleStyle['text']}>
								{userInfo && userInfo.organization}
							</div>
							<div className={ModuleStyle['text']}>{`${intl
								.get('account----')
								.d('账号')} ${this.getUserAccout()}`}</div>
						</Card>
						<Card
							bordered={false}
							className={`${ModuleStyle['feature-container']}`}
						>
							<div
								className={`${ModuleStyle['user-operate']}`}
								onClick={this.handleChangePassword.bind(this, 'changePassword')}
							>
								<span
									className={
										showModule === 'changePassword' ? ModuleStyle['active'] : ''
									}
								>
									{intl.get('USER_CHANGE_PASSWORD').d('修改密码')}
								</span>
							</div>
							<div
								className={`${ModuleStyle['user-operate']}`}
								onClick={this.handleChangePassword.bind(this, 'uploadRecord')}
							>
								<span
									className={
										showModule === 'uploadRecord' ? ModuleStyle['active'] : ''
									}
								>
									{intl.get('USER_UPLOAD_RECORD').d('上传记录')}
								</span>
							</div>
						</Card>
					</Sider>
					<Layout className={ModuleStyle['right-content']}>
						<Content className={`${ModuleStyle['user-content']}`}>
							{showModule === 'uploadRecord' && (
								<UploadRecord
									userInfo={this.props.userInfo}
									key={this.state.randomKey}
								/>
							)}
							{showModule === 'changePassword' && <ChangePassword />}
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}

	/***************辅助方法 *****************/
	//获取用户名
	getUserName() {
		return (
			(this.props.userInfo && this.props.userInfo.name) ||
			intl.get('COMMON_UNKNOWN').d('未知')
		);
	}

	getUserAccout() {
		return (
			(this.props.userInfo && this.props.userInfo.account) ||
			intl.get('COMMON_UNKNOWN').d('未知')
		);
	}

	getUserAvatorElement() {
		if (this.props.userInfo && this.props.userInfo.avatarUrl) {
			return (
				<Avatar size={80} icon="user" src={this.props.userInfo.avatarUrl} />
			);
		} else {
			return <DefaultAvatorIconComponent />;
		}
	}
}

export default withUserInfo(UserCenter);
