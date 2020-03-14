import { IFVehicleBrandSeriesInfo } from 'stutils/requests/basic-server-request';
import {
	IFAttributeProperty,
	EVehicleAttributeType,
	ECarTypeValue,
	ECarLicenseColorValue,
	ECarColorValue
} from './attribute-type';
import { _generateProperty } from './attribute-generator';
import { ETargetType } from '../target-type';
import * as is from 'is';
import { VehicleBrandManager } from './vehicle-brand-config';

function _generateVehicleTypeSedanProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Sedan,
		'轿车',
		'ATTRIBUTE_VEHICLE_TYPE_SEDAN',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'JC'
	);
}

function _generateVehicleTypeSUVProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Suv,
		'越野车',
		'ATTRIBUTE_VEHICLE_TYPE_SUV',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'YYC'
	);
}

function _generateVehicleTypeMpvProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Mpv,
		'商务车',
		'ATTRIBUTE_VEHICLE_TYPE_MPV',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'SWC'
	);
}

function _generateVehicleTypeMinivanProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Minivan,
		'小型货车',
		'ATTRIBUTE_VEHICLE_TYPE_MINIVAN',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'XXHC'
	);
}

function _generateVehicleTypeLargeTrunkProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.LargeTruck,
		'大型货车',
		'ATTRIBUTE_VEHICLE_TYPE_LARGETRUCK',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'DXHC'
	);
}

function _generateVehicleTypeLightBusProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.LightBus,
		'轻客',
		'ATTRIBUTE_VEHICLE_TYPE_LIGHTBUS',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'QK'
	);
}

function _generateVehicleTypeMidiBusProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.MidiBus,
		'小型客车',
		'ATTRIBUTE_VEHICLE_TYPE_MIDIBUS',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'XXKC'
	);
}

function _generateVehicleTypeLargeBusProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.LargeBus,
		'大型客车',
		'ATTRIBUTE_VEHICLE_TYPE_LARGEBUS',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'DXKC'
	);
}

function _generateVehicleTypeTricycleProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Tricycle,
		'三轮车',
		'ATTRIBUTE_VEHICLE_TYPE_TRICYCLE',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'SLC'
	);
}

function _generateVehicleTypeMicrovanProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Microvan,
		'微面',
		'ATTRIBUTE_VEHICLE_TYPE_MICROVAN',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'WM'
	);
}

function _generateVehicleTypePickupProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Pickup,
		'皮卡',
		'ATTRIBUTE_VEHICLE_TYPE_PICKUP',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'PK'
	);
}

function _generateVehicleTypeTrailerProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Trailer,
		'挂车',
		'ATTRIBUTE_VEHICLE_TYPE_TRAILER',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'GC'
	);
}

function _generateVehicleTypeConcreateMixerProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.ConcreateMixer,
		'混泥土搅拌车',
		'ATTRIBUTE_VEHICLE_TYPE_CONCREATEMIXER',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'HNTJBC'
	);
}

function _generateVehicleTypeTankerProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Tanker,
		'罐车',
		'ATTRIBUTE_VEHICLE_TYPE_Tanker',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'GC'
	);
}

function _generateVehicleTypeCraneTruckProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.CraneTruck,
		'随车吊',
		'ATTRIBUTE_VEHICLE_TYPE_CRANETRUCK',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'SCD'
	);
}

function _generateVehicleTypeFireTrunkProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.FireTruck,
		'消防车',
		'ATTRIBUTE_VEHICLE_TYPE_FIRETRUCK',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'XFC'
	);
}

function _generateVehicleTypeSlagCarProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.SlagCar,
		'渣土车',
		'ATTRIBUTE_VEHICLE_TYPE_SLAGCAR',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'ZTC'
	);
}

function _generateVehicleTypeEscortProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.EscortVehicle,
		'押运车',
		'ATTRIBUTE_VEHICLE_TYPE_ESCORT',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'YYC'
	);
}

function _generateVehicleTypeEngineerRepairProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.EngineeringRepairCar,
		'工程抢修车',
		'ATTRIBUTE_VEHICLE_TYPE_ENGINEERREPAIR',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'GCQXC'
	);
}

function _generateVehicleTypeRescueProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.RescueCar,
		'救援车',
		'ATTRIBUTE_VEHICLE_TYPE_RESCUE',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'JYC'
	);
}

function _generateVehicleTypeBulkLorryProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.BulkLorry,
		'栏板卡车',
		'ATTRIBUTE_VEHICLE_TYPE_BULKLORRY',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'LBKC'
	);
}

function _generateVehicleTypeNotClearProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.NotClear,
		'未识别',
		'ATTRIBUTE_VEHICLE_TYPE_UNKNOWN',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'WZ'
	);
}

/**
 * 生成车辆类型属性
 * @param {ECarTypeValue} [value] 车辆类型的直
 * @returns {(IFAttributeProperty | null)} 属性
 */
export function generateVehicleTypeProperty(
	value?: ECarTypeValue
): IFAttributeProperty | null {
	if (!value) {
		return null;
	}

	switch (value) {
		case ECarTypeValue.Sedan:
			return _generateVehicleTypeSedanProperty();

		case ECarTypeValue.Suv:
			return _generateVehicleTypeSUVProperty();

		case ECarTypeValue.Mpv:
			return _generateVehicleTypeMpvProperty();

		case ECarTypeValue.Minivan:
			return _generateVehicleTypeMinivanProperty();

		case ECarTypeValue.LargeTruck:
			return _generateVehicleTypeLargeTrunkProperty();

		case ECarTypeValue.LightBus:
			return _generateVehicleTypeLightBusProperty();

		case ECarTypeValue.MidiBus:
			return _generateVehicleTypeMidiBusProperty();

		case ECarTypeValue.LargeBus:
			return _generateVehicleTypeLargeBusProperty();

		case ECarTypeValue.Tricycle:
			return _generateVehicleTypeTricycleProperty();

		case ECarTypeValue.Microvan:
			return _generateVehicleTypeMicrovanProperty();

		case ECarTypeValue.Pickup:
			return _generateVehicleTypePickupProperty();

		case ECarTypeValue.Trailer:
			return _generateVehicleTypeTrailerProperty();

		case ECarTypeValue.ConcreateMixer:
			return _generateVehicleTypeConcreateMixerProperty();

		case ECarTypeValue.Tanker:
			return _generateVehicleTypeTankerProperty();

		case ECarTypeValue.CraneTruck:
			return _generateVehicleTypeCraneTruckProperty();

		case ECarTypeValue.FireTruck:
			return _generateVehicleTypeFireTrunkProperty();

		case ECarTypeValue.SlagCar:
			return _generateVehicleTypeSlagCarProperty();

		case ECarTypeValue.EscortVehicle:
			return _generateVehicleTypeEscortProperty();

		case ECarTypeValue.EngineeringRepairCar:
			return _generateVehicleTypeEngineerRepairProperty();

		case ECarTypeValue.RescueCar:
			return _generateVehicleTypeRescueProperty();

		case ECarTypeValue.BulkLorry:
			return _generateVehicleTypeBulkLorryProperty();

		case ECarTypeValue.NotClear:
			return _generateVehicleTypeNotClearProperty();

		default:
			return null;
	}
}

export function generateVehicleTypeUnknownProperty() {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarType,
		ECarTypeValue.Unknow,
		'未识别',
		'ATTRIBUTE_VEHICLE_TYPE_UNKNOWN',
		'车辆类型',
		'ATTRIBUTE_VEHICLE_TYPE',
		[],
		[],
		1,
		'wsb'
	);
}

function _generateVehicleLicenseColorYellowProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.Yellow,
		'黄色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_YELLOW',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'yellow'
	);
}

function _generateVehicleLicenseColorBlueProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.Blue,
		'蓝色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_BLUE',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'blue'
	);
}

function _generateVehicleLicenseColorBlackProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.Black,
		'黑色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_BLACK',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'black'
	);
}

function _generateVehicleLicenseColorWhiteProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.White,
		'白色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_WHITE',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'white'
	);
}

function _generateVehicleLicenseColorGreenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.Green,
		'绿色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_GREEN',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'green'
	);
}

function _generateVehicleLicenseColorYellowGreenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.YellowGreen,
		'黄绿色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_YELLOWGREEN',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'yellowgreen'
	);
}

function _generateVehicleLicenseColorGradientGreenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.GradientGreen,
		'渐变绿',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_GRADIENTGREEN',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'gradientgreen'
	);
}

function _generateVehicleLicenseColorUnknownProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseColor,
		ECarLicenseColorValue.Unknow,
		'未识别',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR_UNKNOWN',
		'车牌颜色',
		'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		[],
		[],
		1,
		'unknown'
	);
}

/**
 * 生成车牌颜色属性
 * @export
 * @param {ECarLicenseColorValue} [value] 车牌颜色
 * @returns {(IFAttributeProperty | null)} 属性
 */
export function generateVehicleLicenseColorProperty(
	value?: ECarLicenseColorValue
): IFAttributeProperty | null {
	if (!value) {
		return null;
	}

	switch (value) {
		case ECarLicenseColorValue.Yellow:
			return _generateVehicleLicenseColorYellowProperty();

		case ECarLicenseColorValue.Blue:
			return _generateVehicleLicenseColorBlueProperty();

		case ECarLicenseColorValue.Black:
			return _generateVehicleLicenseColorBlackProperty();

		case ECarLicenseColorValue.White:
			return _generateVehicleLicenseColorWhiteProperty();

		case ECarLicenseColorValue.Green:
			return _generateVehicleLicenseColorGreenProperty();

		case ECarLicenseColorValue.YellowGreen:
			return _generateVehicleLicenseColorYellowGreenProperty();

		case ECarLicenseColorValue.GradientGreen:
			return _generateVehicleLicenseColorGradientGreenProperty();

		case ECarLicenseColorValue.Unknow:
			return _generateVehicleLicenseColorUnknownProperty();

		default:
			return null;
	}
}

/**
 *
 * 生成车牌属性
 * @export
 * @param {string} [license] 车牌号码
 * @returns {(IFAttributeProperty | null)} 属性
 */
export function generateVehicleLicenseNumberProperty(
	license?: string
): IFAttributeProperty | null {
	if (!is.string(license)) {
		return null;
	}

	// license = (license === '') ? '': license;
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarLicenseNumber,
		license as string,
		license && license !== 'unknown' ? license : '未检测到车牌号',
		'__COMMON_KEY_FOR_UNKNOWN', // 这个字段确保没有，
		'车牌号码',
		'ATTRIBUTE_VEHICLE_LICENSE_NUMBER',
		[],
		[]
	);
}

// 车辆颜色

function _generateVehicleColorBlackProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Black,
		'黑色',
		'ATTRIBUTE_COLOR_BLACK',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorBlueProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Blue,
		'蓝色',
		'ATTRIBUTE_COLOR_BLUE',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorBrownProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Brown,
		'棕色',
		'ATTRIBUTE_COLOR_BROWN',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorGreenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Green,
		'绿色',
		'ATTRIBUTE_COLOR_GREEN',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorSilverProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Silvery,
		'银色',
		'ATTRIBUTE_COLOR_SILVERY',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorRedProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Red,
		'红色',
		'ATTRIBUTE_COLOR_RED',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorWhiteProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.White,
		'白色',
		'ATTRIBUTE_COLOR_WHITE',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorYellowProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Yellow,
		'黄色',
		'ATTRIBUTE_COLOR_YELLOW',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorPinkProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Pink,
		'粉色',
		'ATTRIBUTE_COLOR_PINK',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorGoldenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Golden,
		'金色',
		'ATTRIBUTE_COLOR_GLODEN',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorPurpleProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Purple,
		'紫色',
		'ATTRIBUTE_COLOR_PURPLE',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorGrayProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Gray,
		'灰色',
		'ATTRIBUTE_COLOR_GRAY',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorOrangeProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Cyan,
		'青色',
		'ATTRIBUTE_COLOR_CYAN',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

function _generateVehicleColorNotClearProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.NotClear,
		'未识别',
		'ATTRIBUTE_COLOR_NotClear',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

/**
 * 生成车辆颜色属性
 * @export
 * @param {ECarColorValue} [value] 车辆颜色
 * @returns {(IFAttributeProperty | null)} 属性
 */
export function generateVehicleColorProperty(
	value?: ECarColorValue
): IFAttributeProperty | null {
	if (!value) {
		return null;
	}

	switch (value) {
		case ECarColorValue.Black:
			return _generateVehicleColorBlackProperty();

		case ECarColorValue.Blue:
			return _generateVehicleColorBlueProperty();

		case ECarColorValue.Brown:
			return _generateVehicleColorBrownProperty();

		case ECarColorValue.Green:
			return _generateVehicleColorGreenProperty();

		case ECarColorValue.Silvery:
			return _generateVehicleColorSilverProperty();

		case ECarColorValue.Red:
			return _generateVehicleColorRedProperty();

		case ECarColorValue.White:
			return _generateVehicleColorWhiteProperty();

		case ECarColorValue.Yellow:
			return _generateVehicleColorYellowProperty();

		case ECarColorValue.Pink:
			return _generateVehicleColorPinkProperty();

		case ECarColorValue.Golden:
			return _generateVehicleColorGoldenProperty();

		case ECarColorValue.Purple:
			return _generateVehicleColorPurpleProperty();

		case ECarColorValue.Gray:
			return _generateVehicleColorGrayProperty();

		case ECarColorValue.Cyan:
			return _generateVehicleColorOrangeProperty();

		case ECarColorValue.NotClear:
			return _generateVehicleColorNotClearProperty();

		default:
			return null;
	}
}

export function generateVehicleColorUnknownProperty() {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarColor,
		ECarColorValue.Unknow,
		'未识别',
		'ATTRIBUTE_COLOR_Unknown',
		'车辆颜色',
		'ATTRIBUTE_VEHICLE_COLOR',
		[],
		[]
	);
}

/**
 * 生成车辆品牌属性
 * @export
 * @param {Array<string>} [value=[]] 品牌下边的车系code的集合
 * @param {string} [name=''] 品牌名字
 * @returns {IFAttributeProperty} 属性
 */
export function generateVehicleBrandProperty(
	value: Array<string> = [],
	name: string = ''
) {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarBrand,
		value.join(','),
		name, // 名字我也不晓得是什么
		'__COMMON_KEY_FOR_UNKNOWN',
		'车辆品牌',
		'ATTRIBUTE_VEHICLE_BRAND',
		[],
		[]
	);
}

// 车系信息
export function generateVehicleBrandSeriesProperty(
	code?: string
): IFAttributeProperty | null {
	if (!code) {
		return null;
	}

	if (is.string(code)) {
		// 获得对应的brand info
		let brandInfo: IFVehicleBrandSeriesInfo | null = VehicleBrandManager.getVehicleBrandInfo(
			code
		);
		if (brandInfo) {
			return _generateProperty(
				ETargetType.Vehicle,
				EVehicleAttributeType.CarBrandSerials,
				code,
				brandInfo.name,
				'__COMMON_KEY_FOR_UNKNOWN',
				'车辆型号', // NOTE: 我们生成的是车系属性，这儿要不要修改？
				'ATTRIBUTE_VEHICLE_BRAND_SERIALS',
				[],
				[]
			);
		} else {
			return null;
		}
	} else {
		return null;
	}
}

/**
 * 从车系名字中生成车系属性
 * @export
 * @param {string} brandName 车系名字
 * @returns {(IFAttributeProperty | null)} 对应的属性
 */
export function generateVehicleBrandSeriesPropertyFromBrandName(
	brandName?: string
): IFAttributeProperty | null {
	if (is.string(brandName)) {
		// 单独判断unknown
		if (brandName === 'unknown') {
			return generateVehicleBrandSeriesUnknownProperty();
		} else {
			return _generateProperty(
				ETargetType.Vehicle,
				EVehicleAttributeType.CarBrandSerials,
				'__no_code_to_front_end__',
				brandName as string,
				'__COMMON_KEY_FOR_UNKNOWN',
				'车辆型号', // NOTE: 我们生成的是车系属性，这儿要不要修改？
				'ATTRIBUTE_VEHICLE_BRAND_SERIALS',
				[],
				[]
			);
		}
	} else {
		return null;
	}
}

export function generateVehicleBrandSeriesUnknownProperty() {
	return _generateProperty(
		ETargetType.Vehicle,
		EVehicleAttributeType.CarBrandSerials,
		'__no_code_to_front_end__',
		'未识别',
		'ATTRIBUTE_VEHICLE_TYPE_UNKNOWN',
		'车辆型号', // NOTE: 我们生成的是车系属性，这儿要不要修改？
		'ATTRIBUTE_VEHICLE_BRAND_SERIALS',
		[],
		[]
	);
}
