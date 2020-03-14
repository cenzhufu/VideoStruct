import * as React from 'react';
import * as intl from 'react-intl-universal';
import { Layout, Menu } from 'antd';
import ModuleStyle from './assets/styles/index.module.scss';
import { match, Switch, Redirect, Route, Link } from 'react-router-dom';
import AuthVerifyRoute from 'stcomponents/auth-verify-route';

import UnitsManagement from './views/setting-units-management';
import DataManagement from './views/setting-data-management';
import RecordSearch from './views/setting-record-management';
import AccountManagement from './views/setting-account-management';
import CamerasManagement from './views/setting-cameras-management';
import AreaManagement from './views/settting-area-management';
import AuthorityManagement from './views/setting-authority-management';
import { withUserInfo, UserInfoContextType } from 'stsrc/contexts';
import { EUserAuthorityType } from 'stsrc/type-define';

import { ArrowIconComponent } from 'stsrc/components/icons';
import STComponent from 'stcomponents/st-component';
import { getvwInJS } from 'stsrc/assets/styles/js-adapt';
import AreaAndDevicemanagement from './views/setting-device-managememt';
const { Sider, Content } = Layout;

interface PropTypes extends UserInfoContextType {
	match: match;
}
interface StateType {
	showModule: string;
}
class Setting extends STComponent<PropTypes, StateType> {
	render() {
		return (
			<div className={`${ModuleStyle['setting-advance']}`}>
				<Layout>
					<Sider
						className={`${ModuleStyle['setting-advance-sider-menus']}`}
						width={getvwInJS(328)}
					>
						<div className={`${ModuleStyle['setting-advance-title-block']}`}>
							<span className={`${ModuleStyle['setting-advance-title']}`}>
								{intl.get('ADVANCE_SETTING').d('高级设置')}
							</span>
						</div>
						<div className={`${ModuleStyle['setting-advance-menus']}`}>
							<Menu style={{ borderRight: 'none' }} mode={'inline'}>
								{this.props.userInfo &&
									this.props.userInfo.hasAccountSettingAuthority && (
										<Menu.Item
											className={`${ModuleStyle['setting-advance-submenu']}`}
										>
											<Link
												to={`${this.props.match.url}/accounts`}
												className={`${
													ModuleStyle['setting-advance-submenu-link']
												}`}
												style={{ textDecoration: 'none' }}
											>
												<span
													className={`${
														ModuleStyle['setting-advance-submenu-title']
													}`}
												>
													{/* <Icon component={AccountLogo} /> */}
													<div className={ModuleStyle['account']} />
													{intl.get('ACCOUNTS_MANAGEMENT').d('账号管理')}
													{<ArrowIconComponent />}
												</span>
											</Link>
										</Menu.Item>
									)}
								{this.props.userInfo &&
									this.props.userInfo.hasUnitSettingAuthority && (
										<Menu.Item
											className={`${ModuleStyle['setting-advance-submenu']}`}
										>
											<Link
												to={`${this.props.match.url}/units`}
												className={`${
													ModuleStyle['setting-advance-submenu-link']
												}`}
												style={{ textDecoration: 'none' }}
											>
												<span
													className={`${
														ModuleStyle['setting-advance-submenu-title']
													}`}
												>
													{/* <Icon component={UnitsLogo} /> */}
													<div className={ModuleStyle['unit']} />
													{intl.get('UNITIES_MANAGEMENT').d('单位管理')}
													{<ArrowIconComponent />}
												</span>
											</Link>
										</Menu.Item>
									)}

								{this.props.userInfo && this.props.userInfo.isSuperUser && (
									<Menu.Item
										className={`${ModuleStyle['setting-advance-submenu']}`}
									>
										{
											<Link
												to={`${this.props.match.url}/auth`}
												className={`${
													ModuleStyle['setting-advance-submenu-link']
												}`}
												style={{ textDecoration: 'none' }}
											>
												{
													<span
														className={`${
															ModuleStyle['setting-advance-submenu-title']
														}`}
													>
														{/* <Icon component={AuthorityLogo} /> */}
														<div className={ModuleStyle['role']} />
														{intl.get('AUTHORITY_MANAGEMENT').d('权限管理')}
														{<ArrowIconComponent />}
													</span>
												}
											</Link>
										}
									</Menu.Item>
								)}
								{this.props.userInfo &&
									this.props.userInfo.hasCameraSettingAuthority && (
										<Menu.Item>
											<Link to={`${this.props.match.url}/device`}>
												<div
													className={`${
														ModuleStyle['setting-advance-submenu-title']
													}`}
												>
													<div className={ModuleStyle['device']} />
													{intl.get('CAMERAS_MANAGEMENT').d('设备管理')}
												</div>
											</Link>
										</Menu.Item>
										// <SubMenu
										// 	title={
										// 		<span
										// 			className={`${
										// 				ModuleStyle['setting-advance-submenu-title']
										// 			}`}
										// 		>
										// 			{/* <Icon component={CamerasLogo} /> */}
										// 			<div className={ModuleStyle['device']} />
										// 			{intl.get('CAMERAS_MANAGEMENT').d('设备管理')}
										// 		</span>
										// 	}
										// >
										// 	<Menu.Item>
										// 		<Link
										// 			to={`${this.props.match.url}/area`}
										// 			className={`${
										// 				ModuleStyle['setting-advance-submenu-link']
										// 			}`}
										// 			style={{ textDecoration: 'none' }}
										// 		>
										// 			<span
										// 				className={`${
										// 					ModuleStyle['setting-advance-submenu-title']
										// 				}`}
										// 			>
										// 				{intl.get('CAMERAS_MANAGEMENT_AREA').d('区域管理')}
										// 			</span>
										// 		</Link>
										// 	</Menu.Item>
										// 	<Menu.Item>
										// 		<Link
										// 			to={`${this.props.match.url}/cameras`}
										// 			className={`${
										// 				ModuleStyle['setting-advance-submenu-link']
										// 			}`}
										// 			style={{ textDecoration: 'none' }}
										// 		>
										// 			<span
										// 				className={`${
										// 					ModuleStyle['setting-advance-submenu-title']
										// 				}`}
										// 			>
										// 				{intl
										// 					.get('CAMERAS_MANAGEMENT_CAMERAS')
										// 					.d('摄像头管理')}
										// 			</span>
										// 		</Link>
										// 	</Menu.Item>
										// </SubMenu>
									)}
								{this.props.userInfo &&
									this.props.userInfo.hasDataManagerAuthority && (
										<Menu.Item
											className={`${ModuleStyle['setting-advance-submenu']}`}
											key={'sub4'}
										>
											{
												<Link
													to={`${this.props.match.url}/data`}
													className={`${
														ModuleStyle['setting-advance-submenu-link']
													}`}
													style={{ textDecoration: 'none' }}
												>
													<span
														className={`${
															ModuleStyle['setting-advance-submenu-title']
														}`}
													>
														{/* <Icon component={DataLogo} /> */}
														<div className={ModuleStyle['data']} />
														{intl.get('DATA_MANAGEMENT').d('数据管理')}
														{<ArrowIconComponent />}
													</span>
												</Link>
											}
										</Menu.Item>
									)}

								{this.props.userInfo &&
									this.props.userInfo.hasRecordManagerAuthority && (
										<Menu.Item
											className={`${ModuleStyle['setting-advance-submenu']}`}
											key={'sub5'}
										>
											{
												<Link
													to={`${this.props.match.url}/records`}
													className={`${
														ModuleStyle['setting-advance-submenu-link']
													}`}
													style={{ textDecoration: 'none' }}
												>
													<span
														className={`${
															ModuleStyle['setting-advance-submenu-title']
														}`}
													>
														{/* <Icon component={RecordLogo} /> */}
														<div className={ModuleStyle['record']} />
														{intl.get('RECORD_SEARCH').d('记录查询')}
														{<ArrowIconComponent />}
													</span>
												</Link>
											}
										</Menu.Item>
									)}
							</Menu>
						</div>
					</Sider>
					<Layout className={ModuleStyle['content']}>
						<Content className={ModuleStyle['content']}>
							<Switch>
								<AuthVerifyRoute
									path={`${this.props.match.url}/accounts`}
									component={AccountManagement}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/units`}
									component={UnitsManagement}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/data`}
									component={DataManagement}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/records`}
									component={RecordSearch}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/device`}
									component={AreaAndDevicemanagement}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/area`}
									component={AreaManagement}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/cameras`}
									component={CamerasManagement}
								/>
								<AuthVerifyRoute
									path={`${this.props.match.url}/auth`}
									component={AuthorityManagement}
								/>
								<Route
									render={(props) => {
										return (
											<Redirect
												to={{
													pathname: `${this.props.match.url}/accounts`
												}}
											/>
										);
									}}
								/>
							</Switch>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}

	_isSuperuser() {
		return (
			this.props.userInfo &&
			this.props.userInfo.level === EUserAuthorityType.SuperUser
		);
	}
}

export default withUserInfo(Setting);
