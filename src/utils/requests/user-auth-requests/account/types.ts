import { IFUserInfo } from 'sttypedefine';
import { EUserAuthorityType } from 'stsrc/type-define';

// 用户角色信息
export interface IBUserRoleInfo {
	userId: string;
	roleId: string;
	roleName: string;
	roleCnName: string;
	type?: number;
	orgId?: number;
	authority: string;
}

// 用户信息
export interface IBUserInfo {
	createTime: string; // YYYY-HH-MM hh:mm:ss
	updateTime: string;
	id: string;
	name: string;
	account: string;
	password: string;
	organization: string;
	orgId: string;
	imageUrl?: string;
	startTime: string;
	endTime: string;
	roleList: Array<IBUserRoleInfo>;
	phone?: string;
	email?: string;
	remark?: string;
	creator?: string;
	type?: number;
	status?: number;
	expired?: number;
	loginTimes?: number;
	deletedFlg: 0 | 1;
	orgType: string;
	level: EUserAuthorityType; // 权限身份
}

// 用户全部的资料
export interface IBUserDetailInfo {
	userVo: IBUserInfo;
	// userRoleInfo: Array<IBUserRoleInfo>;
	// operationList: Array<OperatorType>;
}

// 登录态类型
export interface IFLoginState {
	token: string;
	tokenType: string;
	expires: number; // 单位秒
}

// 登录接口返回的data类型（提供给业务层的）
export interface IFUserLoginInfo {
	loginState: IFLoginState;
	userInfo: IFUserInfo;
}
