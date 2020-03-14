import {
	IFAttributeProperty,
	EBodyAttributeType,
	EBaggageValue,
	EOverCoatValue,
	EColorValue,
	ETextureValue,
	ETrousersValue,
	EClothesValue
} from './attribute-type';
import { _generateProperty } from './attribute-generator';
import { ETargetType } from '../target-type';
function generateBodyCartNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Cart,
		EBaggageValue.No,
		'无',
		'ATTRIBUTE_NO',
		'手推车',
		'ATTRIBUTE_CART'
	);
}

function generateBodyCartHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Cart,
		EBaggageValue.Yes,
		'有',
		'ATTRIBUTE_YES',
		'手推车',
		'ATTRIBUTE_CART'
	);
}

function generateBodyTrunkNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Drawbox,
		EBaggageValue.No,
		'无',
		'ATTRIBUTE_NO',
		'拉杆箱',
		'ATTRIBUTE_TRUNK'
	);
}

function generateBodyTrunkHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Drawbox,
		EBaggageValue.Yes,
		'有',
		'ATTRIBUTE_YES',
		'拉杆箱',
		'ATTRIBUTE_TRUNK'
	);
}

function generateBodyBagNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Backbag,
		EBaggageValue.No,
		'无',
		'ATTRIBUTE_NO',
		'双肩包',
		'ATTRIBUTE_BACK_BAG'
	);
}

function generateBodyBagHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Backbag,
		EBaggageValue.Yes,
		'有',
		'ATTRIBUTE_YES',
		'双肩包',
		'ATTRIBUTE_BACK_BAG'
	);
}

function generateSingleBagNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.SingleShouldBag,
		EBaggageValue.No,
		'无',
		'ATTRIBUTE_NO',
		'单肩包',
		'ATTRIBUTE_SINGLE_SHOULDER_BAG'
	);
}

function generateSingleBagHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.SingleShouldBag,
		EBaggageValue.Yes,
		'有',
		'ATTRIBUTE_YES',
		'单肩包',
		'ATTRIBUTE_SINGLE_SHOULDER_BAG'
	);
}

function generateBodyHandbagNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.HandBag,
		EBaggageValue.No,
		'无',
		'ATTRIBUTE_NO',
		'手提包',
		'ATTRIBUTE_HAND_BAG'
	);
}

function generateBodyHandbagHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.HandBag,
		EBaggageValue.Yes,
		'有',
		'ATTRIBUTE_YES',
		'手提包',
		'ATTRIBUTE_HAND_BAG'
	);
}

function generateOvercoatNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Coat,
		EOverCoatValue.No,
		'无',
		'ATTRIBUTE_NO_COAT',
		'大衣',
		'ATTRIBUTE_COAT',
		[
			EBodyAttributeType.Clothes,
			EBodyAttributeType.ClothesTexture,
			EBodyAttributeType.ClothesColor,
			EBodyAttributeType.Trousers,
			EBodyAttributeType.TrousersColor,
			EBodyAttributeType.TrousersTexture
		],
		[]
	);
}

function generateOvercoatHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Coat,
		EOverCoatValue.Has,
		'有',
		'ATTRIBUTE_HAVE_COAT',
		'大衣',
		'ATTRIBUTE_COAT',
		[
			EBodyAttributeType.Clothes,
			EBodyAttributeType.ClothesTexture,
			EBodyAttributeType.ClothesColor,
			EBodyAttributeType.Trousers,
			EBodyAttributeType.TrousersColor,
			EBodyAttributeType.TrousersTexture
		],
		[]
	);
}

function generateTrousersColorOrangeProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Orange,
		'橙色',
		'ATTRIBUTE_COLOR_ORANGE',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorGrayProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Gray,
		'灰色',
		'ATTRIBUTE_COLOR_GRAY',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorPurpleProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Purple,
		'紫色',
		'ATTRIBUTE_COLOR_PURPLE',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorBlueProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Blue,
		'蓝色',
		'ATTRIBUTE_COLOR_BLUE',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorYellowProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Yellow,
		'黄色',
		'ATTRIBUTE_COLOR_YELLOW',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorGreenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Green,
		'绿色',
		'ATTRIBUTE_COLOR_GREEN',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorRedProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Red,
		'红色',
		'ATTRIBUTE_COLOR_RED',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorWhiteProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.White,
		'白色',
		'ATTRIBUTE_COLOR_WHITE',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersColorBlackProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersColor,
		EColorValue.Black,
		'黑色',
		'ATTRIBUTE_COLOR_BLACK',
		'下衣颜色',
		'ATTRIBUTE_TROUSERS_COLOR'
	);
}

function generateTrousersTextureOtherProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.Other,
		'其他',
		'ATTRIBUTE_OTHER',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.TrousersColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateTrousersTextureUniformProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.Uniform,
		'制服',
		'ATTRIBUTE_UNIFORM',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.TrousersColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateTrousersTextureGridProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.Grid,
		'格子',
		'ATTRIBUTE_GRID',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.TrousersColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateTrousersTextureJointProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.Joint,
		'拼接',
		'ATTRIBUTE_SPLICE',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.TrousersColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateTrousersTexturePictureProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.Pattern,
		'图案',
		'ATTRIBUTE_PICTURE',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.TrousersColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateTrousersTextureStripeProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.Stripe,
		'条纹',
		'ATTRIBUTE_STRIPE',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.TrousersColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateTrousersTexturePureProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.TrousersTexture,
		ETextureValue.PureColor,
		'纯色',
		'ATTRIBUTE_PUR_COLOR',
		'下衣款式',
		'ATTRIBUTE_TROUSERS_TEXTURE',
		[EBodyAttributeType.Coat],
		[EBodyAttributeType.TrousersColor]
	);
}

function generateBodyTrousersTypeShirtProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Trousers,
		ETrousersValue.Skirt,
		'裙子',
		'ATTRIBUTE_SKIRT',
		'下衣',
		'ATTRIBUTE_TROUSERS',
		[EBodyAttributeType.Coat],
		[]
	);
}

function generateBodyTrousersTypeShortProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Trousers,
		ETrousersValue.ShortTrouser,
		'短裤',
		'ATTRIBUTE_SHORT_TROUDERS',
		'下衣',
		'ATTRIBUTE_TROUSERS',
		[EBodyAttributeType.Coat],
		[]
	);
}

function generateBodyTrousersTypeLongProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Trousers,
		ETrousersValue.LongTrouser,
		'长裤',
		'ATTRIBUTE_LONG_TROUDERS',
		'下衣',
		'ATTRIBUTE_TROUSERS',
		[EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesColorOrangeProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Orange,
		'橙色',
		'ATTRIBUTE_COLOR_ORANGE',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorGrayProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Gray,
		'灰色',
		'ATTRIBUTE_COLOR_GRAY',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorPurpleProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Purple,
		'紫色',
		'ATTRIBUTE_COLOR_PURPLE',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorBlueProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Blue,
		'蓝色',
		'ATTRIBUTE_COLOR_BLUE',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorYellowProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Yellow,
		'黄色',
		'ATTRIBUTE_COLOR_YELLOW',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorGreenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Green,
		'绿色',
		'ATTRIBUTE_COLOR_GREEN',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorRedProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Red,
		'红色',
		'ATTRIBUTE_COLOR_RED',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorWhiteProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.White,
		'白色',
		'ATTRIBUTE_COLOR_WHITE',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesColorBlackProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesColor,
		EColorValue.Black,
		'黑色',
		'ATTRIBUTE_COLOR_BLACK',
		'上衣颜色',
		'ATTRIBUTE_CLOTHES_COLOR'
	);
}

function generateClothesTextureOtherProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.Other,
		'其他',
		'ATTRIBUTE_OTHER',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.ClothesColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesTextureUniformProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.Uniform,
		'制服',
		'ATTRIBUTE_UNIFORM',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.ClothesColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesTextureGridProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.Grid,
		'格子',
		'ATTRIBUTE_GRID',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.ClothesColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesTextureJointProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.Joint,
		'拼接',
		'ATTRIBUTE_SPLICE',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.ClothesColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesTexturePictureProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.Pattern,
		'图案',
		'ATTRIBUTE_PICTURE',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.ClothesColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesTextureStripeProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.Stripe,
		'条纹',
		'ATTRIBUTE_STRIPE',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.ClothesColor, EBodyAttributeType.Coat],
		[]
	);
}

function generateClothesTexturePureProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.ClothesTexture,
		ETextureValue.PureColor,
		'纯色',
		'ATTRIBUTE_PUR_COLOR',
		'上衣款式',
		'ATTRIBUTE_CLOTHES_TEXTURE',
		[EBodyAttributeType.Coat],
		[EBodyAttributeType.ClothesColor]
	);
}

function generateBodyClothesTypeShortSheetProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Clothes,
		EClothesValue.ShortSleeve,
		'短袖',
		'ATTRIBUTE_SHORT_SLEEVE',
		'上衣',
		'ATTRIBUTE_CLOTHES',
		[EBodyAttributeType.Coat],
		[]
	);
}

function generateBodyClothesTypeLongSheetProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Body,
		EBodyAttributeType.Clothes,
		EClothesValue.LongSleeve,
		'长袖',
		'ATTRIBUTE_LONG_SLEEVE',
		'上衣',
		'ATTRIBUTE_CLOTHES',
		[EBodyAttributeType.Coat],
		[]
	);
}

export function generateBodyClothesTypeProperty(
	value: EClothesValue
): IFAttributeProperty | null {
	switch (value) {
		case EClothesValue.LongSleeve:
			return generateBodyClothesTypeLongSheetProperty();

		case EClothesValue.ShortSleeve:
			return generateBodyClothesTypeShortSheetProperty();

		default:
			return null;
	}
}

export function generateBodyClothesTextureProperty(
	value: ETextureValue
): IFAttributeProperty | null {
	switch (value) {
		case ETextureValue.PureColor:
			return generateClothesTexturePureProperty();

		case ETextureValue.Stripe:
			return generateClothesTextureStripeProperty();

		case ETextureValue.Pattern:
			return generateClothesTexturePictureProperty();

		case ETextureValue.Joint:
			return generateClothesTextureJointProperty();

		case ETextureValue.Grid:
			return generateClothesTextureGridProperty();

		case ETextureValue.Uniform:
			return generateClothesTextureUniformProperty();

		case ETextureValue.Other:
			return generateClothesTextureOtherProperty();

		default:
			return null;
	}
}

export function generateBodyClotheColorProperty(
	value: EColorValue
): IFAttributeProperty | null {
	switch (value) {
		case EColorValue.Black:
			return generateClothesColorBlackProperty();

		case EColorValue.White:
			return generateClothesColorWhiteProperty();

		case EColorValue.Red:
			return generateClothesColorRedProperty();

		case EColorValue.Green:
			return generateClothesColorGreenProperty();

		case EColorValue.Yellow:
			return generateClothesColorYellowProperty();

		case EColorValue.Blue:
			return generateClothesColorBlueProperty();

		case EColorValue.Purple:
			return generateClothesColorPurpleProperty();

		case EColorValue.Gray:
			return generateClothesColorGrayProperty();

		case EColorValue.Orange:
			return generateClothesColorOrangeProperty();

		default:
			return null;
	}
}

export function generateBodyTrousersTypeProperty(
	value: ETrousersValue
): IFAttributeProperty | null {
	switch (value) {
		case ETrousersValue.LongTrouser:
			return generateBodyTrousersTypeLongProperty();

		case ETrousersValue.ShortTrouser:
			return generateBodyTrousersTypeShortProperty();

		case ETrousersValue.Skirt:
			return generateBodyTrousersTypeShirtProperty();

		default:
			return null;
	}
}

export function generateBodyTrousersTextureProperty(
	value: ETextureValue
): IFAttributeProperty | null {
	switch (value) {
		case ETextureValue.PureColor:
			return generateTrousersTexturePureProperty();

		case ETextureValue.Stripe:
			return generateTrousersTextureStripeProperty();

		case ETextureValue.Pattern:
			return generateTrousersTexturePictureProperty();

		case ETextureValue.Joint:
			return generateTrousersTextureJointProperty();

		case ETextureValue.Grid:
			return generateTrousersTextureGridProperty();

		case ETextureValue.Uniform:
			return generateTrousersTextureUniformProperty();

		case ETextureValue.Other:
			return generateTrousersTextureOtherProperty();

		default:
			return null;
	}
}

export function generateBodyTrousersColorProperty(
	value: EColorValue
): IFAttributeProperty | null {
	switch (value) {
		case EColorValue.Black:
			return generateTrousersColorBlackProperty();

		case EColorValue.White:
			return generateTrousersColorWhiteProperty();

		case EColorValue.Red:
			return generateTrousersColorRedProperty();

		case EColorValue.Green:
			return generateTrousersColorGreenProperty();

		case EColorValue.Yellow:
			return generateTrousersColorYellowProperty();

		case EColorValue.Blue:
			return generateTrousersColorBlueProperty();

		case EColorValue.Purple:
			return generateTrousersColorPurpleProperty();

		case EColorValue.Gray:
			return generateTrousersColorGrayProperty();

		case EColorValue.Orange:
			return generateTrousersColorOrangeProperty();

		default:
			return null;
	}
}

// 大衣
export function generateBodyOvercoatProperty(
	value: EOverCoatValue
): IFAttributeProperty | null {
	switch (value) {
		case EOverCoatValue.Has:
			return generateOvercoatHasProperty();

		case EOverCoatValue.No:
			return generateOvercoatNoProperty();

		default:
			return null;
	}
}

// 单肩包
export function generateBodyHandbagProperty(
	value: EBaggageValue
): IFAttributeProperty | null {
	switch (value) {
		case EBaggageValue.Yes:
			return generateBodyHandbagHasProperty();

		case EBaggageValue.No:
			return generateBodyHandbagNoProperty();

		default:
			return null;
	}
}

// 双肩包
export function generateSinglebagProperty(
	value: EBaggageValue
): IFAttributeProperty | null {
	switch (value) {
		case EBaggageValue.Yes:
			return generateSingleBagHasProperty();

		case EBaggageValue.No:
			return generateSingleBagNoProperty();

		default:
			return null;
	}
}

// 拉杆箱
export function generateBagProperty(
	value: EBaggageValue
): IFAttributeProperty | null {
	switch (value) {
		case EBaggageValue.Yes:
			return generateBodyBagHasProperty();

		case EBaggageValue.No:
			return generateBodyBagNoProperty();

		default:
			return null;
	}
}

export function generateTrunkProperty(
	value: EBaggageValue
): IFAttributeProperty | null {
	switch (value) {
		case EBaggageValue.Yes:
			return generateBodyTrunkHasProperty();

		case EBaggageValue.No:
			return generateBodyTrunkNoProperty();

		default:
			return null;
	}
}

export function generateBodyCartProperty(
	value: EBaggageValue
): IFAttributeProperty | null {
	switch (value) {
		case EBaggageValue.Yes:
			return generateBodyCartHasProperty();

		case EBaggageValue.No:
			return generateBodyCartNoProperty();

		default:
			return null;
	}
}
