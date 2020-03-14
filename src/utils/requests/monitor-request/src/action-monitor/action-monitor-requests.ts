import { ESortType, ListType } from 'sttypedefine';
import { ValidateTool } from 'ifutils/validate-tool';
import { CommonResponseDataType } from 'stsrc/type-define';
import IFRequest, {
	IFRequestConfig,
	IFResponse
} from 'ifvendors/utils/requests';
import { getMonitorRequestUrl } from '../_utils';
import { IFActionMonitorInfo } from './types';

type ExceptCameraIdType = Pick<
	IFActionMonitorInfo,
	Exclude<keyof IFActionMonitorInfo, 'cameraId' | 'cameraIds'>
>;

/**
 * 新增行为布控
 * @param {Array<string>} cameraIds 摄像头id列表
 * @param {ExceptCameraIdType} params 其他参数，必传type
 * @param {IFRequestConfig} [options={}] 请求的选项
 * @returns {Promise<IFActionMonitorInfo>} 返回信息
 */
async function addNewActionMonitor(
	cameraIds: Array<string>,
	params: ExceptCameraIdType,
	options: IFRequestConfig = {}
): Promise<IFActionMonitorInfo> {
	let url = getMonitorRequestUrl(
		'/api/intellif/monitor/behavior/config/insert/1.0'
	);

	let realParams: IFActionMonitorInfo = { ...params };
	if (cameraIds.length > 1) {
		realParams['cameraIds'] = cameraIds.join(',');
	} else {
		realParams['cameraId'] = cameraIds[0];
	}

	let result: IFResponse<
		CommonResponseDataType<IFActionMonitorInfo>
	> = await IFRequest.post(url, realParams, options);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFActionMonitorInfo
	> = ValidateTool.getValidObject(result['data']);

	// TODO: 数据验证
	// @ts-ignore
	let data: IFActionMonitorInfo = ValidateTool.getValidObject(
		serverData['data']
	);

	return data;
}

/**
 * 删除行为布控
 * @param {Array<string>} cameraIds 摄像头id列表
 * @param {Partial<ExceptCameraIdType>} [params={}] 其他参数
 * @param {IFRequestConfig} [options={}] 请求的选项
 * @returns {Promise<IFActionMonitorInfo>} 返回信息
 */
async function deleteActionMonitor(
	cameraIds: Array<string>,
	params: Partial<ExceptCameraIdType> = {},
	options: IFRequestConfig = {}
): Promise<IFActionMonitorInfo> {
	let url = getMonitorRequestUrl(
		'/api/intellif/monitor/behavior/config/delete/1.0'
	);

	// @ts-ignore
	let realParams: IFActionMonitorInfo = { ...params };
	if (cameraIds.length > 1) {
		realParams['cameraIds'] = cameraIds.join(',');
	} else {
		realParams['cameraId'] = cameraIds[0];
	}

	let result: IFResponse<
		CommonResponseDataType<IFActionMonitorInfo>
	> = await IFRequest.post(url, realParams, options);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFActionMonitorInfo
	> = ValidateTool.getValidObject(result['data']);

	// TODO: 数据验证
	// @ts-ignore
	let data: IFActionMonitorInfo = ValidateTool.getValidObject(
		serverData['data']
	);

	return data;
}

/**
 * 更新行为布控
 * @param {Array<string>} cameraIds 摄像头id列表
 * @param {ExceptCameraIdType} params 其他参数，必传type
 * @param {IFRequestConfig} [options={}] 请求的选项
 * @returns {Promise<IFActionMonitorInfo>} 返回信息
 */
async function modifyActinMonitor(
	cameraIds: Array<string>,
	params: ExceptCameraIdType,
	options: IFRequestConfig = {}
): Promise<IFActionMonitorInfo> {
	let url = getMonitorRequestUrl(
		'/api/intellif/monitor/behavior/config/update/1.0'
	);

	// @ts-ignore
	let realParams: IFActionMonitorInfo = { ...params };
	if (cameraIds.length > 1) {
		realParams['cameraIds'] = cameraIds.join(',');
	} else {
		realParams['cameraId'] = cameraIds[0];
	}

	let result: IFResponse<
		CommonResponseDataType<IFActionMonitorInfo>
	> = await IFRequest.post(url, realParams, options);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFActionMonitorInfo
	> = ValidateTool.getValidObject(result['data']);

	// TODO: 数据验证
	// @ts-ignore
	let data: IFActionMonitorInfo = ValidateTool.getValidObject(
		serverData['data']
	);

	return data;
}

/**
 * 查询行为布控
 * @param {Array<string>} cameraIds 摄像头id列表
 * @param {Partial<ExceptCameraIdType>} [params={}] 其他参数
 * @param {IFRequestConfig} [options={}] 请求的选项
 * @returns {Promise<IFActionMonitorInfo[]>} 返回信息
 */
async function queryActionMonitor(
	cameraIds: Array<string> = [],
	params: Partial<ExceptCameraIdType>,
	options: IFRequestConfig = {}
) {
	let url = getMonitorRequestUrl(
		'/api/intellif/monitor/behavior/config/find/1.0'
	);

	// @ts-ignore
	let realParams: IFActionMonitorInfo = { ...params };
	if (cameraIds.length > 1) {
		realParams['cameraIds'] = cameraIds.join(',');
	} else if (cameraIds.length === 1) {
		realParams['cameraId'] = cameraIds[0];
	}

	let result: IFResponse<
		CommonResponseDataType<IFActionMonitorInfo>
	> = await IFRequest.post(
		url,
		{ ...realParams, sortType: ESortType.Descend }, // 逆序
		options
	);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFActionMonitorInfo
	> = ValidateTool.getValidObject(result['data']);

	// TODO: 数据验证
	// @ts-ignore
	let data: IFActionMonitorInfo[] = ValidateTool.getValidArray(
		serverData['data']
	);

	return data;
}

/**
 * 历史记录（NOTE: 简易版本)
 * @param {string} userId 用户id
 * @param {number} page 分页page
 * @param {number} pageSize 分页pageSize
 * @param {IFRequestConfig} [options={}] 请求的其他参数
 * @returns {Promise<ListType<IFActionMonitorInfo>>} 返回的参会
 */
async function getHistoryMonitorInfoList(
	userId: string,
	page: number = 1,
	pageSize: number = 100,
	options: IFRequestConfig = {}
): Promise<ListType<IFActionMonitorInfo>> {
	let url = getMonitorRequestUrl(
		'/api/intellif/monitor/behavior/alarm/find/1.0'
	);

	// @ts-ignore

	let result: IFResponse<
		CommonResponseDataType<IFActionMonitorInfo>
	> = await IFRequest.post(
		url,
		{
			userId: userId,
			page: page,
			pageSize: pageSize,
			sortType: ESortType.Descend
		}, // 逆序
		options
	);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFActionMonitorInfo
	> = ValidateTool.getValidObject(result['data']);

	// TODO: 数据验证
	// @ts-ignore
	let data: IFActionMonitorInfo[] = ValidateTool.getValidArray(
		serverData['data']
	);

	return {
		total: ValidateTool.getValidNumber(serverData, 0),
		list: data
	};
}

const ActionMonitorRequests = {
	addNewActionMonitor: addNewActionMonitor,
	deleteActionMonitor: deleteActionMonitor,
	modifyActinMonitor: modifyActinMonitor,
	queryActionMonitor: queryActionMonitor,
	getHistoryMonitorInfoList: getHistoryMonitorInfoList
};

export default ActionMonitorRequests;
