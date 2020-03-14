import { getAuthRequestUrl } from '../_util';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { ValidateTool } from 'ifutils/validate-tool';
import { CommonResponseDataType } from 'sttypedefine';
import { IModuleInfo, IBModuleTreeNode } from './module-type';
import { RoleUserType } from '../user-type';

/**
 * 新建模块（模块由操作组成）
 * @param {string} name 名字
 * @param {Array<string>} operatorIds 操作id集合
 * @param {string} parentId 父模块id
 * @returns {Promise<IModuleInfo>} 模块信息
 */
async function addNewModule(
	name: string,
	operatorIds: Array<string>,
	parentId: string
): Promise<IModuleInfo> {
	let url = getAuthRequestUrl('/module/1.0');

	let result: IFResponse<
		CommonResponseDataType<IModuleInfo>
	> = await IFRequest.post(url, {
		name: name,
		parent_id: parentId,
		operationIds: operatorIds
	});

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IModuleInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IModuleInfo = ValidateTool.getValidObject(serverData['data'], {});

	return data;
}

/**
 * 编辑模块
 * @param {string} id 模块id
 * @param {Partial<IModuleInfo>} payload 要修改的信息
 * @returns {Promise<IModuleInfo>} 模块信息
 */
async function editModuleInfo(id: string, payload: Partial<IModuleInfo>) {
	let url = getAuthRequestUrl('/module/1.0');

	let result: IFResponse<
		CommonResponseDataType<IModuleInfo>
	> = await IFRequest.put(url, payload);

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IModuleInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IModuleInfo = ValidateTool.getValidObject(serverData['data'], {});

	return data;
}

/**
 * 删除模块
 * @param {string} id 模块id
 * @returns {Promise<void>} 返回值
 */
async function deleteModule(id: string) {
	let url = getAuthRequestUrl(`/module/${id}/1.0`);

	await IFRequest.delete(url);

	return;
}

/**
 * 获取模块的树状结构
 * @param {RoleUserType} type 用户类型
 * @returns {IBModuleTreeNode} IBModuleTreeNode
 */
async function getModuleTree(
	type = RoleUserType.Normal
): Promise<IBModuleTreeNode> {
	let url = getAuthRequestUrl(`/modules/type/${type}/1.0`);

	let result: IFResponse<
		CommonResponseDataType<IBModuleTreeNode>
	> = await IFRequest.get(url);

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IBModuleTreeNode
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IBModuleTreeNode = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	return data;
}

/**
 * 获取角色下的模块数
 * @param {string} id 角色id
 * @param {RoleUserType} [type=RoleUserType.Normal] 用户类型
 * @returns {Promise<IBModuleTreeNode>} IBModuleTreeNode
 */
async function getModulesInRole(
	id: string,
	type: RoleUserType = RoleUserType.Normal
): Promise<Array<IBModuleTreeNode>> {
	let url = getAuthRequestUrl(`/see/modules/roleid/type/1.0`);

	let result: IFResponse<
		CommonResponseDataType<IBModuleTreeNode>
	> = await IFRequest.post(url, { id: id });

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IBModuleTreeNode
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	// let data: IBModuleTreeNode = ValidateTool.getValidObject(
	// 	serverData['data'],
	// 	{}
	// );

	//
	let data: IBModuleTreeNode = ValidateTool.getValidObject(serverData['data']);
	return ValidateTool.getValidArray(data[0] && data[0]['childList']);
}

export const ModuleRequest = {
	addNewModule: addNewModule,
	editModuleInfo: editModuleInfo,
	deleteModule: deleteModule,
	getModuleTree: getModuleTree,
	getModulesInRole: getModulesInRole
};
