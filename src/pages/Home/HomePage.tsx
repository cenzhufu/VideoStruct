import * as React from 'react';
import { Route, match, Switch, Redirect } from 'react-router-dom';
import Analysis from 'stpages/Analysis';
import Search from 'stpages/Search';
import Monitor from 'stpages/Monitor';
import Setting from 'stpages/Setting';
import UserCenter from 'stpages/UserCenter';
import LiveVedio from 'stpages/live-vedio';
import AuthVerifyRoute from 'stcomponents/auth-verify-route';

import NavigationBar, { MenuItemKey } from 'stcomponents/navigation-bar';
import { Layout } from 'antd';

import style from './assets/styles/index.module.scss';
import STComponent from 'stcomponents/st-component';
import * as H from 'history';
import { IFStructuralInfo } from 'stsrc/type-define';
import { saveStructuralInfoMemo } from '../Search/views/search-result-page';

import eventEmiiter, { EventType } from 'stutils/event-emit';

const { Header, Content } = Layout;

type PropsType = {
	match: match;
	history: H.History;
	location: H.Location;
};

type StateType = {
	currentSelectMenuKey: MenuItemKey;
	prevHistoryLocation: string;
};

type SnapshotType = {};

/**
 * 从路径中获得对应的menuItemKey
 * @param {string} path 路径
 * @returns {MenuItemKey} menuItemKey
 */
function getPathToMenuItemKey(path: string): MenuItemKey {
	let lowerPath = path.toLowerCase();
	if (lowerPath.match(/search/)) {
		return MenuItemKey.SearchKey;
	}

	if (lowerPath.match(/monitor/)) {
		return MenuItemKey.MonitorKey;
	}

	if (lowerPath.match(/setting/)) {
		return MenuItemKey.SettingKey;
	}

	if (lowerPath.match(/usercenter/)) {
		return MenuItemKey.SettingKey;
	}

	return MenuItemKey.AnalysisKey;
}

class Home extends STComponent<PropsType, StateType, SnapshotType> {
	// 初始化
	state = {
		currentSelectMenuKey: MenuItemKey.None,
		prevHistoryLocation: ''
	};

	/**
	 * 初始化和重新渲染之前回调函数
	 * @NOTE: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
	 * @param {PropsType} props props
	 * @param {StateType} state state
	 * @returns {null | StateType} 返回Object来更新state, 返回null表明新的props不会引起state的更新
	 */
	static getDerivedStateFromProps(
		props: PropsType,
		state: StateType
	): Partial<StateType> | null {
		if (props.location.pathname !== state.prevHistoryLocation) {
			return {
				prevHistoryLocation: props.location.pathname,
				currentSelectMenuKey: getPathToMenuItemKey(props.location.pathname)
			};
		}

		return null;
	}

	/**
	 * 更新前的回调
	 * @NOTE: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
	 * @param {PropsType} prevProps 上一次的props
	 * @param {StateType} prevState 上一次的state
	 * @return {Object} 返回值会被当作componentDidUpdate的第三个参数
	 */
	// static getSnapshotBeforeUpdate(
	// 	prevProps: PropsType,
	// 	prevState: StateType
	// ): SnapshotType {}

	componentDidMount() {
		// do some request
	}

	changeToAnalysisPage = () => {
		this.props.history.push(`${this.props.match.url}/analysis`);
	};

	changeToSearchPage = () => {
		this.props.history.push(`${this.props.match.url}/search`);
	};

	changeToMonitorPage = () => {
		this.props.history.push(`${this.props.match.url}/monitor`);
	};

	changeToUserCenterPage = () => {
		this.props.history.push(`${this.props.match.url}/usercenter`);
	};

	changeToSettingPage = () => {
		this.props.history.push(`${this.props.match.url}/setting`);
	};

	onQuickSearch = (structuralInfo: IFStructuralInfo) => {
		// window.open(`${this.props.match.url}/search/result`);
		// window.open(`${this.props.match.url}/search/result`, '_self');

		// 判断当前页面是否在search/里边
		if (window.location.pathname.match(/search/)) {
			// 不做处理，因为search result监听了storage事件
			// this.props.history.push({
			// 	pathname: `${this.props.match.url}/search/result`
			// });
			// 发送emit
			eventEmiiter.emit(EventType.draggedNewStrucutralItem, structuralInfo);
		} else {
			// 其他的转跳
			// 记录
			saveStructuralInfoMemo([structuralInfo]);
			window.open(`${this.props.match.url}/search/result`);
		}
	};

	render() {
		// const url = this.props.match.url;
		const layout = (
			<Layout style={{ height: '100%', width: '100%' }}>
				<Header className={style['header-bar']}>
					{
						// @ts-ignore
						<NavigationBar
							currentSelectMenuKey={this.state.currentSelectMenuKey}
							changeToUserCenterPage={this.changeToUserCenterPage}
							changeToMonitorPage={this.changeToMonitorPage}
							changeToSearchPage={this.changeToSearchPage}
							changeToAnalysisPage={this.changeToAnalysisPage}
							changeToSettingPage={this.changeToSettingPage}
							onQuickSearch={this.onQuickSearch}
						/>
					}
				</Header>
				<Content className={style['app-content']}>
					<Switch>
						<AuthVerifyRoute
							path={`${this.props.match.url}/analysis`}
							component={Analysis}
						/>
						<AuthVerifyRoute
							path={`${this.props.match.url}/search`}
							component={Search}
						/>
						<AuthVerifyRoute
							path={`${this.props.match.url}/monitor`}
							component={Monitor}
						/>
						<AuthVerifyRoute
							path={`${this.props.match.url}/setting`}
							component={Setting}
						/>
						<AuthVerifyRoute
							path={`${this.props.match.url}/usercenter`}
							component={UserCenter}
						/>
						<AuthVerifyRoute
							path={`${this.props.match.url}/livevedio/:deviceId`}
							component={LiveVedio}
						/>
						<Route
							render={(props) => {
								return (
									<Redirect
										to={{
											pathname: `${props.match.url}/search` // NOTE: 默认搜索页
										}}
									/>
								);
							}}
						/>
					</Switch>
				</Content>
			</Layout>
		);
		return layout;
	}
}

export default Home;
