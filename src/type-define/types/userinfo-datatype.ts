// 用户权限身份类型
export enum EUserAuthorityType {
	Normal = 0, // 普通用户
	SuperUser = 1 // 超级管理员
}

export interface IFUserRoleInfo {
	id: string;
	name: string;
}

export interface IFUserInfo {
	id: string;
	name: string;
	account: string;
	password: string;
	organization: string;
	orgId: string;
	avatarUrl: string;
	level: EUserAuthorityType; // 权限身份

	// TODO: User Role info
	roleList: Array<IFUserRoleInfo>;

	isSuperUser: boolean; // 是否超级管理员

	hasDataAceessAuthority: boolean; // 是否有数据接入权限

	hasSettingAuthority: boolean; // 是否有高级设置权限
	hasAccountSettingAuthority: boolean; // 是否有账号管理权限
	hasUnitSettingAuthority: boolean; // 是否有单位管理权限
	hasCameraSettingAuthority: boolean; // 是否有摄像头管理权限
	hasDataManagerAuthority: boolean; // 是否有数据管理权限
	hasRecordManagerAuthority: boolean; // 是否有记录查询权限

	hasAlarmSettingAuthority: boolean; // 是否有告警设置权限
}
