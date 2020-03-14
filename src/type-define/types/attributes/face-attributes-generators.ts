import { ETargetType } from './../target-type';
import {
	IFAttributeProperty,
	EGenderValue,
	EFaceAttributeType,
	EAgeValue,
	EGlassesValue,
	ERaceValue,
	EHatValue,
	EFaceMaskValue
} from './attribute-type';
import { _generateProperty } from './attribute-generator';

// #region 性别
function generateFaceGenderManProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Gender,
		EGenderValue.Man,
		'男',
		'ATTRIBUTE_MAN',
		'性别',
		'ATTRIBUTE_GENDER'
	);
}

function generateFaceGenderWomanProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Gender,
		EGenderValue.Woman,
		'女',
		'ATTRIBUTE_WOMEN',
		'性别',
		'ATTRIBUTE_GENDER'
	);
}

export function generateFaceGenderProperty(
	gender: EGenderValue
): IFAttributeProperty | null {
	switch (gender) {
		case EGenderValue.Man: {
			return generateFaceGenderManProperty();
		}
		case EGenderValue.Woman: {
			return generateFaceGenderWomanProperty();
		}

		default:
			return null;
	}
}

// #endregion 性别

// #region 年龄

function generateFaceAgeOldProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Age,
		EAgeValue.Old,
		'老年',
		'ATTRIBUTE_OLD',
		'年龄',
		'ATTRIBUTE_AGE'
	);
}

function generateFaceAgeChildProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Age,
		EAgeValue.Child,
		'儿童',
		'ATTRIBUTE_CHILD',
		'年龄',
		'ATTRIBUTE_AGE'
	);
}

function generateFaceAgeMiddleProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Age,
		EAgeValue.MiddleAage,
		'中年',
		'ATTRIBUTE_MIDDLE_AGED',
		'年龄',
		'ATTRIBUTE_AGE'
	);
}

function generateFaceAgeYoungProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Age,
		EAgeValue.Young,
		'青年',
		'ATTRIBUTE_YOUNG',
		'年龄',
		'ATTRIBUTE_AGE'
	);
}

export function generateFaceAgeProperty(
	age: EAgeValue
): IFAttributeProperty | null {
	switch (age) {
		case EAgeValue.Child:
			return generateFaceAgeChildProperty();
		case EAgeValue.Young:
			return generateFaceAgeYoungProperty();
		case EAgeValue.MiddleAage:
			return generateFaceAgeMiddleProperty();
		case EAgeValue.Old:
			return generateFaceAgeOldProperty();
		default:
			return null;
	}
}

// #endregion

// #region 眼镜

function generateFaceGlassNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Glasses,
		EGlassesValue.No,
		'不戴眼镜',
		'ATTRIBUTE_NO_GLASSES',
		'眼镜',
		'ATTRIBUTE_GLASSES'
	);
}

function generateFaceGlassSunProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Glasses,
		EGlassesValue.SunGlasses,
		'太阳眼镜',
		'ATTRIBUTE_SUN_GLASSES',
		'眼镜',
		'ATTRIBUTE_GLASSES'
	);
}

function generateFaceGlassNormalProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Glasses,
		EGlassesValue.Has,
		'普通眼镜',
		'ATTRIBUTE_COMON_GLASSES',
		'眼镜',
		'ATTRIBUTE_GLASSES'
	);
}

export function generateFaceGlassProperty(
	glass: EGlassesValue
): IFAttributeProperty | null {
	switch (glass) {
		case EGlassesValue.Has:
			return generateFaceGlassNormalProperty();
		case EGlassesValue.No:
			return generateFaceGlassNoProperty();
		case EGlassesValue.SunGlasses:
			return generateFaceGlassSunProperty();
		default:
			return null;
	}
}

// #endregion

// #region 民族

function generateFaceRaceOthenProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Race,
		ERaceValue.Other,
		'其他',
		'ATTRIBUTE_OTHER_RACE',
		'民族',
		'ATTRIBUTE_RACE'
	);
}

function generateFaceRaceHanProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Race,
		ERaceValue.Chinese,
		'汉族',
		'ATTRIBUTE_HAN_RACE',
		'民族',
		'ATTRIBUTE_RACE'
	);
}

export function generateFaceRaceProperty(
	race: ERaceValue
): IFAttributeProperty | null {
	switch (race) {
		case ERaceValue.Chinese:
			return generateFaceRaceHanProperty();

		case ERaceValue.Other:
			return generateFaceRaceOthenProperty();

		default:
			return null;
	}
}

// #endregion

// #region 帽子

function generateFaceHatNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Hat,
		EHatValue.No,
		'无帽子',
		'ATTRIBUTE_NO_HAT',
		'帽子',
		'ATTRIBUTE_Hat'
	);
}

function generateFaceHatHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Hat,
		EHatValue.Has,
		'有帽子',
		'ATTRIBUTE_HAVE_HAT',
		'帽子',
		'ATTRIBUTE_Hat'
	);
}

export function generateFaceHatProperty(
	hat: EHatValue
): IFAttributeProperty | null {
	switch (hat) {
		case EHatValue.Has:
			return generateFaceHatHasProperty();

		case EHatValue.No:
			return generateFaceHatNoProperty();

		default:
			return null;
	}
}

// #endregion

// #region 口罩

function generateFaceMaskNoProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Mask,
		EFaceMaskValue.No,
		'无',
		'ATTRIBUTE_NO_COAT', // 只是用来显示而已，没有错
		'口罩',
		'ATTRIBUTE_MASK'
	);
}

function generateFaceMaskHasProperty(): IFAttributeProperty {
	return _generateProperty(
		ETargetType.Face,
		EFaceAttributeType.Mask,
		EFaceMaskValue.Has,
		'有',
		'ATTRIBUTE_HAVE_COAT',
		'口罩',
		'ATTRIBUTE_MASK'
	);
}

export function generateFaceMaskProperty(
	mask: EFaceMaskValue
): IFAttributeProperty | null {
	switch (mask) {
		case EFaceMaskValue.Has:
			return generateFaceMaskHasProperty();

		case EFaceMaskValue.No:
			return generateFaceMaskNoProperty();

		default:
			return null;
	}
}

// #endregion
