import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { IFOrganizationTree, CommonResponseDataType } from 'sttypedefine';
import { getAuthRequestUrl } from '../_util';
import { toFOrganizationFromB } from './to-organization-adaptor';

export interface IBOrganizationTree {
	id: string;
	parentId: string;
	orgName: string;
	description: string;
	sort: number;
	createTime: string;
	updateTime: string;
	deletedFlg: number;
	type: string;
	channel: string;
	childList: Array<IBOrganizationTree>;
	hover: boolean;
}

/**
 * 根据组织机构查询所在子组织机构树（还是跟用户有关）
 * @param {string | undefined} [orgName] 组织机构名称,不传则查询全部
 * @returns {Promise<Array<IFOrganizationTree>>} 组织树
 */
async function inquireOrganizationsByNode(
	orgName?: string
): Promise<Array<IFOrganizationTree>> {
	let url = getAuthRequestUrl(`/organization/tree/1.0`);

	let result: IFResponse<
		CommonResponseDataType<IBOrganizationTree>
	> = await IFRequest.post(url, {
		orgName
	});

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBOrganizationTree
	> = ValidateTool.getValidObject(result['data'], {});

	let data: IBOrganizationTree[] = ValidateTool.getValidArray(
		serverData['data']
	);

	// @ts-ignore
	return toFOrganizationTreeFromB(data);
}

/**
 * 新增组织结构
 * @param {string} parentId 父级结构id
 * @param {string} orgName	机构名称
 * @param {string} description	描述
 * @returns {Promise<IBOrganizationTree>} 组织信息
 */
async function addOrganization(
	parentId: string,
	orgName: string,
	description: string
): Promise<IBOrganizationTree> {
	let url = getAuthRequestUrl('/organization/1.0');

	let result: IFResponse<IBOrganizationTree> = await IFRequest.post(url, {
		parentId: parentId,
		orgName: orgName,
		description: description
	});

	//@ts-ignore
	let data = ValidateTool.getValidObject(result['data'], {});
	//@ts-ignore
	return data;
}

/**
 * 编辑上组织机构
 * @param {string} id				组织机构id
 * @param {string} parentId	父级结构id
 * @param {string} orgName	机构名称
 * @param {string} description	机构描述
 * @returns {Promise<IBOrganizationTree>} 组织信息
 */
async function editOrganization(
	id: string,
	parentId: string,
	orgName: string,
	description: string = ''
): Promise<IBOrganizationTree> {
	let url = getAuthRequestUrl('/organization/1.0');

	let result: IFResponse<IBOrganizationTree> = await IFRequest.put(url, {
		id: id,
		parentId: parentId,
		orgName: orgName,
		description: description
	});

	let data = ValidateTool.getValidObject(result['data'], {});
	//@ts-ignore
	return data;
}

/**
 * 组织结构删除
 * @param {string} id		组织机构id
 * @returns {Promise<IBOrganizationTree>} Boolean
 */
async function deleteOrganization(id: string): Promise<boolean> {
	let url = getAuthRequestUrl(`/organization/${id}/1.0`);

	await IFRequest.delete(url, {});

	return true;
}

function toFOrganizationTreeFromB(
	result: Array<IBOrganizationTree>,
	level: number = 1
): Array<IFOrganizationTree> {
	let data: Array<IFOrganizationTree> = [];
	if (result) {
		for (let item of result) {
			data.push(toFOrganizationFromB(item, null, 1));
		}
	}
	return data;
}

export const OrganizationRequests = {
	addOrganization: addOrganization,
	editOrganization: editOrganization,
	deleteOrganization: deleteOrganization,
	inquireOrganizationsByNode: inquireOrganizationsByNode
};
