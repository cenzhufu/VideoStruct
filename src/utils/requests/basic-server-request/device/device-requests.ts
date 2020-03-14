import { FDeviceInfoProxy } from './device-proxy';
import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { getBasicInfoRequestUrl } from '../_url';
import {
	IFAreaInfo,
	IFDeviceInfo,
	CommonResponseDataType,
	ListType
} from 'sttypedefine';
import {
	AddDeviceRequestsPayloadType,
	IBDeviceInfo,
	IRGetDeviceListPayload
} from './device-type';
import { toFDviceInfoFromBDeviceInfo } from './to-device-info-adaptor';
import { toFAreaInfoFromBAreaInfo, IBAreaInfo } from '../area';

/**
 * 新增设备
 * @param {AddDeviceRequestsPayloadType} payload 请求参数
 * @returns {Promise<DeviceInfoParser>}  DeviceInfoParser
 */
async function addDevice(
	payload: AddDeviceRequestsPayloadType
): Promise<IFDeviceInfo> {
	let url = getBasicInfoRequestUrl('/api/base/data/camera/create/1.0');

	let result: IFResponse<
		CommonResponseDataType<IBDeviceInfo>
	> = await IFRequest.post(url, payload);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBDeviceInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let bDeviceInfo: IBDeviceInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	let fDeviceInfo: IFDeviceInfo = toFDviceInfoFromBDeviceInfo(bDeviceInfo);
	return new Proxy(fDeviceInfo, FDeviceInfoProxy);
}

/**
 * 修改设备信息
 * @param {string} id 设备id
 * @param {Partial<IBDeviceInfo>} payload 其他信息
 * @returns {Promise<DeviceInfoParser>} DeviceInfoParser
 */
async function modifyDeviceInfo(
	id: string,
	payload: Partial<IBDeviceInfo>
): Promise<IFDeviceInfo> {
	let url = getBasicInfoRequestUrl('/api/base/data/camera/modify/1.0');

	let result: IFResponse<
		CommonResponseDataType<IBDeviceInfo>
	> = await IFRequest.post(url, {
		...payload,
		id: id
	});

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBDeviceInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let bDeviceInfo: IBDeviceInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	let fDeviceInfo: IFDeviceInfo = toFDviceInfoFromBDeviceInfo(bDeviceInfo);
	return new Proxy(fDeviceInfo, FDeviceInfoProxy);
}

/**
 * 删除设备
 * @param {string} deviceId 设备id
 * @returns {Promise<boolean>} 返回值
 */
async function deleteDevice(deviceId: string): Promise<boolean> {
	let url = getBasicInfoRequestUrl('/api/base/data/camera/delete/1.0');

	await IFRequest.post(url, {
		id: deviceId
	});

	return true;
}

/**
 * 获得所有的设备
 * @returns {Promise<Array<IFAreaInfo>>} 区域信息列表（包含了设备信息）
 */
async function getAllDevicesWithAreaInfo(): Promise<Array<IFAreaInfo>> {
	let url = getBasicInfoRequestUrl('/api/base/data/tree/get/1.0');

	let result: IFResponse<
		CommonResponseDataType<IBAreaInfo>
	> = await IFRequest.post(url, {
		treeType: 2
	});

	// @ts-ignore
	let serverData = ValidateTool.getValidObject(result['data'], { data: [] });
	let bAreaInfoList: Array<IBAreaInfo> = ValidateTool.getValidArray(
		serverData['data'],
		[]
	);
	let fAreaInfoList: Array<IFAreaInfo> = [];
	// @ts-ignore
	for (let bAreaInfo of bAreaInfoList) {
		let fAreaInfo: IFAreaInfo = toFAreaInfoFromBAreaInfo(bAreaInfo, null);
		fAreaInfoList.push(fAreaInfo);
		// fAreaInfoList.push(new Proxy(fAreaInfo, FAreaInfoProxy));
	}
	return fAreaInfoList;
}

interface GetCameraListType {
	data: Array<{
		list: Array<{
			areaName: string;
			name: string;
			ip: string;
			geoString: string | null;
		}>;
	}>;
}

/**
 * 获取设备列表
 * @param {{
 * 	pageNo: number;  分页信息
 * 	pageSize: number; 分页信息
 * 	searchText?: string;
 * 	orderBy?: string;
 * }} payload 参数
 * @returns {Promise<Array<IFDeviceInfo>>} 设备列表
 */

async function getDeviceList(
	payload: IRGetDeviceListPayload
): Promise<ListType<IFDeviceInfo>> {
	let url = getBasicInfoRequestUrl('/api/base/data/camera/list/1.0');

	// TODO: 类型确认
	let result: IFResponse<
		CommonResponseDataType<GetCameraListType>
	> = await IFRequest.post(url, { ...payload });

	// @ts-ignore
	let serverData: CommonResponseDataType<
		GetCameraListType
	> = ValidateTool.getValidObject(result['data'], {});

	//
	let data = ValidateTool.getValidObject(serverData['data']);
	//
	let convertedList: Array<IFDeviceInfo> = ValidateTool.getValidArray(
		data['list']
	).map((item: IBDeviceInfo) => {
		return toFDviceInfoFromBDeviceInfo(
			item,
			null, // @NOTE: 这儿没有层级结构, 如有需要，业务层处理
			payload.applyCameraOffset ? true : false
		);
	});

	return {
		list: convertedList,
		total: ValidateTool.getValidNumber(data['total'])
	};
}

async function getDeviceInfo(id: string | number): Promise<IFDeviceInfo> {
	let url = getBasicInfoRequestUrl('/api/base/data/camera/info/1.0');

	// TODO: 类型确认
	let result: IFResponse<
		CommonResponseDataType<IBDeviceInfo>
	> = await IFRequest.post(url, {
		...{
			id: id
		}
	});

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBDeviceInfo
	> = ValidateTool.getValidObject(result['data'], {});

	let data: IFDeviceInfo = toFDviceInfoFromBDeviceInfo(
		ValidateTool.getValidObject(serverData['data']) as IBDeviceInfo
	);

	return data;
}

export const DeviceRequests = {
	addDevice: addDevice,
	modifyDeviceInfo: modifyDeviceInfo,
	deleteDevice: deleteDevice,
	getAllDevicesWithAreaInfo: getAllDevicesWithAreaInfo,
	getDeviceList: getDeviceList,
	getDeviceInfo
};
