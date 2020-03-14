import {
	IFVehicleBrandInfo,
	IFVehicleBrandSeriesInfo,
	IBVehicleSeries,
	IBVehicleBrand,
	IBVehicleFactory,
	IBVehileBrandAcroynm
} from './vehicle-config-request';
import { ValidateTool } from 'ifvendors/utils/validate-tool';

/**
 * 车系信息 （后 ----> 前）
 * @param {IBVehicleSeries} info 后端车系信息
 * @returns {IFVehicleBrandSeriesInfo} 前端的车系信息
 */
function toFBrandSeriesInfoFromBBrandSeriesInfo(
	info: IBVehicleSeries
): IFVehicleBrandSeriesInfo {
	return {
		id: info.id,
		code: info.code,
		name: info.name
	};
}

/**
 * 车辆品牌(后 ----> 前)
 * @param {IBVehicleBrand} info 后端车辆品牌信息
 * @returns {IFVehicleBrandInfo} 前端的车辆品牌信息
 */
export function toFBrandInfoFromBBrandInfo(
	info: IBVehicleBrand
): IFVehicleBrandInfo {
	let fseries: Array<IFVehicleBrandSeriesInfo> = [];
	let bseries: Array<IBVehicleSeries> = ValidateTool.getValidArray(
		info.childList
	);

	for (let item of bseries) {
		fseries.push(toFBrandSeriesInfoFromBBrandSeriesInfo(item));
	}

	return {
		id: info.id,
		name: info.name || '',
		code: info.code || '',
		series: fseries,
		acronym: info.shortName || '###'
	};
}

/**
 * 将整棵厂商数转换成前端使用的结构
 * @export
 * @param {IBVehicleFactory} factoryInfo 后端厂商树
 * @returns {Array<IFVehicleBrandInfo>} 前端使用的品牌数组
 */
export function toFBrandInfoFromBFactoryInfo(
	factoryInfo: IBVehicleFactory
): Array<IFVehicleBrandInfo> {
	if (!factoryInfo) {
		return [];
	}

	// 层级结构：厂商----> 字母 ----> 品牌 ------>  车系

	// 我们不需要厂商，字母
	let letters: IBVehileBrandAcroynm[] = ValidateTool.getValidArray(
		factoryInfo.childList
	);

	let result: IFVehicleBrandInfo[] = [];
	for (let letterInfo of letters) {
		let brands: IBVehicleBrand[] = ValidateTool.getValidArray(
			letterInfo.childList
		);

		// 转换
		for (let brand of brands) {
			result.push(toFBrandInfoFromBBrandInfo(brand));
		}
	}

	return result;
}
