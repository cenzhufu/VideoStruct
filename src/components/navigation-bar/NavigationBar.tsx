import * as React from 'react';
import * as intl from 'react-intl-universal';
import { Menu, Avatar, Button, Badge, Popover, Tooltip } from 'antd';
import navbarLogo from './assets/imgs/logo.png';
import ModuleStyle from './assets/styles/index.module.scss';
import * as H from 'history';

import { withUserInfo, UserInfoContextType } from 'stcontexts';
// import { DefaultAvatorIconComponent } from 'stcomponents/icons';
import { IFStructuralInfo } from 'stsrc/type-define';
import eventEmiiter, { EventType } from 'stutils/event-emit';

import QuickSearchPanel from 'stcontainers/quick-search-panel';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import STComponent from 'stcomponents/st-component';
import { withRouter, match } from 'react-router';
import FileUploadPanel, {
	FileUploadActionCreators
} from 'stcomponents/file-upload-analysis-panel';
import { connect } from 'react-redux';

function noop() {}

enum MenuItemKey {
	None = '',
	AnalysisKey = '1',
	SearchKey = '2',
	MonitorKey = '3',
	UserCenterKey = '4',
	SettingKey = '5',
	ExitKey = '6',

	// 二期添加
	SourceLibKey = '7',
	SourceAccessKey = '8',
	SourceDownLoad = '9'
}

interface PropsType extends UserInfoContextType {
	currentSelectMenuKey: MenuItemKey;

	// router带过来的属性
	match: match;
	history: H.History;
	location: H.Location;

	// call backs
	changeToUserCenterPage: () => void; // 切换到用户中心页面
	changeToMonitorPage: () => void;
	changeToSearchPage: () => void;
	changeToAnalysisPage: () => void;
	changeToSettingPage: () => void;
	onQuickSearch: (structuralInfo: IFStructuralInfo) => void;

	badgeCount: number;
}

type StateType = {
	showQuickSearchPanel: boolean;
	downloadNumber: number;
	changeIcon: boolean;
	fileUploadIcon: boolean;
	showUploadPanel: boolean;
};

type SnapshotType = {};

class NavigationBar extends STComponent<PropsType, StateType, SnapshotType> {
	static defaultProps = {
		currentSelectMenuKey: MenuItemKey.None,

		changeToAnalysisPage: noop,
		changeToMonitorPage: noop,
		changeToSearchPage: noop,
		changeToUserCenterPage: noop,
		changeToSettingPage: noop,
		logout: noop,
		onQuickSearch: noop,

		badgeCount: 1
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			showUploadPanel: false,
			showQuickSearchPanel: false,
			downloadNumber: 0,
			changeIcon: false,
			fileUploadIcon: false
		};
	}

	componentDidMount() {
		eventEmiiter.addListener(EventType.dragStart, this.dragStartEvent);

		eventEmiiter.addListener(EventType.dragEnd, this.dragEndEvent);
	}

	componentWillUnmount() {
		eventEmiiter.removeListener(EventType.dragStart, this.dragStartEvent);
	}
	dragStartEvent = () => {
		// 数据分析也才设置快速检索
		if (
			window.location.href.match('analysis') ||
			window.location.href.match('search')
		) {
			this.setState({
				showQuickSearchPanel: true
			});
		}
	};

	dragEndEvent = () => {
		this.setState({
			showQuickSearchPanel: false
		});
	};

	onQuickSearch = (structuralInfo: IFStructuralInfo) => {
		this.dragEndEvent();
		this.props.onQuickSearch(structuralInfo);
	};

	changeToAnalysisPage = () => {
		this.props.changeToAnalysisPage();
	};

	changeToMonitorPage = () => {
		this.props.changeToMonitorPage();
	};

	changeToSearchPage = () => {
		this.props.changeToSearchPage();
	};

	changeToUserCenterPage = () => {
		this.props.changeToUserCenterPage();
	};

	changeToSettingPage = () => {
		this.props.changeToSettingPage();
	};

	onExit = () => {
		this.props.logOut();
	};

	needShowReturnButton = () => {
		// 当前路径不为search时显示
		if (this.props.location.pathname.match(/search/)) {
			return false;
		} else {
			return true;
		}
	};
	handleiconchange = () => {
		this.setState({
			changeIcon: true
		});
	};
	handleicondefault = () => {
		this.setState({
			changeIcon: false
		});
	};

	changeFileUploadIcon = () => {
		this.setState({
			fileUploadIcon: true
		});
	};
	defaultFileUploadIcon = () => {
		this.setState({
			fileUploadIcon: false
		});
	};

	onClickSourceItem = () => {
		this.setState({
			showUploadPanel: true
		});
	};

	onVisibleChanged = () => {
		this.setState({
			showUploadPanel: false
		});
	};

	render() {
		const AccountOperation = (
			<div className={ModuleStyle['account-operation']}>
				<span className={ModuleStyle['guide']} />
				<div className={ModuleStyle['account_introduction']}>
					<div className={ModuleStyle['account-item']}>
						<span className={ModuleStyle['labels']}>
							{intl.get('NAVIGATION_ACCOUNT').d('账号')}：
						</span>
						<span>{this.props.userInfo && this.props.userInfo.name}</span>
					</div>
					<div className={ModuleStyle['account-item']}>
						<span className={ModuleStyle['labels']}>
							{intl.get('NAVIGATION_PERMISSION').d('权限')}：
						</span>
						<span>
							{this.props.userInfo && this.props.userInfo.isSuperUser
								? `${intl.get('NAVIGATION_SUPER_USER').d('超级管理员')}`
								: `${intl.get('NAVIGATION_GENERAL_USER').d('超级管理员')}`}
						</span>
					</div>
				</div>
				<div className={ModuleStyle['operation']}>
					<div
						className={ModuleStyle['current']}
						onClick={this.changeToUserCenterPage}
					>
						<span className={ModuleStyle['personIcon']} />
						<span className={ModuleStyle['labels']}>
							{intl.get('NAVIGATION_BAR_PERSONAL').d('个人中心')}
						</span>
					</div>
					{this.props.userInfo && this.props.userInfo.hasSettingAuthority && (
						<div
							className={ModuleStyle['current']}
							onClick={this.changeToSettingPage}
						>
							<span className={ModuleStyle['advancedIcon']} />
							<span className={ModuleStyle['labels']}>
								{intl.get('NAVIGATION_BAR_ADVANCED_MANAGEMENT').d('高级管理')}
							</span>
						</div>
					)}
					<div className={ModuleStyle['current']} onClick={this.onExit}>
						<span className={ModuleStyle['logoutIcon']} />
						<span className={ModuleStyle['labels']}>
							{intl.get('NAVIGATION_BAR_LOGOUT').d('退出登录')}
						</span>
					</div>
				</div>
			</div>
		);

		const UploadPanelEntry = (
			<Badge count={this.props.badgeCount} offset={[10, -4]}>
				<span
					onMouseEnter={this.changeFileUploadIcon}
					onMouseLeave={this.defaultFileUploadIcon}
					className={
						this.state.fileUploadIcon
							? `${ModuleStyle['access-focus-icon']}`
							: `${ModuleStyle['access-icon']}`
					}
				/>
			</Badge>
		);

		return (
			<div className={ModuleStyle['nav-bar-container']}>
				<div className={ModuleStyle['nav-bar-logoBox']}>
					<img
						className={ModuleStyle['nav-bar-logo']}
						src={navbarLogo}
						alt="nav bar logo"
					/>
					<span className={ModuleStyle['interval']}>|</span>
					<span className={ModuleStyle['system-name']}>
						{intl.get('LOGIN_SYSTEM_NAME').d('视频结构化平台')}
					</span>
				</div>
				{this.needShowReturnButton() && (
					<Button
						className={ModuleStyle['return-button']}
						onClick={this.changeToSearchPage}
					>
						{intl.get('NAVIGATION_BAR_RETURN').d('返回首页')}
					</Button>
				)}

				<Menu
					theme="dark"
					mode="horizontal"
					style={{ lineHeight: '64px' }}
					selectedKeys={[this.props.currentSelectMenuKey]}
					className={ModuleStyle['menu-second-part']}
				>
					<Menu.Item
						onClick={this.onClickSourceItem}
						className={ModuleStyle['menu-item']}
						key={MenuItemKey.SourceDownLoad}
					>
						{this.state.showUploadPanel ? (
							<Popover
								visible={true}
								onVisibleChange={this.onVisibleChanged}
								trigger="click"
								overlayClassName={ModuleStyle['popover-color']}
								content={<FileUploadPanel />}
							>
								{UploadPanelEntry}
							</Popover>
						) : (
							<Tooltip
								placement="bottom"
								title={
									<span>
										{intl.get('FILE_UPLOAD_PANEL_ACCESS_SOURCE').d('资源接入')}
									</span>
								}
							>
								{UploadPanelEntry}
							</Tooltip>
						)}
					</Menu.Item>
					<Menu.Item
						className={`${ModuleStyle['menu-item']}`}
						key={MenuItemKey.UserCenterKey}
						onMouseEnter={this.handleiconchange}
						onMouseLeave={this.handleicondefault}
					>
						<Tooltip
							placement="bottom"
							title={<span>{intl.get('MORE_SETTING').d('更多设置')}</span>}
						>
							{this.props.userInfo ? (
								<Popover content={AccountOperation} trigger={'click'}>
									<div className={ModuleStyle['user-info']}>
										{this.props.userInfo.imageUrl ? (
											<Avatar src={this.props.userInfo.imageUrl} />
										) : (
											// <DefaultAvatorIconComponent
											// 	className={ModuleStyle['avator']}
											// />
											<span
												className={
													this.state.changeIcon
														? `${ModuleStyle['avatorfocus']}`
														: `${ModuleStyle['avatordefault']}`
												}
											/>
										)}
										<div style={{ marginLeft: '8px', lineHeight: 0 }}>
											{this.props.userInfo.name}
										</div>
									</div>
								</Popover>
							) : (
								<div className={ModuleStyle['user-info']}>
									{/* <DefaultAvatorIconComponent className={ModuleStyle['avator']} /> */}
									<span className={ModuleStyle['avator']} />
									<div style={{ marginLeft: '8px' }}>
										{intl.get('NAVIGATION_BAR_UNLOGIN').d('未登录')}
									</div>
								</div>
							)}
						</Tooltip>
					</Menu.Item>
				</Menu>
				<ReactCSSTransitionGroup
					className={ModuleStyle['quick-search-transition-group']}
					transitionName={{
						enter: ModuleStyle['enter'],
						enterActive: ModuleStyle['enter-active'],
						leave: ModuleStyle['leave'],
						leaveActive: ModuleStyle['leave-active'],
						appear: ModuleStyle['appear'],
						appearActive: ModuleStyle['appear-active']
					}}
					transitionAppear={true}
					transitionAppearTimeout={200}
					transitionEnter={true}
					transitionEnterTimeout={200}
					transitionLeave={true}
					transitionLeaveTimeout={200}
				>
					{this.state.showQuickSearchPanel && (
						<QuickSearchPanel onQuickSearch={this.onQuickSearch} />
					)}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

//
function mapStateToProps(state) {
	return {
		badgeCount: state[FileUploadActionCreators.reducerName].finishedBadgeCount
	};
}

let ConnnectedNavigationBar = connect(mapStateToProps)(NavigationBar);

export default withUserInfo(withRouter(ConnnectedNavigationBar));
export { MenuItemKey };
