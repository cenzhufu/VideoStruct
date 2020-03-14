import * as React from 'react';
import { message } from 'antd';
import { Route, Redirect, Switch, match, withRouter } from 'react-router-dom';
import * as H from 'history';
import Login from 'stpages/Login';
import Home from 'stpages/Home';
import { UnAuthorizedError } from 'stutils/errors';

// 请求拦截器
import 'stutils/requests';
// 修改antd样式
import 'stassets/styles/antd-customize/index.scss';

import LoginStateManager from 'stutils/login-state';
import { UserInfoContext, UserInfoContextType } from 'stcontexts';
import {
	UserAuthRequests,
	IFUserLoginInfo
} from 'stutils/requests/user-auth-requests';
import { IFUserInfo, VehicleBrandManager } from 'stsrc/type-define';
import STComponent from 'stcomponents/st-component';
import { Provider } from 'react-redux';
import STMqtt from 'stutils/mqtt';

import FileUploadManager from 'stsrc/utils/file-upload-manager/src/FileUploadAnalysisWorkFlowManager';
import store from 'src/redux';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
// import TaskQueue, {
// 	TestTask1,
// 	TestTask2,
// 	TestTask3,
// 	TaskQueueSequenceItem
// } from 'ifvendors/utils/task-queue';
// import TaskQueueDecorateItem from 'ifvendors/utils/task-queue/TaskQueueDecorateItem';

type PropsType = {
	match: match;
	history: H.History;
	location: H.Location;
};
type StateType = {
	userInfo: IFUserInfo | null;
};

const MAX_COUNT: number = 1;
class App extends STComponent<PropsType, StateType> {
	state = {
		userInfo: null
	};

	componentDidMount() {
		// NOTE: 全局的配置
		message.config({
			duration: 2,
			maxCount: MAX_COUNT
		});

		STMqtt.getInstance().connect();

		// 禁用拖动文件到页面，浏览器默认打开这个文件的操作
		document.addEventListener(
			'dragover',
			function(event) {
				if (event.dataTransfer) {
					event.dataTransfer.dropEffect = 'none';
					event.preventDefault();
				}
			},
			true // use capture
		);
		document.addEventListener(
			'drop',
			function(event) {
				event.preventDefault(); //禁止浏览器默认行为
				return false; //禁止浏览器默认行为
			},
			false
		);

		window.addEventListener('beforeunload', function(e) {
			// Cancel the event
			e.preventDefault();
			STMqtt.getInstance().disconnect();
			// Chrome requires returnValue to be set
			// 当有正在上传的文件的时候
			if (FileUploadManager.getInstance().getAllFileLoadTasksCount() > 0) {
				e.returnValue = '';
			}
		});

		this.loginIfNeed();
	}

	componentWillUnmount() {
		STMqtt.getInstance().disconnect();
	}

	loginIfNeed() {
		if (LoginStateManager.isLoginIn()) {
			// 获取用户信息
			UserAuthRequests.getLoginUserInfo()
				.then((info: IFUserInfo) => {
					this.setState({
						userInfo: info
					});

					// 获取用户信息事件
					eventEmiiter.emit(EventType.getUserInfo);
					// 获取全局的车辆配置
					VehicleBrandManager.initConfig();
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
					// 重定向
					if (!(error instanceof UnAuthorizedError)) {
						//
						LoginStateManager.clearLoginState();
						this.props.history.replace('/login');
					}
				});
		}
	}

	login = (loginInfo: IFUserLoginInfo): void => {
		// 登录事件
		eventEmiiter.emit(EventType.logIn);

		// 重定向
		const { from } = this.props.location.state || {
			from: { pathname: '/structuralize' }
		};

		this.props.history.replace(from.pathname);
		this.setState({
			userInfo: loginInfo.userInfo
		});

		// 获取全局的车辆配置
		VehicleBrandManager.initConfig();
	};

	logOut = (): void => {
		// 登出
		UserAuthRequests.logOut()
			.then(() => {
				// do nothing;
				LoginStateManager.clearLoginState();
				this.props.history.replace('/login');
				this.setState({
					userInfo: null
				});

				// 发送登出事件
				eventEmiiter.emit(EventType.logout);
			})
			.catch((error: Error) => {
				console.error(error);
				LoginStateManager.clearLoginState();
				if (!(error instanceof UnAuthorizedError)) {
					//
					this.props.history.replace('/login');
				}

				this.setState({
					userInfo: null
				});
			});
	};

	updateUserInfo = (info: Partial<IFUserInfo>) => {
		// @ts-ignore
		this.setState((prevState: StateType) => {
			if (prevState.userInfo) {
				return {
					userInfo: { ...prevState.userInfo, ...info }
				};
			} else {
				return {};
			}
		});
	};

	render() {
		let provider: UserInfoContextType = {
			userInfo: this.state.userInfo,
			loginIn: this.login,
			logOut: this.logOut,
			updateUserInfo: this.updateUserInfo
		};
		return (
			<Provider store={store}>
				<UserInfoContext.Provider value={provider}>
					<div style={{ height: '100%' }}>
						<Switch>
							<Route exact path="/login" component={Login} />
							<Route path="/structuralize" component={Home} />
							<Route
								render={(props) => {
									return (
										<Redirect
											to={{
												pathname: '/login'
											}}
										/>
									);
								}}
							/>
						</Switch>
					</div>
				</UserInfoContext.Provider>
			</Provider>
		);
	}
}

export default withRouter(App);

// // 测试task queue
// let taskQueue = new TaskQueue();

// // taskQueue.addItem();
// taskQueue.addItem(new TestTask1());
// taskQueue.addItem(
// 	new TaskQueueDecorateItem(new TestTask1(), new TestTask3(), new TestTask2())
// );
// taskQueue.addItem(new TaskQueueSequenceItem(new TestTask3(), new TestTask2()));
