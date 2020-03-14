import { IBModuleTreeNode } from './../module/module-type';
import { ListType, CommonResponseDataType } from 'stsrc/type-define';
import { RoleUserType } from './../user-type';
import { getAuthRequestUrl } from '../_util';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { ValidateTool } from 'ifutils/validate-tool';
import {
	IRoleInfo,
	IRoleAndModuleInfo,
	BUserRoleSearch,
	RoleSearchPayload
} from './role-type';

//查看模块配置
async function searchRoleAuthority(
	type = RoleUserType.Normal
): Promise<Array<IBModuleTreeNode>> {
	let url = getAuthRequestUrl(`/modules/type/${type}/1.0`);

	let result: IFResponse<
		CommonResponseDataType<IBModuleTreeNode>
	> = await IFRequest.get(url);

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IBModuleTreeNode
	> = ValidateTool.getValidObject(result['data'], {});

	// @ts-ignore
	let data: Array<IBModuleTreeNode> = ValidateTool.getValidArray(
		serverData['data']
	);

	// NOTE: 只返回第一个， 返回children
	return ValidateTool.getValidArray(data[0] && data[0]['childList']);
}

// 验证新增和修改时角色名称重复
async function searchAuthorityName(name: string): Promise<any> {
	let url = getAuthRequestUrl(`/role/validate/rolename/1.0`);

	let result: any = await IFRequest.post(url, { name: name });

	// @ts-ignore  serverdata
	let serverData: any = ValidateTool.getValidObject(result['data'], {});
	return serverData;
}

/**
 * 删除角色
 * @param {string} roleId 角色id
 * @returns {Promise<void>} void
 */
async function deleteRole(roleId: string) {
	let url = getAuthRequestUrl(`/role/${roleId}/1.0`);

	await IFRequest.delete(url);

	return;
}

/**
 * 新增角色（包含了模块信息）
 * @param {string} name //{IRoleInfoExcludeId} role 角色信息
 * @param {Array<OnlyModuleIdInfo>} modules 模块信息
 * @param {string} orgId 角色信息
 * @param {RoleUserType} type 用户类型
 * @returns {Promise<IRoleAndModuleInfo>} IRoleAndModuleInfo
 */
async function addRoleAndModules(
	// role: IRoleInfoExcludeId,
	name: string,
	modules: Array<{ moduleId: string }>,
	orgId: string,
	type: RoleUserType = RoleUserType.Normal
): Promise<IRoleAndModuleInfo> {
	let url = getAuthRequestUrl('/role/roleandmodule/1.0');

	let result: IFResponse<
		CommonResponseDataType<IRoleAndModuleInfo>
	> = await IFRequest.post(url, {
		name: name,
		orgId: orgId,
		// component:
		moduleInfoList: modules,
		type: type
	});

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IRoleAndModuleInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IRoleAndModuleInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	return data;
}

// /**
//  * 编辑角色和模块信息
//  * @param {string} orgId 组织
//  * @param {IRoleAndModuleInfoExcludeId} payload 请求参数
//  * @returns {Promise<IRoleAndModuleInfo>} IRoleAndModuleInfo
//  */
async function editRoleAndModules(
	name: string,
	modules: Array<{ moduleId: string }>,
	id: string
): Promise<IRoleAndModuleInfo> {
	let url = getAuthRequestUrl('/role/roleandmodule/1.0');

	let result: IFResponse<
		CommonResponseDataType<IRoleAndModuleInfo>
	> = await IFRequest.put(url, {
		// orgId: orgId,
		// ...payload
		name: name,
		id: id,
		moduleInfoList: modules
	});

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IRoleAndModuleInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IRoleAndModuleInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	return data;
}

/**
 * 获得组织下的所有角色
 * @param {string} orgId 组织id
 * @returns {Promise<Array<IRoleInfo>>} Array<IRoleInfo>
 */
async function getRolesInOrg(orgId: string): Promise<ListType<IRoleInfo>> {
	let url = getAuthRequestUrl(`/role/orgid/${orgId}/1.0`);

	let result: IFResponse<
		CommonResponseDataType<Array<IRoleInfo>>
	> = await IFRequest.get(url);

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		Array<IRoleInfo>
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let roles: Array<IRoleInfo> = ValidateTool.getValidArray(
		serverData['data'],
		[]
	);

	// NOTE: 过滤第一层的全部节点，对于我们没有用
	for (let item of roles) {
		let realChildren = item.moduleNames[0].childList || [];
		item.moduleNames = realChildren;
	}

	let list: ListType<IRoleInfo> = {
		list: roles,
		// 这儿的后台直接使用列表长度
		total: roles.length
	};

	return list;
}

/**
 * 分页查询用户角色列表接口
 * @param {RoleSearchPayload} payload
 * @returns {Promise<Array<BUserRoleSearch>>}
 */

async function inquireUserRoleByLevel(
	payload: RoleSearchPayload
): Promise<Array<BUserRoleSearch>> {
	let url = getAuthRequestUrl(`/role/querypage/1.0`);

	let result: IFResponse<BUserRoleSearch> = await IFRequest.post(url, payload);

	// @ts-ignore
	let data = ValidateTool.getValidObject(result['data'], { data: [] });
	// @ts-ignore
	return data.data || [];
}

export const RoleRequest = {
	searchRoleAuthority: searchRoleAuthority,
	searchAuthorityName: searchAuthorityName,
	// addRole: addRole,
	// editRole: editRole,
	deleteRole: deleteRole,
	inquireUserRoleByLevel: inquireUserRoleByLevel,
	addRoleAndModules: addRoleAndModules,
	editRoleAndModules: editRoleAndModules,
	getRolesInOrg: getRolesInOrg
};
