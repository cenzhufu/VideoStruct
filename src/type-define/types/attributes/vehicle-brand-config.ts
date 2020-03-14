import { IFVehicleBrandSeriesInfo } from 'stutils/requests/basic-server-request';
import {
	VehicleConfigRequest,
	IFVehicleBrandInfo
} from 'stsrc/utils/requests/basic-server-request';
import {
	IFAttributeGroupProperty,
	IFAttributeProperty,
	EVehicleAttributeType
} from './attribute-type';
import { guid } from 'ifvendors/utils/guid';
import { ETargetType } from '../target-type';
import { generateVehicleBrandSeriesProperty } from './vehicle-attribute-generators';

// 车辆品牌的配置

let config: { [code: string]: IFVehicleBrandSeriesInfo } = {}; // 给车辆属性映射使用

let brandAttributeProperties: IFAttributeProperty[] = [];
let inited: boolean = false;

function initConfig() {
	VehicleConfigRequest.getVehicleBrandConfig()
		.then((brandInfos: Array<IFVehicleBrandInfo>) => {
			inited = true;
			// 将array -> map 并构建attribute property

			for (let item of brandInfos) {
				// NOTE: 目前品牌没有code
				// config[item.code] = item;
				// 遍历车系
				let seriesAttributeProperties: IFAttributeProperty[] = [];
				for (let car of item.series) {
					if (car.code) {
						config[car.code] = car;

						// 生成车系的属性
						seriesAttributeProperties.push(generateVehicleBrandSeriesProperty(
							car.code
						) as IFAttributeProperty);
					}
				}

				// 品牌属性
				let brandAttributeProperty: IFAttributeProperty = {
					targetType: ETargetType.Vehicle,
					attributeType: EVehicleAttributeType.CarBrand,
					attributeValue: item.code || '', // NOTE: 这个没有值

					tipLabelKey: '__COMMON_KEY_FOR_UNKNOWN', // 不使用
					defaultTip: item.name,

					uuid: `${ETargetType.Vehicle}_${
						EVehicleAttributeType.CarBrandSerials
					}_${guid()}`,

					againstAttributeType: [],
					enalbedAttributeType: [],

					keyDefaultTip: '车辆品牌',
					keyTipLabelKey: 'ATTRIBUTE_VEHICLE_BRAND',
					weight: 1,
					order: item.acronym,
					subAttributeProperties: seriesAttributeProperties
				};

				brandAttributeProperties.push(brandAttributeProperty);
			}

			// 修改group
			// vehicleBrandAttributeGroup.items = brandAttributeProperties;
		})
		.catch((error: Error) => {
			console.error(error);
		});
}

/**
 * 通过code获得对应的车系信息
 * @param {string} code code
 * @returns {(IFVehicleBrandInfo | null)} 车系信息
 */
function getVehicleBrandInfo(code?: string): IFVehicleBrandSeriesInfo | null {
	if (!code) {
		return null;
	}
	return config[code];
}

function isCarConfigInited(): boolean {
	return inited;
}

function getVehicleBrandAttributeGroupInfo(): IFAttributeGroupProperty {
	let vehicleBrandAttributeGroup: IFAttributeGroupProperty = {
		uuid: guid(),
		targetType: ETargetType.Vehicle,
		attributeType: EVehicleAttributeType.CarBrandSerials,
		items: brandAttributeProperties,
		defaultTip: '车辆品牌',
		tipLabelKey: 'ATTRIBUTE_VEHICLE_BRAND'
	};
	return vehicleBrandAttributeGroup;
}

export const VehicleBrandManager = {
	initConfig,
	isCarConfigInited,
	getVehicleBrandInfo,
	getVehicleBrandAttributeGroupInfo
};
