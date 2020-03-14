import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse } from 'ifutils/requests';
import * as intl from 'react-intl-universal';

import * as qs from 'qs';
import * as md5 from 'md5';
import { CommonResponseDataType, ListType, IFUserInfo } from 'sttypedefine';

import { LoginInRequestPayloadType, LoginInResponseDataType } from './_types';
import { IFLoginState, IFUserLoginInfo, IBUserInfo } from './types';
import { getAuthRequestUrl } from '../_util';
import LoginStateManager from 'stsrc/utils/login-state';
import { IBModuleTreeNode } from '../module/module-type';
import { initUserInfoAdditionProperty } from './_utils';
import Config from 'stconfig';
import {
	addThumbFlagToImageUrlIfNeeded,
	EThumbFlag
} from 'stutils/requests/tools';
import { toFUserInfoFromB } from './to-user-info-adaptor';

/**
 * 登陆接口
 * @param {string} userName 用户账号
 * @param {string} passWord 用户密码
 * @returns {Promise<{IFUserLoginInfo}>} 接口返回
 */
async function loginIn(
	userName: string,
	passWord: string
): Promise<IFUserLoginInfo> {
	// 参数检测
	if (!userName || !passWord) {
		return Promise.reject(intl.get('ERROR_PARAMETERS').d('无效的参数'));
	}
	let requestUrl = getAuthRequestUrl('/oauth/token');

	let data: LoginInRequestPayloadType = {
		username: userName,
		password: md5(passWord),
		grant_type: 'password',
		scope: 'read write'
	};

	let result: IFResponse<LoginInResponseDataType> = await IFRequest.post(
		requestUrl,
		qs.stringify(data),
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				// 理论上是通过用户的账号密码动态生成的，权限服务居然把这里写死了
				// 活久见
				// token: 'Basic ' + btoa(userName + ':' + passWord)
				token: 'Basic ' + btoa('superuser:123456')
			}
		}
	);

	// @ts-ignore
	let resData: LoginInResponseDataType = ValidateTool.getValidObject(
		result['data'],
		{}
	);

	let state: IFLoginState = {
		token: ValidateTool.getValidString(resData['access_token']),
		tokenType: ValidateTool.getValidString(resData['token_type']),
		expires: ValidateTool.getValidNumber(resData['expires_in'], 1800)
	};
	// @ts-ignore
	let userDetail: IBUserDetailInfo = ValidateTool.getValidObject(
		resData['user_detail'],
		{}
	);
	// @ts-ignore
	let userInfo: IBUserInfo = ValidateTool.getValidObject(
		userDetail['userVo'],
		{}
	);

	// 头像的缩略图
	if (userInfo.imageUrl && Config.isThumbnailEnabled()) {
		userInfo.imageUrl = addThumbFlagToImageUrlIfNeeded(
			userInfo.imageUrl,
			EThumbFlag.Thumb200x200
		);
	}

	// 授权的信息
	let moduleInfoList: Array<IBModuleTreeNode> = ValidateTool.getValidArray(
		resData['oauth_resources']
	);

	// 转换
	let fUserInfo: IFUserInfo = toFUserInfoFromB(userInfo);

	// NOTE: 前端添加额外信息
	initUserInfoAdditionProperty(fUserInfo, moduleInfoList || []);

	return {
		loginState: state,
		userInfo: fUserInfo
	};
}

/**
 * 登出接口
 * @returns {Promise<boolean>} 是否成功
 */
async function logOut(): Promise<boolean> {
	let url = getAuthRequestUrl('/logoff/1.0');
	await IFRequest.get(url);

	return Promise.resolve(true);
}

/**
 * 修改密码接口
 * @param {string} newPassword 新密码
 * @param {string} oldPassword 旧密码
 * @param {string} userId 用户id
 * @returns {Promise<boolean>} boolean
 */
async function changePassword(
	newPassword: string,
	oldPassword: string,
	userId: string
): Promise<boolean> {
	let url = getAuthRequestUrl('/user/change/password/1.0');
	await IFRequest.post(url, {
		password: md5(oldPassword),
		newPassword: md5(newPassword),
		id: userId
	});

	return true;
}

// 新增用户的reqeust payload类型
export interface SingInRequestPayloadType {
	name: string; // 用户名
	login: string; // 登录名
	password: string; // 密码
	roleIdList: string; // 角色列表，逗号分隔，目前只支持一个
	orgId: string; // 组织机构id
	imageUrl?: string; // 头像地址
	type?: number; // 用户类型
}

/**
 * 新增用户接口
 * @param {string} userName
 * @param {string} loginName
 * @param {string} password
 * @param {string} roleIdList
 * @param {number} orgId
 * @param {string} imageUrl
 * @returns {Promise<IBUserInfo>}
 */

async function signIn(
	userName: string,
	loginName: string,
	password: string,
	roleIdList: string,
	orgId: string,
	imageUrl: string
): Promise<IFUserInfo> {
	let url = getAuthRequestUrl('/user/create/1.0');
	let result: IFResponse<IBUserInfo> = await IFRequest.post(url, {
		name: userName,
		login: loginName,
		password: md5(password), // md5加密
		roleIdList: roleIdList,
		orgId: orgId,
		imageUrl: imageUrl,
		status: 1, // 启用, 2018.10.11时后台还没有这个默认值
		doVerify: false
	});
	// @ts-ignore
	let data: IBUserInfo = ValidateTool.getValidObject(result['data'], {});

	// 转换
	let fUserInfo: IFUserInfo = toFUserInfoFromB(data);

	return fUserInfo;
}

//1:无账号管理权限验证 2：有账号管理权限验证
export enum UserAuthorityType {
	NoAccoutAuthority = 1,
	HasAccoutAuthority = 2
}

// 修改用户资料的请求payload类型
export interface ModifyUserRequestType {
	id: string;
	name?: string;
	login?: string;
	password?: string;
	orgId?: string;
	roleIdList?: string; // 逗号分隔
	age?: number;
	gender?: number;
	startTime?: string; // YYYY-MM-DD HH:mm:ss
	endTime?: string; // YYYY-MM-DD HH:mm:ss
	imageUrl?: string;
	type?: number; // 用户类型
	doVerify?: boolean; //是否校验单位和权限
	authorityType?: UserAuthorityType;
}

/**
 * 修改用户资料
 * @param {ModifyUserRequestType} payload 请求参数
 * @returns {Promise<IFUserInfo>} 返回值
 */
async function modify(payload: ModifyUserRequestType): Promise<IFUserInfo> {
	let url = getAuthRequestUrl('/user/update/1.0');

	let result: IFResponse<IBUserInfo> = await IFRequest.post(url, payload);
	// @ts-ignore
	let data: IBUserInfo = ValidateTool.getValidObject(
		result['data']['data'],
		{}
	);

	// 转换
	let fUserInfo: IFUserInfo = toFUserInfoFromB(data);

	return fUserInfo;
}

//删除用户payload类型
export interface DeleteUserRequestType {
	userId: string;
	hardDelete?: boolean;
	authorityType?: UserAuthorityType;
}

/**
 * 删除用户  post方法
 * @param {number} userId 		 用户id
 * @returns {Promise<boolean>} 返回值
 */

async function deleteUserPost(
	payload: DeleteUserRequestType
): Promise<boolean> {
	let url = getAuthRequestUrl(`/user/delete/1.0`);

	await IFRequest.post(url, payload);

	return true;
}

/**
 * 获得当前登录用户的信息
 * @returns {Promise<IFUserInfo>} 用户信息
 */
async function getLoginUserInfo(): Promise<IFUserInfo> {
	let url = getAuthRequestUrl(
		`/user/info/1.0?token=${encodeURIComponent(LoginStateManager.getToken())}`
	);

	let result: IFResponse<
		CommonResponseDataType<IBUserInfo>
	> = await IFRequest.post(url);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBUserInfo
	> = ValidateTool.getValidObject(result['data'], {});

	// 实在不想写这个类型了，累了
	let contentData = ValidateTool.getValidObject(serverData['data']) || {};

	let authModuleList: Array<IBModuleTreeNode> = ValidateTool.getValidArray(
		contentData['oauthResources']
	);

	// @ts-ignore
	let userInfo: IBUserInfo = ValidateTool.getValidObject(contentData['userVo']);

	// 头像的缩略图
	if (userInfo.imageUrl && Config.isThumbnailEnabled()) {
		userInfo.imageUrl = addThumbFlagToImageUrlIfNeeded(
			userInfo.imageUrl,
			EThumbFlag.Thumb200x200
		);
	}

	// 转换
	let fUserInfo: IFUserInfo = toFUserInfoFromB(userInfo);

	// NOTE: 前端添加额外数据
	initUserInfoAdditionProperty(fUserInfo, authModuleList || []);

	return fUserInfo;
}

//搜索类型：0搜索全部; 1只搜索账号和账户名；2.只搜索账号和账户名，角色名称
export enum UserListSearchType {
	ALL = 0,
	AccoutAndName = 1,
	AccoutAndNameAndRole = 2
}

/**
 * 查询用户列表
 * @param {number} pageIndex 页码(从1开始)
 * @param {number} pageSize  每页显示条数
 * @param {string} content   搜索内容
 * @param {string} orgId   	 组织结构ID
 * @returns {Promise<Array<SearchUserListType>>} 用户列表
 */
async function searchUserList(
	pageIndex: number,
	pageSize: number,
	content: string = '',
	orgId?: string
): Promise<ListType<IFUserInfo>> {
	let url = getAuthRequestUrl('/user/list/1.0');

	let result: IFResponse<
		CommonResponseDataType<IBUserInfo>
	> = await IFRequest.post(url, {
		pageIndex: pageIndex,
		pageSize: pageSize,
		content: content,
		orgId: orgId,
		searchType: UserListSearchType.AccoutAndNameAndRole
	});

	let total = ValidateTool.getValidNumber(result['data'].total);
	//@ts-ignore
	let serverData = ValidateTool.getValidObject(result['data'], {});

	let datalist = ValidateTool.getValidArray(
		ValidateTool.getValidArray(serverData['data'])
	);
	//@ts-ignore
	return {
		total: total,
		list: datalist.map((bUserInfo: IBUserInfo) => {
			return toFUserInfoFromB(bUserInfo);
		})
	};
}

export const UserAuthRequests = {
	getAuthRequestUrl: getAuthRequestUrl,
	loginIn: loginIn,
	logOut: logOut,
	changePassword: changePassword,
	signIn: signIn,
	modify: modify,
	deleteUserPost: deleteUserPost,
	getLoginUserInfo: getLoginUserInfo,
	searchUserList: searchUserList
};
