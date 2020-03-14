import {
	EAuthorityOperator,
	IFOperationInfo,
	HttpMethod
} from './operation-type';
import { getAuthRequestUrl } from '../_util';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { ValidateTool } from 'ifutils/validate-tool';
import { CommonResponseDataType } from 'sttypedefine';

/**
 * 新增操作
 * @param {string} name 操作名称
 * @param {string} operationUrl 操作url地址, /collection/...../
 * @param {HttpMethod} method 操作请求方法
 * @param {EAuthorityOperator} rightType 操作权限
 * @returns {Promise<IFOperationInfo>} 操作信息
 */
async function addOperation(
	name: string,
	operationUrl: string,
	method: HttpMethod,
	rightType: EAuthorityOperator
): Promise<IFOperationInfo> {
	let url = getAuthRequestUrl('/operation/1.0');

	let result: IFResponse<
		CommonResponseDataType<IFOperationInfo>
	> = await IFRequest.post(url, {
		name: name,
		url: operationUrl,
		method: method,
		rightType: rightType
	});

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IFOperationInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IFOperationInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	return data;
}

/**
 * 编辑操作
 * @param {string} operationId 操作id
 * @param {Partial<IFOperationInfo>} payload 请求参数
 * @returns {Promise<IFOperationInfo>} IFOperationInfo
 */
async function editOperation(
	operationId: string,
	payload: Partial<IFOperationInfo>
): Promise<IFOperationInfo> {
	let url = getAuthRequestUrl('/operation/1.0');

	let result: IFResponse<
		CommonResponseDataType<IFOperationInfo>
	> = await IFRequest.put(url, payload);

	// @ts-ignore  serverdata
	let serverData: CommonResponseDataType<
		IFOperationInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IFOperationInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	return data;
}

/**
 * 删除权限
 * @param {string} operationId 权限id
 * @returns {Promise<void>} void
 */
async function deleteOperation(operationId: string) {
	let url = getAuthRequestUrl(`/operation/${operationId}/1.0`);

	await IFRequest.delete(url);

	return;
}

export const OperationRequest = {
	addOperation: addOperation,
	editOperation: editOperation,
	deleteOperation: deleteOperation
};
