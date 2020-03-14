// 区域管理请求相关
import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { getBasicInfoRequestUrl } from '../_url';
import { IFAreaInfo, CommonResponseDataType } from 'sttypedefine';

import { IBAreaInfo, AddAreaRequestPayloadType } from './area-type';
import { toFAreaInfoFromBAreaInfo } from './to-area-info-adaptor';
// import { FAreaInfoProxy } from './area-proxy';

/**
 * 增加区域
 * @param {AddAreaRequestPayloadType} payload 请求
 * @returns {Promise<IFAreaInfo>} 区域信息
 */
async function addArea(
	payload: AddAreaRequestPayloadType
): Promise<IFAreaInfo> {
	let url = getBasicInfoRequestUrl('/api/base/data/area/create/1.0');

	payload.parentId = ValidateTool.getValidString(payload.parentId, '0');
	let result: IFResponse<
		CommonResponseDataType<IBAreaInfo>
	> = await IFRequest.post(url, payload);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBAreaInfo
	> = ValidateTool.getValidObject(result['data'], {});

	// @ts-ignore
	let bAreaInfo: IBAreaInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);
	// @NOTE: 这儿我们不指定parent，需要业务层去指定
	let fAreaInfo: IFAreaInfo = toFAreaInfoFromBAreaInfo(bAreaInfo, null);

	return fAreaInfo;
	// return new Proxy(fAreaInfo, FAreaInfoProxy);
}

/**
 * 修改区域信息
 * @param {Partial<AddAreaRequestPayloadType>} payload 其他参数
 * @returns {Promise<IBAreaInfo>} IBAreaInfo
 */
async function modifyArea(payload: {
	id: string;
	name: string;
	parentId?: string;
	description?: string;
}): Promise<IFAreaInfo> {
	let url = getBasicInfoRequestUrl('/api/base/data/area/modify/1.0');

	let result: IFResponse<IBAreaInfo> = await IFRequest.post(url, {
		...payload
		// id: areaId
	});

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBAreaInfo
	> = ValidateTool.getValidObject(result['data'], {});

	// @ts-ignore
	let bAreaInfo: IBAreaInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	// @NOTE: 这儿我们不指定parent,需要业务层去处理
	let fAreaInfo: IFAreaInfo = toFAreaInfoFromBAreaInfo(bAreaInfo, null);

	return fAreaInfo;
	// return new Proxy(fAreaInfo, FAreaInfoProxy);
}

/**
 * 删除区域
 * @param {string} payload 区域id
 * @returns {Promise<boolean>} 返回值
 */
async function deleteArea(payload: { areaId: string }): Promise<boolean> {
	let url = getBasicInfoRequestUrl('/api/base/data/area/delete/1.0');
	await IFRequest.post(url, {
		id: payload.areaId
	});

	return true;
}

//获取设备的请求参数
// export interface GetAreaTreeType {
//     treeType: 1 | 2 | 3; // 1表示只获取区域， 2表示获取区域+设备， 3. 自己查看文档
//     treeId?: number;
//     needRegionType?: number;
// }

async function getAreaTree(serarchStr?: string): Promise<Array<IFAreaInfo>> {
	let url = getBasicInfoRequestUrl('/api/base/data/tree/get/1.0');

	let result: IFResponse<
		CommonResponseDataType<Array<IBAreaInfo>>
	> = await IFRequest.post(url, {
		treeType: 1,
		filterText: serarchStr
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
		// fAreaInfoList.push(new Proxy(fAreaInfo, FAreaInfoProxy));
		fAreaInfoList.push(fAreaInfo);
	}
	return fAreaInfoList;
}

export const AreaRequests = {
	addArea: addArea,
	modifyArea: modifyArea,
	deleteArea: deleteArea,
	getAreaTree: getAreaTree
};
