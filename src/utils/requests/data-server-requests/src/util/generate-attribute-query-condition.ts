import { Condition, StaticOperator } from './../_types';
// NOTE: 这种写法纯属无奈，jest中好像re export两次就不再识别了
import {
	EFaceAttributeType,
	EBodyAttributeType,
	EVehicleAttributeType,
	EConfidenceValue,
	EAgeValue,
	EGenderValue,
	EGlassesValue,
	EHatValue,
	ERaceValue,
	EFaceMaskValue,
	EClothesValue
} from 'sttypedefine/types/attributes/attribute-type';
import { ValidFieldKeyForCollectionResult } from 'stsrc/utils/requests/collection-request/collection-analyze-result/types/_innter';
import {
	ETargetType,
	IFAttributeProperty,
	EColorValue,
	ETextureValue,
	EBaggageValue,
	EOverCoatValue,
	ETrousersValue
} from 'stsrc/type-define';
import {
	generateEqualCondition,
	EqualCondition,
	generateEqualParams
} from './equal-condion';
import { IBDataQueryConditions } from '../query/query-type';
import { generateInCondition, generateInQueryParams } from './in-condition';
import { mergetQueryConditionParams } from './merge-query-conditions';
import {
	generateAllFilterCondition,
	FilterOperator,
	FilterCondition,
	generateFilterParams
} from './filtration-condition';
import {
	getAgeTypeCondition,
	_getCondition,
	getGenderConditon,
	getGlassesConditon,
	getHatConditon,
	getRaceConditon,
	getMaskConditon,
	getClothesConditon,
	getClothesColorConditon,
	getOvercoatCondition,
	getToursersTextureConditon,
	getTrousersColorConditon,
	getTrousesConditon,
	getClothesTextureConditon
} from '../_utils';

/**
 * 生成所有属性的查询条件
 * @export
 * @param {Array<IFAttributeProperty>} attributes 属性
 * @returns {Array<EqualCondition>} 条件
 */
export function generateAttributeConditions(
	attributes: Array<IFAttributeProperty>
): IBDataQueryConditions {
	return mergetQueryConditionParams([
		generateFaceAttributeConditions(attributes),
		generateBodyAttributeConditions(attributes),
		generateVehicleAttributeConditions(attributes)
	]);
}

export function generateFaceAttributeConditions(
	attributes: Array<IFAttributeProperty>
): IBDataQueryConditions {
	let faceAttributes = attributes.filter((property: IFAttributeProperty) => {
		return property.targetType === ETargetType.Face;
	});

	let eqconditions = [];
	let filtrations = [];
	for (let property of faceAttributes) {
		switch (property.attributeType) {
			// NOTE: 这个是个flitration条件
			case EFaceAttributeType.Age: {
				let ages = property.attributeValue.split(',');
				if (ages.length > 1) {
					let fc: FilterCondition | null = generateAllFilterCondition(
						ValidFieldKeyForCollectionResult.Age,
						[
							{
								operator: FilterOperator.GreatEqualThan,
								value: Number.parseInt(ages[0], 10)
							},
							{
								operator: FilterOperator.LessEqualThan,
								value: Number.parseInt(ages[1], 10)
							}
						]
					);
					if (fc) {
						filtrations.push(fc);
					}
				} else if (ages.length === 1) {
					let fc: FilterCondition | null = generateAllFilterCondition(
						ValidFieldKeyForCollectionResult.Age,
						[
							{
								operator: FilterOperator.GreatEqualThan,
								value: Number.parseInt(ages[0], 10)
							}
						]
					);
					if (fc) {
						filtrations.push(fc);
					}
				}

				break;
			}
			case EFaceAttributeType.Gender: {
				let eq: EqualCondition | null = generateEqualCondition(
					ValidFieldKeyForCollectionResult.Gender,
					property.attributeValue
				);
				if (eq) {
					eqconditions.push(eq);
				}
				break;
			}
			case EFaceAttributeType.Glasses: {
				let eq: EqualCondition | null = generateEqualCondition(
					ValidFieldKeyForCollectionResult.Glasses,
					property.attributeValue
				);
				if (eq) {
					eqconditions.push(eq);
				}
				break;
			}
			case EFaceAttributeType.Hat: {
				let eq: EqualCondition | null = generateEqualCondition(
					ValidFieldKeyForCollectionResult.Hat,
					property.attributeValue
				);
				if (eq) {
					eqconditions.push(eq);
				}
				break;
			}
			case EFaceAttributeType.Race: {
				let eq: EqualCondition | null = generateEqualCondition(
					ValidFieldKeyForCollectionResult.Nation,
					property.attributeValue
				);
				if (eq) {
					eqconditions.push(eq);
				}
				break;
			}

			default:
				break;
		}
	}

	return {
		...generateEqualParams(eqconditions),
		...generateFilterParams(filtrations)
	};
}

export function generateBodyAttributeConditions(
	attributes: Array<IFAttributeProperty>
): IBDataQueryConditions {
	let bodyAttributes = attributes.filter((property: IFAttributeProperty) => {
		return property.targetType === ETargetType.Body;
	});

	let eqconditions = [];
	for (let property of bodyAttributes) {
		let key: string = '';
		switch (property.attributeType) {
			case EBodyAttributeType.Backbag: {
				key = ValidFieldKeyForCollectionResult.Backbag;
				break;
			}
			case EBodyAttributeType.Cart: {
				key = ValidFieldKeyForCollectionResult.Cart;
				break;
			}
			case EBodyAttributeType.Clothes: {
				key = ValidFieldKeyForCollectionResult.Clothes;
				break;
			}
			case EBodyAttributeType.ClothesColor: {
				key = ValidFieldKeyForCollectionResult.ClothesColor;
				break;
			}
			case EBodyAttributeType.ClothesTexture: {
				key = ValidFieldKeyForCollectionResult.ClothesTexture;
				break;
			}
			case EBodyAttributeType.Coat: {
				key = ValidFieldKeyForCollectionResult.OverCoat;
				break;
			}
			case EBodyAttributeType.Drawbox: {
				key = ValidFieldKeyForCollectionResult.Drawbox;
				break;
			}
			case EBodyAttributeType.HandBag: {
				key = ValidFieldKeyForCollectionResult.HandBag;
				break;
			}
			case EBodyAttributeType.SingleShouldBag: {
				key = ValidFieldKeyForCollectionResult.SingleShouldBag;
				break;
			}
			case EBodyAttributeType.Trousers: {
				key = ValidFieldKeyForCollectionResult.Trousers;
				break;
			}
			case EBodyAttributeType.TrousersColor: {
				key = ValidFieldKeyForCollectionResult.TrousersColor;
				break;
			}
			case EBodyAttributeType.TrousersTexture: {
				key = ValidFieldKeyForCollectionResult.TrousersTexture;
				break;
			}

			default:
				break;
		}

		if (key) {
			let eq: EqualCondition | null = generateEqualCondition(
				key,
				property.attributeValue
			);
			if (eq) {
				eqconditions.push(eq);
			}
		}
	}

	return {
		...generateEqualParams(eqconditions)
	};
}

export function generateVehicleAttributeConditions(
	attributes: Array<IFAttributeProperty>
): IBDataQueryConditions {
	let vehicleAttributes = attributes.filter((property: IFAttributeProperty) => {
		return property.targetType === ETargetType.Vehicle;
	});

	let eqconditions = [];
	let inConditions = [];
	for (let property of vehicleAttributes) {
		let key: string = '';
		switch (property.attributeType) {
			// NOTE: 这个有多个条件
			case EVehicleAttributeType.CarBrand: {
				// key = ValidFieldKeyForCollectionResult.CarBrandCode;
				let seraialCodes = property.subAttributeProperties.map(
					(item: IFAttributeProperty) => {
						return item.attributeValue;
					}
				);
				let serialCondition = generateInCondition(
					ValidFieldKeyForCollectionResult.CarBrandCode,
					seraialCodes
				);
				if (serialCondition) {
					inConditions.push(serialCondition);
				}
				break;
			}

			case EVehicleAttributeType.CarBrandSerials: {
				key = ValidFieldKeyForCollectionResult.CarBrandCode;
				break;
			}

			case EVehicleAttributeType.CarColor: {
				key = ValidFieldKeyForCollectionResult.CarColor;
				break;
			}

			case EVehicleAttributeType.CarLicenseColor: {
				key = ValidFieldKeyForCollectionResult.CarLicenseColor;
				break;
			}

			case EVehicleAttributeType.CarLicenseNumber: {
				key = ValidFieldKeyForCollectionResult.CarLicenseNumber;
				break;
			}

			case EVehicleAttributeType.CarType: {
				key = ValidFieldKeyForCollectionResult.CarType;
				break;
			}

			default:
				break;
		}

		if (key) {
			let eq: EqualCondition | null = generateEqualCondition(
				key,
				property.attributeValue
			);
			if (eq) {
				eqconditions.push(eq);
			}
		}
	}

	return {
		...generateEqualParams(eqconditions),
		...generateInQueryParams(inConditions)
	};
}

export function generateFaceAttributeConditionsForCondition(
	attributes: Array<IFAttributeProperty>,
	attributeAccuracy: EConfidenceValue
): Condition[] {
	let results: Condition[] = [];

	for (let attribute of attributes) {
		switch (attribute.attributeType) {
			case EFaceAttributeType.Age:
				{
					// 年龄
					let ageCondition = getAgeTypeCondition(
						attribute.attributeValue as EAgeValue
					);
					if (ageCondition) {
						results.push(...ageCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.AgeConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EFaceAttributeType.Gender:
				{
					// 性别
					let genderCondition = getGenderConditon(
						attribute.attributeValue as EGenderValue
					);
					if (genderCondition) {
						results.push(genderCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.GenderConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EFaceAttributeType.Glasses:
				{
					// 眼镜
					let glassesCondition = getGlassesConditon(
						attribute.attributeValue as EGlassesValue
					);
					if (glassesCondition) {
						results.push(glassesCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.GlassesConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EFaceAttributeType.Hat:
				{
					// 帽子
					let hatCondition = getHatConditon(
						attribute.attributeValue as EHatValue
					);
					if (hatCondition) {
						results.push(hatCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.HatConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EFaceAttributeType.Race:
				{
					// 人种
					let raceCondition = getRaceConditon(
						attribute.attributeValue as ERaceValue
					);
					if (raceCondition) {
						results.push(raceCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.RaceConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EFaceAttributeType.Mask:
				{
					// 口罩
					let maskCondition = getMaskConditon(
						attribute.attributeValue as EFaceMaskValue
					);
					if (maskCondition) {
						results.push(maskCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.MaskConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			default:
				break;
		}
	}

	return results;
}

export function generateBodyAttributeConditionsForCondition(
	attributes: Array<IFAttributeProperty>,
	attributeAccuracy: EConfidenceValue
): Condition[] {
	let results: Condition[] = [];

	for (let attributeItem of attributes) {
		switch (attributeItem.attributeType) {
			case EBodyAttributeType.Clothes:
				{
					// 衣服
					let clothesCondition = getClothesConditon(
						attributeItem.attributeValue as EClothesValue
					);
					if (clothesCondition) {
						results.push(clothesCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.ClothesConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.ClothesColor:
				{
					// 上衣颜色
					let clothesColorCondition = getClothesColorConditon(
						attributeItem.attributeValue as EColorValue
					);
					if (clothesColorCondition) {
						results.push(clothesColorCondition);

						// 颜色置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.ClothesColorConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.ClothesTexture:
				{
					// 衣服纹理
					let clothesTextureCondition = getClothesTextureConditon(
						attributeItem.attributeValue as ETextureValue
					);
					if (clothesTextureCondition) {
						results.push(clothesTextureCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.ClothesTextureConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.Trousers:
				{
					// 裤子款式
					let trousersCondition = getTrousesConditon(
						attributeItem.attributeValue as ETrousersValue
					);
					if (trousersCondition) {
						results.push(trousersCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.TrousersConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.TrousersColor:
				{
					// 裤子颜色
					let trousersColorCondition = getTrousersColorConditon(
						attributeItem.attributeValue as EColorValue
					);
					if (trousersColorCondition) {
						results.push(trousersColorCondition);

						// 颜色置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.TrousersColorConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.TrousersTexture:
				{
					// 裤子纹理
					let trousersTextureCondition = getToursersTextureConditon(
						attributeItem.attributeValue as ETextureValue
					);
					if (trousersTextureCondition) {
						results.push(trousersTextureCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.TrousersTextureConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.Coat:
				{
					// 大衣
					let overcoatCondition = getOvercoatCondition(
						attributeItem.attributeValue as EOverCoatValue
					);
					if (overcoatCondition) {
						results.push(overcoatCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.OvercoatConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.HandBag:
				{
					// 手提包
					let handbagCondition = _getCondition(
						ValidFieldKeyForCollectionResult.HandBag,
						attributeItem.attributeValue as EBaggageValue,
						StaticOperator.EqualTo
					);
					if (handbagCondition) {
						results.push(handbagCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.HandBagConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.SingleShouldBag:
				{
					// 单肩包
					let handbagCondition = _getCondition(
						ValidFieldKeyForCollectionResult.SingleShouldBag,
						attributeItem.attributeValue as EBaggageValue,
						StaticOperator.EqualTo
					);
					if (handbagCondition) {
						results.push(handbagCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.SingleShouldBagConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.Backbag:
				{
					// 背包
					let handbagCondition = _getCondition(
						ValidFieldKeyForCollectionResult.Backbag,
						attributeItem.attributeValue as EBaggageValue,
						StaticOperator.EqualTo
					);
					if (handbagCondition) {
						results.push(handbagCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.BackbagConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}

				break;

			case EBodyAttributeType.Drawbox:
				{
					// 拉杆箱
					let handbagCondition = _getCondition(
						ValidFieldKeyForCollectionResult.Drawbox,
						attributeItem.attributeValue as EBaggageValue,
						StaticOperator.EqualTo
					);
					if (handbagCondition) {
						results.push(handbagCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.DrawboxConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.Cart:
				{
					// 推车
					let handbagCondition = _getCondition(
						ValidFieldKeyForCollectionResult.Cart,
						attributeItem.attributeValue as EBaggageValue,
						StaticOperator.EqualTo
					);
					if (handbagCondition) {
						results.push(handbagCondition);

						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.CartConfidence,
									attributeAccuracy,
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			default:
				break;
		}
	}

	return results;
}

export function generateVehicleAttributeConditionsForCondition(
	attributes: Array<IFAttributeProperty>,
	attributeAccuracy: EConfidenceValue
): Condition[] {
	let results: Condition[] = [];

	for (let attribute of attributes) {
		switch (attribute.attributeType) {
			case EVehicleAttributeType.CarBrand: // 取subProperties
				{
					// 年龄
					let ageCondition = getAgeTypeCondition(
						attribute.attributeValue as EAgeValue
					);
					if (ageCondition) {
						results.push(...ageCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.CarBrandCodeConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EVehicleAttributeType.CarBrandSerials:
				{
					// 性别
					let genderCondition = getGenderConditon(
						attribute.attributeValue as EGenderValue
					);
					if (genderCondition) {
						results.push(genderCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.GenderConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EVehicleAttributeType.CarColor:
				{
					// 眼镜
					let glassesCondition = getGlassesConditon(
						attribute.attributeValue as EGlassesValue
					);
					if (glassesCondition) {
						results.push(glassesCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.GlassesConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EVehicleAttributeType.CarLicenseColor:
				{
					// 帽子
					let hatCondition = getHatConditon(
						attribute.attributeValue as EHatValue
					);
					if (hatCondition) {
						results.push(hatCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.HatConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EVehicleAttributeType.CarLicenseNumber:
				{
					// 人种
					let raceCondition = getRaceConditon(
						attribute.attributeValue as ERaceValue
					);
					if (raceCondition) {
						results.push(raceCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.RaceConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EVehicleAttributeType.CarType:
				{
					// 口罩
					let maskCondition = getMaskConditon(
						attribute.attributeValue as EFaceMaskValue
					);
					if (maskCondition) {
						results.push(maskCondition);

						// 置信度
						if (attributeAccuracy) {
							results.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.MaskConfidence,
									Number.parseFloat(attributeAccuracy),
									StaticOperator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			default:
				break;
		}
	}

	return results;
}
