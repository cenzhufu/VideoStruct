import { IBTreeStruct } from './../_type';
import { ValidateTool } from 'ifutils/validate-tool';

import IFRequest, { IFResponse } from 'ifutils/requests';
import { CommonResponseDataType } from 'stsrc/type-define';
import { getBasicInfoRequestUrl } from '../_url';
import { toFBrandInfoFromBFactoryInfo } from './to-vehicle-brand-info-adaptor';

// 车系
export interface IBVehicleSeries extends IBTreeStruct<any> {
	code: string; // 唯一标识符
}

// 品牌
export interface IBVehicleBrand extends IBTreeStruct<IBVehicleSeries> {
	shortName: string; // 全拼首字母
	code: string;
}

// 品牌首字母
export interface IBVehileBrandAcroynm extends IBTreeStruct<IBVehicleBrand> {}

// 厂商
export interface IBVehicleFactory extends IBTreeStruct<IBVehileBrandAcroynm> {}

export interface IFVehicleBrandSeriesInfo {
	id: string;
	code: string; //
	name: string;
}

export interface IFVehicleBrandInfo {
	id: string;
	code: string; // 代码
	name: string;
	series: IFVehicleBrandSeriesInfo[]; // 型号
	acronym: string; // 品牌首字母缩写
}

async function getVehicleBrandConfig(): Promise<Array<IFVehicleBrandInfo>> {
	// 确认地址
	let url = getBasicInfoRequestUrl('/api/base/data/tree/get/1.0');

	let results: IFResponse<
		CommonResponseDataType<Array<IBVehicleFactory>>
	> = await IFRequest.post(url, {
		treeType: 6 // 汽车品牌
		// needCarType: 3  // 需要返回的汽车品牌树层级（1---厂商，2---首字母， 3---汽车品牌， 4---汽车型号， 不传则返回全部）
	});

	// @ts-ignore
	let serverData: CommonResponseDataType<
		Array<IBVehicleFactory>
	> = ValidateTool.getValidObject(results['data']);

	// 后台的厂商数据(只取第一个)
	let treeResults: Array<IBVehicleFactory> = ValidateTool.getValidArray(
		serverData['data']
	);

	let firstResult: IBVehicleFactory = treeResults[0];
	// 数据适配层
	let fresults: Array<IFVehicleBrandInfo> = toFBrandInfoFromBFactoryInfo(
		firstResult
	);

	return fresults;
}

export const VehicleConfigRequest = { getVehicleBrandConfig };
