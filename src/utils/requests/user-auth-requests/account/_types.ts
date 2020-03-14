import { IBUserDetailInfo } from './types';
// 类型定义
// 登录接口请求payload类型
export interface LoginInRequestPayloadType {
	username: string;
	password: string;
	grant_type: string; // 'password'
	scope: string; // 'read write'
}

// 登录接口的返回data的类型（后台返回的）
export interface LoginInResponseDataType {
	// oauth_resources: Array<>; // 用户资源信息  暂时不需要关注
	// oauth_roles: Array<>; // 用户角色信息 暂时不需要关注
	user_detail: IBUserDetailInfo; // 用户详情
	expires_in: number; // 过期时间  3006
	scope: string; // 权限方位  "read write"
	refresh_token: string;
	token_type: string; // token的使用方式  "bearer"
	access_token: string; // token  "133ff5d6-e0c8-446e-aba3-3f6b32b2c978",
	respMessage: string; // 提示
	respCode: number; // code
}
