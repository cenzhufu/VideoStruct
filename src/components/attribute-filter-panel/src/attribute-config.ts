import {
	ECarColorValue,
	EVehicleAttributeType,
	ECarLicenseColorValue,
	ECarTypeValue
} from './../../../type-define/types/attributes/attribute-type';
import { guid } from 'ifvendors/utils/guid';
import {
	EBodyAttributeType,
	EFaceAttributeType,
	EGenderValue,
	ETargetType,
	EAgeValue,
	EGlassesValue,
	ERaceValue,
	EFaceMaskValue,
	EClothesValue,
	ETextureValue,
	EColorValue,
	ETrousersValue,
	EOverCoatValue,
	EBaggageValue,
	EHatValue,
	IFAttributeProperty,
	IFAttributeGroupProperty,
	generateFaceGenderProperty,
	generateFaceAgeProperty,
	generateFaceGlassProperty,
	generateFaceRaceProperty,
	generateFaceHatProperty,
	generateFaceMaskProperty,
	generateVehicleColorProperty,
	generateVehicleLicenseColorProperty,
	generateVehicleTypeProperty
} from 'sttypedefine';
import {
	generateBodyClothesTypeProperty,
	generateBodyClothesTextureProperty,
	generateBodyClotheColorProperty,
	generateBodyTrousersTypeProperty,
	generateBodyTrousersTextureProperty,
	generateBodyTrousersColorProperty,
	generateBodyOvercoatProperty,
	generateBodyHandbagProperty,
	generateSinglebagProperty,
	generateBagProperty,
	generateTrunkProperty,
	generateBodyCartProperty
} from 'stsrc/type-define/types/attributes/body-attributes-generators';

export const FaceGenderAttributeList: Array<IFAttributeProperty> = [
	generateFaceGenderProperty(EGenderValue.Man) as IFAttributeProperty,
	generateFaceGenderProperty(EGenderValue.Woman) as IFAttributeProperty
];

export const FaceAgeAttributeList: Array<IFAttributeProperty> = [
	generateFaceAgeProperty(EAgeValue.Child) as IFAttributeProperty,
	generateFaceAgeProperty(EAgeValue.Young) as IFAttributeProperty,
	generateFaceAgeProperty(EAgeValue.MiddleAage) as IFAttributeProperty,
	generateFaceAgeProperty(EAgeValue.Old) as IFAttributeProperty
];

export const FaceGlassesAttributeList: Array<IFAttributeProperty> = [
	generateFaceGlassProperty(EGlassesValue.Has) as IFAttributeProperty,
	generateFaceGlassProperty(EGlassesValue.SunGlasses) as IFAttributeProperty,
	generateFaceGlassProperty(EGlassesValue.No) as IFAttributeProperty
];

export const FaceRaceAttributeList: Array<IFAttributeProperty> = [
	generateFaceRaceProperty(ERaceValue.Chinese) as IFAttributeProperty,
	generateFaceRaceProperty(ERaceValue.Other) as IFAttributeProperty
];

export const FaceHatAttributeList: Array<IFAttributeProperty> = [
	generateFaceHatProperty(EHatValue.Has) as IFAttributeProperty,
	generateFaceHatProperty(EHatValue.No) as IFAttributeProperty
];

export const FaceMaskAttributeList: Array<IFAttributeProperty> = [
	generateFaceMaskProperty(EFaceMaskValue.Has) as IFAttributeProperty,
	generateFaceMaskProperty(EFaceMaskValue.No) as IFAttributeProperty
];

// 人脸属性
export const FaceAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_GENDER',
		defaultTip: '性别',
		items: FaceGenderAttributeList,

		uuid: guid(),
		targetType: ETargetType.Face,
		attributeType: EFaceAttributeType.Gender
	},
	{
		tipLabelKey: 'ATTRIBUTE_AGE',
		defaultTip: '年龄',
		items: FaceAgeAttributeList,

		uuid: guid(),
		targetType: ETargetType.Face,
		attributeType: EFaceAttributeType.Age
	},
	{
		tipLabelKey: 'ATTRIBUTE_GLASSES',
		defaultTip: '眼镜',
		items: FaceGlassesAttributeList,

		uuid: guid(),
		targetType: ETargetType.Face,
		attributeType: EFaceAttributeType.Glasses
	},
	{
		tipLabelKey: 'ATTRIBUTE_RACE',
		defaultTip: '民族',
		items: FaceRaceAttributeList,

		uuid: guid(),
		targetType: ETargetType.Face,
		attributeType: EFaceAttributeType.Race
	},
	{
		tipLabelKey: 'ATTRIBUTE_Hat',
		defaultTip: '帽子',
		items: FaceHatAttributeList,

		uuid: guid(),
		targetType: ETargetType.Face,
		attributeType: EFaceAttributeType.Hat
	},
	{
		tipLabelKey: 'ATTRIBUTE_MASK',
		defaultTip: '口罩',
		items: FaceMaskAttributeList,

		uuid: guid(),
		targetType: ETargetType.Face,
		attributeType: EFaceAttributeType.Mask
	}
];

export const BodyClothesAttributeList: Array<IFAttributeProperty> = [
	generateBodyClothesTypeProperty(
		EClothesValue.LongSleeve
	) as IFAttributeProperty,
	generateBodyClothesTypeProperty(
		EClothesValue.ShortSleeve
	) as IFAttributeProperty
];

export const BodyClothesTextureAttributeList: Array<IFAttributeProperty> = [
	generateBodyClothesTextureProperty(
		ETextureValue.PureColor
	) as IFAttributeProperty,
	generateBodyClothesTextureProperty(
		ETextureValue.Stripe
	) as IFAttributeProperty,
	generateBodyClothesTextureProperty(
		ETextureValue.Pattern
	) as IFAttributeProperty,
	generateBodyClothesTextureProperty(
		ETextureValue.Joint
	) as IFAttributeProperty,
	generateBodyClothesTextureProperty(ETextureValue.Grid) as IFAttributeProperty,
	generateBodyClothesTextureProperty(
		ETextureValue.Uniform
	) as IFAttributeProperty,
	generateBodyClothesTextureProperty(ETextureValue.Other) as IFAttributeProperty
];

export const BodyClothesColorAttributeList: Array<IFAttributeProperty> = [
	generateBodyClotheColorProperty(EColorValue.Black) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.White) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Red) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Green) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Yellow) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Blue) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Purple) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Gray) as IFAttributeProperty,
	generateBodyClotheColorProperty(EColorValue.Orange) as IFAttributeProperty
];

// 衣服属性
export const BodyClothesAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_CLOTHES',
		defaultTip: '上衣',
		items: BodyClothesAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.Clothes
	},
	{
		tipLabelKey: 'ATTRIBUTE_CLOTHES_TEXTURE',
		defaultTip: '上衣款式',
		items: BodyClothesTextureAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.ClothesTexture
	},
	{
		tipLabelKey: 'ATTRIBUTE_CLOTHES_COLOR',
		defaultTip: '上衣颜色',
		items: BodyClothesColorAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.ClothesColor
	}
];

export const BodyTrousersAttributeList: Array<IFAttributeProperty> = [
	generateBodyTrousersTypeProperty(
		ETrousersValue.LongTrouser
	) as IFAttributeProperty,
	generateBodyTrousersTypeProperty(
		ETrousersValue.ShortTrouser
	) as IFAttributeProperty,
	generateBodyTrousersTypeProperty(ETrousersValue.Skirt) as IFAttributeProperty
];

export const BodyTrousersTextureAttributeList: Array<IFAttributeProperty> = [
	generateBodyTrousersTextureProperty(
		ETextureValue.PureColor
	) as IFAttributeProperty,
	generateBodyTrousersTextureProperty(
		ETextureValue.Stripe
	) as IFAttributeProperty,
	generateBodyTrousersTextureProperty(
		ETextureValue.Pattern
	) as IFAttributeProperty,
	generateBodyTrousersTextureProperty(
		ETextureValue.Joint
	) as IFAttributeProperty,
	generateBodyTrousersTextureProperty(
		ETextureValue.Grid
	) as IFAttributeProperty,
	generateBodyTrousersTextureProperty(
		ETextureValue.Uniform
	) as IFAttributeProperty,
	generateBodyTrousersTextureProperty(
		ETextureValue.Other
	) as IFAttributeProperty
];

export const BodyTrousersColorAttributeList: Array<IFAttributeProperty> = [
	generateBodyTrousersColorProperty(EColorValue.Black) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.White) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Red) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Green) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Yellow) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Blue) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Purple) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Gray) as IFAttributeProperty,
	generateBodyTrousersColorProperty(EColorValue.Orange) as IFAttributeProperty
];
// 裤子属性
export const BodyTrousersAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_TROUSERS',
		defaultTip: '下衣',
		items: BodyTrousersAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.Trousers
	},
	{
		tipLabelKey: 'ATTRIBUTE_TROUSERS_TEXTURE',
		defaultTip: '下衣款式',
		items: BodyTrousersTextureAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.TrousersTexture
	},
	{
		tipLabelKey: 'ATTRIBUTE_TROUSERS_COLOR',
		defaultTip: '下衣颜色',
		items: BodyTrousersColorAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.TrousersColor
	}
];

export const BodyOvercoatAttributeList: Array<IFAttributeProperty> = [
	generateBodyOvercoatProperty(EOverCoatValue.Has) as IFAttributeProperty,
	generateBodyOvercoatProperty(EOverCoatValue.No) as IFAttributeProperty
];

// 大衣属性
export const BodyOvercoatAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_COAT',
		defaultTip: '大衣',
		items: BodyOvercoatAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.Coat
	}
];

export const BodyHandbagAttributeList: Array<IFAttributeProperty> = [
	generateBodyHandbagProperty(EBaggageValue.Yes) as IFAttributeProperty,
	generateBodyHandbagProperty(EBaggageValue.No) as IFAttributeProperty
];

export const BodySingleBagAttributeList: Array<IFAttributeProperty> = [
	generateSinglebagProperty(EBaggageValue.Yes) as IFAttributeProperty,
	generateSinglebagProperty(EBaggageValue.No) as IFAttributeProperty
];

export const BodyBackBagAttributeList: Array<IFAttributeProperty> = [
	generateBagProperty(EBaggageValue.Yes) as IFAttributeProperty,
	generateBagProperty(EBaggageValue.No) as IFAttributeProperty
];

export const BodyTrunkAttributeList: Array<IFAttributeProperty> = [
	generateTrunkProperty(EBaggageValue.Yes) as IFAttributeProperty,
	generateTrunkProperty(EBaggageValue.No) as IFAttributeProperty
];

export const BodyCartAttributeList: Array<IFAttributeProperty> = [
	generateBodyCartProperty(EBaggageValue.Yes) as IFAttributeProperty,
	generateBodyCartProperty(EBaggageValue.No) as IFAttributeProperty
];

// 携带物属性
export const BodyLagguageAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_HAND_BAG',
		defaultTip: '手提包',
		items: BodyHandbagAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.HandBag
	},
	{
		tipLabelKey: 'ATTRIBUTE_SINGLE_SHOULDER_BAG',
		defaultTip: '单肩包',
		items: BodySingleBagAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.SingleShouldBag
	},
	{
		tipLabelKey: 'ATTRIBUTE_BACK_BAG',
		defaultTip: '双肩包',
		items: BodyBackBagAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.Backbag
	},
	{
		tipLabelKey: 'ATTRIBUTE_TRUNK',
		defaultTip: '拉杆箱',
		items: BodyTrunkAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.Drawbox
	},
	{
		tipLabelKey: 'ATTRIBUTE_CART',
		defaultTip: '手推车',
		items: BodyCartAttributeList,

		uuid: guid(),
		targetType: ETargetType.Body,
		attributeType: EBodyAttributeType.Cart
	}
];

export const VehicleColorAttributeList: Array<IFAttributeProperty> = [
	generateVehicleColorProperty(ECarColorValue.Black) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Blue) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Brown) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Golden) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Gray) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Green) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Cyan) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Pink) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Purple) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Red) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Silvery) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.White) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.Yellow) as IFAttributeProperty,
	generateVehicleColorProperty(ECarColorValue.NotClear) as IFAttributeProperty
];

// 车辆颜色
export const VehicleColorAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_VEHICLE_COLOR',
		defaultTip: '车辆颜色',
		items: VehicleColorAttributeList,

		uuid: guid(),
		targetType: ETargetType.Vehicle,
		attributeType: EVehicleAttributeType.CarColor
	}
];

// 车牌颜色
export const VehicleLicenseColorAttributeList: Array<IFAttributeProperty> = [
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.Black
	) as IFAttributeProperty,
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.Blue
	) as IFAttributeProperty,
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.GradientGreen
	) as IFAttributeProperty,
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.Green
	) as IFAttributeProperty,
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.White
	) as IFAttributeProperty,
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.Yellow
	) as IFAttributeProperty,
	generateVehicleLicenseColorProperty(
		ECarLicenseColorValue.YellowGreen
	) as IFAttributeProperty
];

export const VehicleLicenseColorAttributeGroups: Array<
	IFAttributeGroupProperty
> = [
	{
		tipLabelKey: 'ATTRIBUTE_VEHICLE_LICENSE_COLOR',
		defaultTip: '车牌颜色',
		items: VehicleLicenseColorAttributeList,

		uuid: guid(),
		targetType: ETargetType.Vehicle,
		attributeType: EVehicleAttributeType.CarLicenseColor
	}
];

// 车辆品牌
export const VehicleTypeAttributeList: Array<IFAttributeProperty> = [
	generateVehicleTypeProperty(ECarTypeValue.BulkLorry) as IFAttributeProperty,
	generateVehicleTypeProperty(
		ECarTypeValue.ConcreateMixer
	) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.CraneTruck) as IFAttributeProperty,
	generateVehicleTypeProperty(
		ECarTypeValue.EngineeringRepairCar
	) as IFAttributeProperty,
	generateVehicleTypeProperty(
		ECarTypeValue.EscortVehicle
	) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.FireTruck) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.LargeBus) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.LargeTruck) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.LightBus) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Microvan) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.MidiBus) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Minivan) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Mpv) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Pickup) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.RescueCar) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Sedan) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.SlagCar) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Suv) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Tanker) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Trailer) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.Tricycle) as IFAttributeProperty,
	generateVehicleTypeProperty(ECarTypeValue.NotClear) as IFAttributeProperty
];

export const VehicleTypeAttributeGroups: Array<IFAttributeGroupProperty> = [
	{
		tipLabelKey: 'ATTRIBUTE_FILETER_CAR_TYPE',
		defaultTip: '车辆类型',
		items: VehicleTypeAttributeList,

		uuid: guid(),
		targetType: ETargetType.Vehicle,
		attributeType: EVehicleAttributeType.CarType
	}
];

export const AllAttributes = [
	...FaceGenderAttributeList,
	...FaceAgeAttributeList,
	...FaceGlassesAttributeList,
	...FaceRaceAttributeList,
	...FaceHatAttributeList,
	...FaceMaskAttributeList,
	...BodyClothesAttributeList,
	...BodyClothesTextureAttributeList,
	...BodyClothesColorAttributeList,
	...BodyTrousersAttributeList,
	...BodyTrousersTextureAttributeList,
	...BodyTrousersColorAttributeList,
	...BodyOvercoatAttributeList,
	...BodyHandbagAttributeList,
	...BodySingleBagAttributeList,
	...BodyBackBagAttributeList,
	...BodyTrunkAttributeList,
	...BodyCartAttributeList,
	...VehicleColorAttributeList
];

// 提供给外界使用的函数
