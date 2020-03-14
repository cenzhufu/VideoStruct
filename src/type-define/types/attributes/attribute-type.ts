import {
	generateBodyClothesTypeProperty,
	generateBodyTrousersColorProperty,
	generateBodyClothesTextureProperty,
	generateBodyClotheColorProperty,
	generateBodyTrousersTypeProperty,
	generateBodyTrousersTextureProperty,
	generateBodyOvercoatProperty,
	generateBodyHandbagProperty,
	generateSinglebagProperty,
	generateBagProperty,
	generateTrunkProperty,
	generateBodyCartProperty
} from 'stsrc/type-define/types/attributes/body-attributes-generators';
import { TypeValidate } from 'ifutils/validate-tool';
import { ETargetType } from '../target-type';
import {
	generateFaceGenderProperty,
	generateFaceAgeProperty,
	generateFaceGlassProperty,
	generateFaceHatProperty,
	generateFaceRaceProperty,
	generateFaceMaskProperty
} from './face-attributes-generators';
import {
	generateVehicleColorProperty,
	generateVehicleTypeProperty,
	generateVehicleLicenseColorProperty,
	generateVehicleLicenseNumberProperty,
	generateVehicleBrandSeriesProperty,
	generateVehicleBrandSeriesPropertyFromBrandName,
	generateVehicleColorUnknownProperty,
	generateVehicleTypeUnknownProperty,
	generateVehicleBrandSeriesUnknownProperty
} from './vehicle-attribute-generators';
/************************* type  ××××××××****×××××××××*/

// 人脸属性type
export enum EFaceAttributeType {
	Unknow = 'front-unknow',
	Gender = 'gender',
	Age = 'age',
	Glasses = 'glasses',
	Hat = 'hat',
	Race = 'race',
	Mask = 'mask'
}

// 携带物属性type
export enum EHandbagAttributeType {
	Unknow = 'front-unknow',
	HandBag = 'handbag',
	SingleShouldBag = 'singlebag',
	Backbag = 'backbag',
	Drawbox = 'drawbox', //拉杆箱
	Cart = 'cart'
}

// 人体属性(除去了携带物类型)type(
export enum EBodyAttributeExceptHandbagType {
	Clothes = 'clothes',
	ClothesTexture = 'clothesTexture',
	ClothesColor = 'clothesColor',
	Trousers = 'trousers',
	TrousersTexture = 'trousersTexture',
	TrousersColor = 'trousersColor',
	Coat = 'coat'
}

// 人体属性type
export enum EBodyAttributeType {
	Unknow = 'front-unknow',

	Clothes = 'clothes',
	ClothesTexture = 'clothesTexture',
	ClothesColor = 'clothesColor',
	Trousers = 'trousers',
	TrousersTexture = 'trousersTexture',
	TrousersColor = 'trousersColor',
	Coat = 'coat',

	// 携带物
	HandBag = 'handbag',
	SingleShouldBag = 'singlebag',
	Backbag = 'backbag',
	Drawbox = 'drawbox', //拉杆箱
	Cart = 'cart'
}

// 车辆属性
export enum EVehicleAttributeType {
	Unknow = 'front-unknow',
	CarType = 'car-type', // 车辆类型， 如suv, 藤原86等
	CarColor = 'car-color', // 车辆颜色
	CarBrandSerials = 'car-brand-serials', // 车辆品牌系列（车系）
	CarBrand = 'car-brand', // 车辆品牌， 此时应该获取其subAttributeProperties，拥有一系列的车系型号
	// CarSeries = 'car-series', //车系 如宝骏 730  奔驰E200
	// 省略电话，安全带，是否有危险品，是否碰撞，小物件的属性

	CarLicenseNumber = 'car-license-number',
	CarLicenseColor = 'car-license-color'
}

/************************* value  ××××××××****×××××××××*/

export enum EGenderValue {
	Unknow = 'front-unknow', // 前端添加
	All = '', // 前端添加
	Man = 'male',
	Woman = 'female'
}

// 年龄类型(这个字段比较特殊，在实际的请求中，我们还要转换一层)
// 其他字段值则是和后台字段的值对应
export enum EAgeValue {
	Unknow = 'front-unknow',
	All = '', // 前端添加
	Child = '0,15', // 儿童
	Young = '16,30',
	MiddleAage = '31,46', // 成年
	Old = '47' // 老年
}

// 种族类型
export enum ERaceValue {
	Unknow = 'front-unknow',
	All = '', // 前端添加
	Chinese = 'han', // 汉族
	Other = 'other' // 其他
}

// 帽子类型
export enum EHatValue {
	Unknow = 'front-unknow',
	All = '', // 前端添加
	Has = 'yes', // 不戴帽子
	No = 'no' // 戴帽子
}

// 太阳眼镜
export enum EGlassesValue {
	Unknow = 'front-unknow',
	All = '',
	Has = 'glasses', // 戴眼镜
	No = 'no', // 不戴眼镜
	SunGlasses = 'sunglass' // 太阳眼镜
}

// 口罩
export enum EFaceMaskValue {
	Unknow = 'front-unknow',
	All = '',
	Has = 'yes', // 戴口罩
	No = 'no' // 不带口罩
}

// 衣服
export enum EClothesValue {
	Unknow = 'front-unknow',
	All = '',
	ShortSleeve = 'shortSleevel', //短衣
	LongSleeve = 'longSleeve' //长衣
}

// 裤子
export enum ETrousersValue {
	Unknow = 'front-unknow',
	All = '',
	LongTrouser = 'pants', //长裤
	ShortTrouser = 'shorts', //短裤
	Skirt = 'skirt' //短裙
}

// 大衣
export enum EOverCoatValue {
	Unknow = 'front-unknow',
	All = '',
	Has = 'yes',
	No = 'no'
}

// 纹理
export enum ETextureValue {
	Unknow = 'front-unknow',
	All = '',
	PureColor = 'pure', //纯色
	Stripe = 'stripe', //条纹
	Pattern = 'pattern', //图案
	Joint = 'joint', //拼接
	Grid = 'grid', //格子
	Uniform = 'uniform', //制服
	Other = 'other'
}

// 颜色
export enum EColorValue {
	Unknow = 'front-unknow',
	All = '',
	Black = 'black',
	Blue = 'blue',
	Green = 'green',
	Red = 'red',
	White = 'white',
	Yellow = 'yellow',
	Purple = 'purple', ////紫色
	Gray = 'gray', //灰色
	Orange = 'orange' //橙色
}

// 对于存在与否的属性的值的类型
export enum EBaggageValue {
	Unknow = 'front-unknow',
	All = '',
	Yes = 'yes',
	No = 'no'
}
// 行李
export enum EBaggageType {
	Unknow = 'front-unknow',
	All = '',
	HandBag = 'handbag',
	SingleShouldBag = 'singlebag',
	Backbag = 'backbag',
	Drawbox = 'drawbox', //拉杆箱
	Cart = 'cart'
}

// 置信度类型
export enum EConfidenceValue {
	Low = '0.6', // 低
	Middle = '0.75', // 中
	High = '0.9' // 高
}

// 车辆颜色
export enum ECarColorValue {
	All = '',
	Unknow = 'front-unknow',
	Black = 'black',
	Blue = 'blue',
	Brown = 'brown',
	Green = 'green',
	Silvery = 'silvery', // 银色
	Red = 'red',
	White = 'white',
	Yellow = 'yellow',
	Pink = 'pink', // 粉色
	Golden = 'golden', // 金色
	Purple = 'purple', ////紫色
	Gray = 'gray', //灰色
	Cyan = 'cyan', //青色
	NotClear = 'unknown' // 未知（后台字段）
}

// 车辆类型的值
export enum ECarTypeValue {
	All = '',
	Unknow = 'front-unknow',
	Sedan = 'sedan', // 轿车，例：奥迪 A6
	Suv = 'suv', // 越野车，SUV类，例：丰田普拉多
	Mpv = 'mpv', // 商务车，MPV类，例：别克 GL8
	Minivan = 'minivan', // 小型货车，微卡，例：五菱荣光小卡
	LargeTruck = 'largeTruck', // 大型货车，轻卡及以上，例：东风多利卡
	LightBus = 'lightBus', // 轻客，客货两用乘用车（面包），例：江铃全顺、金杯海狮
	MidiBus = 'midiBus', // 小型客，7-19 座位客车（中巴） ，例：丰田柯斯达
	LargeBus = 'largeBus', // 大型客车，20 座以上客车（公交、大巴），例：金龙
	Tricycle = 'tricycle', // 三轮车，农用车类，例：五征
	Microvan = 'microvan', // 微面，8 座以下乘用车，例：五菱之光
	Pickup = 'pickup', // 皮卡，例：长城风骏
	Trailer = 'trailer', // 挂车，货车-专用车
	ConcreateMixer = 'concreteMixer', // 混凝土搅拌车，货车-专用车
	Tanker = 'tanker', // 罐车，货车-专用车
	CraneTruck = 'craneTruck', // 随车吊，货车-专用车
	FireTruck = 'fireTruck', // 消防车，货车-专用车
	SlagCar = 'slagCar', // 渣土车，货车-专用车
	EscortVehicle = 'escortVehicle', // 押运车，货车-专用车
	EngineeringRepairCar = 'engineeringRepairCar', // 工程抢修车， 货车-专用车
	RescueCar = 'rescueCar', // 救援车，货车-专用车
	BulkLorry = 'bulkLorry', // 栏板卡车, 货车-专用车
	NotClear = 'unknown' // 未知(后台字段)
}

// TODO: 待确认
export enum ECarBrandValue {
	Unknow = 'front-unknow'
}

// 车牌号码的值
export enum ECarLicenseColorValue {
	All = '',
	Unknow = 'front-unknow',
	Yellow = 'yellow',
	Blue = 'blue',
	Black = 'black',
	White = 'white',
	Green = 'green',
	YellowGreen = 'yellowGreen',
	GradientGreen = 'gradientGreen' // 渐变绿
}

export type EAttributeType =
	| EFaceAttributeType
	| EBodyAttributeType
	| EVehicleAttributeType;
export type EAttributeValue =
	| EGenderValue
	| EAgeValue
	| ERaceValue
	| EHatValue
	| EGlassesValue
	| EFaceMaskValue
	| EClothesValue
	| ETrousersValue
	| EOverCoatValue
	| ETextureValue
	| EColorValue
	| EBaggageValue
	| ECarColorValue
	| ECarTypeValue
	| ECarBrandValue
	| ECarLicenseColorValue
	| string;

// 属性
export interface IFAttributeProperty {
	targetType: ETargetType; // 属性的targetType
	attributeType: EAttributeType; // 属性的类型
	attributeValue: EAttributeValue; // 属性的值

	// for display(value)
	tipLabelKey: string; // 提示国际化
	defaultTip: string; // 默认的提示

	// uuid
	uuid: string; // 唯一的标志符（在不限定attributeValue的情况下，另外设置一个value，用来当作标志符）

	// UI操作相关
	againstAttributeType: EAttributeType[]; // 此属性选中时，禁用的其他属性的类型，取消选中时，则启用对应的属性
	enalbedAttributeType: EAttributeType[]; // 此属性选中时，启用的其他属性的类型，取消选中时，则禁用对应的属性

	// 二期添加
	// for display(key)
	keyTipLabelKey: string;
	keyDefaultTip: string;
	weight: number; // 属性的权重（可以用来依照权重排序），用于扩展
	order: string; // 排序（用来排序，目前设置为字母，用来显示字母表排序）
	subAttributeProperties: Array<IFAttributeProperty>; // 子属性（这个用来显示）
}

// 属性组
export interface IFAttributeGroupProperty {
	// 组名（类别名）
	tipLabelKey: string; // 国际化的关键字key
	defaultTip: string; // 默认的提示文案

	items: Array<IFAttributeProperty>; // 包含的属性

	uuid: string;

	targetType: ETargetType; // 所属的targetType（如人脸，人体）
	attributeType: EAttributeType; // 属性的类型（如性别，年龄等）(NOTE: 跟后台的字段名保持一致)
}

// #region getValid××× 辅助方法

export function getValidGenderValue(genderValue?: EGenderValue): EGenderValue {
	if (!genderValue) {
		return EGenderValue.Unknow;
	}

	switch (genderValue) {
		case EGenderValue.Man:
		case EGenderValue.Woman:
			return genderValue;

		default:
			return EGenderValue.Unknow;
	}
}

export function getValidAgeValue(ageValue?: number): EAgeValue {
	// @ts-ignore
	if (!TypeValidate.isNumber(ageValue) || ageValue < 0) {
		return EAgeValue.Unknow;
	}

	// @ts-ignore
	if (ageValue <= 15) {
		return EAgeValue.Child;
	}

	// @ts-ignore
	if (ageValue <= 30) {
		return EAgeValue.Young;
	}

	// @ts-ignore
	if (ageValue <= 46) {
		return EAgeValue.MiddleAage;
	}

	return EAgeValue.Old;
}

export function getValidRaceValue(race?: ERaceValue): ERaceValue {
	if (!race) {
		return ERaceValue.Unknow;
	}

	switch (race) {
		case ERaceValue.Chinese:
		case ERaceValue.Other:
			return race;

		default:
			return ERaceValue.Unknow;
	}
}

export function getValidHatValue(hatValue?: EHatValue): EHatValue {
	if (!hatValue) {
		return EHatValue.Unknow;
	}

	switch (hatValue) {
		case EHatValue.Has:
		case EHatValue.No:
			return hatValue;

		default:
			return EHatValue.Unknow;
	}
}

export function getValidGlassesValue(
	glassValue?: EGlassesValue
): EGlassesValue {
	if (!glassValue) {
		return EGlassesValue.Unknow;
	}

	switch (glassValue) {
		case EGlassesValue.Has:
		case EGlassesValue.No:
		case EGlassesValue.SunGlasses:
			return glassValue;

		default:
			return EGlassesValue.Unknow;
	}
}

export function getValidFaceMaskValue(
	maskValue?: EFaceMaskValue
): EFaceMaskValue {
	if (!maskValue) {
		return EFaceMaskValue.Unknow;
	}

	switch (maskValue) {
		case EFaceMaskValue.Has:
		case EFaceMaskValue.No:
			return maskValue;

		default:
			return EFaceMaskValue.Unknow;
	}
}

export function getValidClothesTypeValue(
	clothValue?: EClothesValue
): EClothesValue {
	if (!clothValue) {
		return EClothesValue.Unknow;
	}

	switch (clothValue) {
		case EClothesValue.ShortSleeve:
		case EClothesValue.LongSleeve:
			return clothValue;

		default:
			return EClothesValue.Unknow;
	}
}

export function getValidTrousersValue(
	trouserValue?: ETrousersValue
): ETrousersValue {
	if (!trouserValue) {
		return ETrousersValue.Unknow;
	}

	switch (trouserValue) {
		case ETrousersValue.LongTrouser:
		case ETrousersValue.ShortTrouser:
		case ETrousersValue.Skirt:
			return trouserValue;

		default:
			return ETrousersValue.Unknow;
	}
}

export function getValidOverCoatValue(
	overcoatValue?: EOverCoatValue
): EOverCoatValue {
	if (!overcoatValue) {
		return EOverCoatValue.Unknow;
	}

	switch (overcoatValue) {
		case EOverCoatValue.Has:
		case EOverCoatValue.No:
			return overcoatValue;

		default:
			return EOverCoatValue.Unknow;
	}
}

export function getValidTextureValue(
	textureValue?: ETextureValue
): ETextureValue {
	if (!textureValue) {
		return ETextureValue.Unknow;
	}

	switch (textureValue) {
		case ETextureValue.PureColor:
		case ETextureValue.Stripe:
		case ETextureValue.Pattern:
		case ETextureValue.Joint:
		case ETextureValue.Grid:
		case ETextureValue.Uniform:
		case ETextureValue.Other:
			return textureValue;

		default:
			return ETextureValue.Unknow;
	}
}

export function getValidClothesColorValue(
	colorValue: EColorValue
): EColorValue {
	if (!colorValue) {
		return EColorValue.Unknow;
	}

	switch (colorValue) {
		case EColorValue.Black:
		case EColorValue.Blue:
		case EColorValue.Gray:
		case EColorValue.Green:
		case EColorValue.Orange:
		case EColorValue.Purple:
		case EColorValue.Yellow:
		case EColorValue.White:
			return colorValue;

		default:
			return EColorValue.Unknow;
	}
}

export function getValidTrousersColorValue(
	colorValue: EColorValue
): EColorValue {
	if (!colorValue) {
		return EColorValue.Unknow;
	}

	switch (colorValue) {
		case EColorValue.Black:
		case EColorValue.Blue:
		case EColorValue.Gray:
		case EColorValue.Green:
		case EColorValue.Orange:
		case EColorValue.Purple:
		case EColorValue.Yellow:
		case EColorValue.White:
			return colorValue;

		default:
			return EColorValue.Unknow;
	}
}

export function getValidBaggageValue(
	baggageValue: EBaggageValue
): EBaggageValue {
	if (!baggageValue) {
		return EBaggageValue.Unknow;
	}

	switch (baggageValue) {
		case EBaggageValue.No:
		case EBaggageValue.Yes:
			return baggageValue;

		default:
			return EBaggageValue.Unknow;
	}
}

export function getValidCarColorValue(
	carColorValue?: ECarColorValue
): ECarColorValue {
	if (!carColorValue) {
		return ECarColorValue.Unknow;
	}

	switch (carColorValue) {
		case ECarColorValue.Black:
		case ECarColorValue.Blue:
		case ECarColorValue.Brown:
		case ECarColorValue.Green:
		case ECarColorValue.Silvery:
		case ECarColorValue.Red:
		case ECarColorValue.White:
		case ECarColorValue.Yellow:
		case ECarColorValue.Pink:
		case ECarColorValue.Golden:
		case ECarColorValue.Purple:
		case ECarColorValue.Gray:
		case ECarColorValue.Cyan:
		case ECarColorValue.NotClear:
			return carColorValue;

		default:
			return ECarColorValue.Unknow;
	}
}

export function getValidCarTypeValue(
	carTypeValue?: ECarTypeValue
): ECarTypeValue {
	if (!carTypeValue) {
		return ECarTypeValue.Unknow;
	}

	switch (carTypeValue) {
		case ECarTypeValue.Sedan:
		case ECarTypeValue.Suv:
		case ECarTypeValue.Mpv:
		case ECarTypeValue.Minivan:
		case ECarTypeValue.LargeTruck:
		case ECarTypeValue.LightBus:
		case ECarTypeValue.MidiBus:
		case ECarTypeValue.LargeBus:
		case ECarTypeValue.Tricycle:
		case ECarTypeValue.Microvan:
		case ECarTypeValue.Pickup:
		case ECarTypeValue.Trailer:
		case ECarTypeValue.ConcreateMixer:
		case ECarTypeValue.Tanker:
		case ECarTypeValue.CraneTruck:
		case ECarTypeValue.FireTruck:
		case ECarTypeValue.SlagCar:
		case ECarTypeValue.EscortVehicle:
		case ECarTypeValue.EngineeringRepairCar:
		case ECarTypeValue.RescueCar:
		case ECarTypeValue.BulkLorry:
		case ECarTypeValue.NotClear:
			return carTypeValue;

		default:
			return ECarTypeValue.Unknow;
	}
}

export function getValidCarLicenseColorValue(
	carLicenseColroValue?: ECarLicenseColorValue
): ECarLicenseColorValue {
	if (!carLicenseColroValue) {
		return ECarLicenseColorValue.Unknow;
	}

	switch (carLicenseColroValue) {
		case ECarLicenseColorValue.Yellow:
		case ECarLicenseColorValue.Blue:
		case ECarLicenseColorValue.Black:
		case ECarLicenseColorValue.White:
		case ECarLicenseColorValue.Green:
		case ECarLicenseColorValue.YellowGreen:
		case ECarLicenseColorValue.GradientGreen:
			return carLicenseColroValue;

		default:
			return ECarLicenseColorValue.Unknow;
	}
}

// #endregion

// #region

/************************* 辅助方法 ××××××××****×××××××××*/

// #endregion

// 后台返回的所有支持的属性
export interface IBSupportedAttributes {
	age: number;
	gender: string;
	race: string;
	hat: string;
	glasses: string;
	mask: string;

	// 人体属性
	coatStyle: string;
	coatPattern: string;
	coatColor: string;
	pantsStyle: string;
	pantsColor: string;
	pantsPattern: string;
	hasCoat: string;

	// 箱包
	handbag: string;
	singlebag: string;
	backbag: string;
	drawbox: string;
	cart: string;

	// 车辆属性
	type: string;
	color: string;
	brandCode: string; // code
	brand: string; // 车型号
	plateColor: string;
	plateNumber: string;
}

export function toFAttributesFromBAttributes(
	params: Partial<IBSupportedAttributes>
): Array<IFAttributeProperty> {
	let attributes: Array<IFAttributeProperty> = [
		..._toFaceFAttributesFromBAttributes(params),
		..._toBodyFAttributesFromBAttributes(params),
		..._toCarFAttributesFromBAttributes(params)
	];
	return attributes;
}

function _toFaceFAttributesFromBAttributes(
	params: Partial<IBSupportedAttributes> | null
): Array<IFAttributeProperty> {
	let result: Array<IFAttributeProperty> = [];
	if (!params) {
		return result;
	}

	// gender
	let genderValue: EGenderValue | null = getValidGenderValue(
		params.gender as EGenderValue
	);
	let genderAttribute: IFAttributeProperty | null = generateFaceGenderProperty(
		genderValue
	);
	if (genderAttribute) {
		result.push(genderAttribute);
	}

	// age
	let ageValue: EAgeValue | null = getValidAgeValue(params.age);
	let ageAttribute: IFAttributeProperty | null = generateFaceAgeProperty(
		ageValue
	);
	if (ageAttribute) {
		result.push(ageAttribute);
	}

	// glasses
	let glassesValue: EGlassesValue | null = getValidGlassesValue(
		params.glasses as EGlassesValue
	);
	let glassesAttribute: IFAttributeProperty | null = generateFaceGlassProperty(
		glassesValue
	);
	if (glassesAttribute) {
		result.push(glassesAttribute);
	}

	// hat
	let hatValue: EHatValue | null = getValidHatValue(params.hat as EHatValue);
	let hatAttribute: IFAttributeProperty | null = generateFaceHatProperty(
		hatValue
	);
	if (hatAttribute) {
		result.push(hatAttribute);
	}

	// race
	let raceValue: ERaceValue | null = getValidRaceValue(
		params.race as ERaceValue
	);
	let raceAttribute: IFAttributeProperty | null = generateFaceRaceProperty(
		raceValue
	);
	if (raceAttribute) {
		result.push(raceAttribute);
	}

	// mask
	let maskValue: EFaceMaskValue | null = getValidFaceMaskValue(
		params.mask as EFaceMaskValue
	);
	let maskAttribute: IFAttributeProperty | null = generateFaceMaskProperty(
		maskValue
	);
	if (maskAttribute) {
		result.push(maskAttribute);
	}

	return result;
}

function _toBodyFAttributesFromBAttributes(
	params: Partial<IBSupportedAttributes> | null
): Array<IFAttributeProperty> {
	let result: Array<IFAttributeProperty> = [];
	if (!params) {
		return result;
	}

	// clothes
	let clothesValue: EClothesValue | null = getValidClothesTypeValue(
		params.coatStyle as EClothesValue
	);
	let clothesAttribute: IFAttributeProperty | null = generateBodyClothesTypeProperty(
		clothesValue
	);
	if (clothesAttribute) {
		result.push(clothesAttribute);
	}

	// clothes texture
	let clothesTextureValue: ETextureValue | null = getValidTextureValue(
		params.coatPattern as ETextureValue
	);
	let clothesTextureAttribute: IFAttributeProperty | null = generateBodyClothesTextureProperty(
		clothesTextureValue
	);
	if (clothesTextureAttribute) {
		result.push(clothesTextureAttribute);
	}

	// clothes color
	let clothesColorValue: EColorValue | null = getValidClothesColorValue(
		params.coatColor as EColorValue
	);
	let clothesColorAttribute: IFAttributeProperty | null = generateBodyClotheColorProperty(
		clothesColorValue
	);
	if (clothesColorAttribute) {
		result.push(clothesColorAttribute);
	}

	// trousers
	let trouserValue: ETrousersValue | null = getValidTrousersValue(
		params.pantsStyle as ETrousersValue
	);
	let trousersTypeAttribute: IFAttributeProperty | null = generateBodyTrousersTypeProperty(
		trouserValue
	);
	if (trousersTypeAttribute) {
		result.push(trousersTypeAttribute);
	}

	// trousers texture
	let trouserTextureValue: ETextureValue | null = getValidTextureValue(
		params.pantsPattern as ETextureValue
	);
	let trousersTextureAttribute: IFAttributeProperty | null = generateBodyTrousersTextureProperty(
		trouserTextureValue
	);
	if (trousersTextureAttribute) {
		result.push(trousersTextureAttribute);
	}

	// trousers color
	let trouserColorValue: EColorValue | null = getValidTrousersColorValue(
		params.pantsColor as EColorValue
	);
	let trousersColorAttribute: IFAttributeProperty | null = generateBodyTrousersColorProperty(
		trouserColorValue
	);
	if (trousersColorAttribute) {
		result.push(trousersColorAttribute);
	}

	// over coat
	let overcoatValue: EOverCoatValue | null = getValidOverCoatValue(
		params.hasCoat as EOverCoatValue
	);
	let overcoatProperty: IFAttributeProperty | null = generateBodyOvercoatProperty(
		overcoatValue
	);
	if (overcoatProperty) {
		result.push(overcoatProperty);
	}

	// handbag
	let handbagValue: EBaggageValue | null = getValidBaggageValue(
		params.handbag as EBaggageValue
	);
	let handbagProperty: IFAttributeProperty | null = generateBodyHandbagProperty(
		handbagValue
	);
	if (handbagProperty) {
		result.push(handbagProperty);
	}

	// singlebag
	let singleValue: EBaggageValue | null = getValidBaggageValue(
		params.singlebag as EBaggageValue
	);
	let singlebagProperty: IFAttributeProperty | null = generateSinglebagProperty(
		singleValue
	);
	if (singlebagProperty) {
		result.push(singlebagProperty);
	}

	// bag
	let bagValue: EBaggageValue | null = getValidBaggageValue(
		params.backbag as EBaggageValue
	);
	let bagProperty: IFAttributeProperty | null = generateBagProperty(bagValue);
	if (bagProperty) {
		result.push(bagProperty);
	}

	// trunk
	let drawboxValue: EBaggageValue | null = getValidBaggageValue(
		params.drawbox as EBaggageValue
	);
	let trunkProperty: IFAttributeProperty | null = generateTrunkProperty(
		drawboxValue
	);
	if (trunkProperty) {
		result.push(trunkProperty);
	}

	// trunk
	let cartValue: EBaggageValue | null = getValidBaggageValue(
		params.cart as EBaggageValue
	);
	let cartProperty: IFAttributeProperty | null = generateBodyCartProperty(
		cartValue
	);
	if (cartProperty) {
		result.push(cartProperty);
	}

	return result;
}

function _toCarFAttributesFromBAttributes(
	params: Partial<IBSupportedAttributes>
): Array<IFAttributeProperty> {
	let result: Array<IFAttributeProperty> = [];
	if (!params) {
		return result;
	}

	// 车辆颜色
	let carColor: ECarColorValue | null = getValidCarColorValue(
		params.color as ECarColorValue
	);
	let carColorProperty: IFAttributeProperty | null = generateVehicleColorProperty(
		carColor
	);

	if (!carColorProperty) {
		// 生成未识别
		carColorProperty = generateVehicleColorUnknownProperty();
	}

	if (carColorProperty) {
		result.push(carColorProperty);
	}

	// 车辆类型
	let carType: ECarTypeValue | null = getValidCarTypeValue(
		params.type as ECarTypeValue
	);
	let carTypeProperty: IFAttributeProperty | null = generateVehicleTypeProperty(
		carType
	);

	if (!carTypeProperty) {
		carTypeProperty = generateVehicleTypeUnknownProperty();
	}

	if (carTypeProperty) {
		result.push(carTypeProperty);
	}

	// 车牌
	let licenseProperty: IFAttributeProperty | null = generateVehicleLicenseNumberProperty(
		params.plateNumber || '' // TODO: 强制表明有车牌
	);
	if (licenseProperty) {
		result.push(licenseProperty);
	}

	// 车牌颜色
	let licenseColor: ECarLicenseColorValue | null = getValidCarLicenseColorValue(
		params.plateColor as ECarLicenseColorValue
	);
	let licenseColorProperty: IFAttributeProperty | null = generateVehicleLicenseColorProperty(
		licenseColor
	);
	if (licenseColorProperty) {
		result.push(licenseColorProperty);
	}

	// TODO: 车辆型号
	let brandProperty: IFAttributeProperty | null = generateVehicleBrandSeriesProperty(
		params.brandCode
	);
	if (brandProperty) {
		result.push(brandProperty);
	} else {
		// 对于车牌，我们继续判断一下brand字段
		brandProperty = generateVehicleBrandSeriesPropertyFromBrandName(
			params.brand
		);

		//
		if (!brandProperty) {
			brandProperty = generateVehicleBrandSeriesUnknownProperty();
		}

		if (brandProperty) {
			result.push(brandProperty);
		}
	}

	return result;
}
