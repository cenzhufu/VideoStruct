import { EBodyAttributeType } from '../../../../type-define/types/attributes/attribute-type';
import {
	IFAttributeProperty,
	EFaceAttributeType,
	ESourceType,
	ETargetType,
	EAgeValue,
	ERaceValue,
	EGenderValue,
	EHatValue,
	EGlassesValue,
	EFaceMaskValue,
	EClothesValue,
	EColorValue,
	ETextureValue,
	ETrousersValue,
	EOverCoatValue,
	// eslint-disable-next-line
	EBaggageType,
	// eslint-disable-next-line
	EBaggageValue,
	EConfidenceValue
} from 'sttypedefine';
import Config from 'stconfig';
import { Condition, StaticOperator } from './_types';
import * as moment from 'moment';
import { ValidFieldKeyForCollectionResult } from '../../collection-request/collection-analyze-result/types/_innter';
import { IFAnalysisResourceResPayload } from '../../collection-request';
import { ValidateTool } from 'ifvendors/utils/validate-tool';

// 权限服务端口号(网关), 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
// const port = 8762;
// 注册中心服务名， 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
const gatewayName = 'ifaas-data';

/**
 * 获得auth服务的请求url
 * @param {string} path 相对路径，前面带有/, 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4980867
 * @returns {string} 请求url
 */
export function getDataServerRequestUrl(path: string): string {
	// 这句话不要放在函数外边，因为Config的初始化是异步的
	const hostname = Config.getBaseApiRequestAddress();
	return `${
		window.location.protocol
	}//${hostname}:${Config.getBaseApiRequestPort()}/${gatewayName}${path}`;
}

/**
 * 基础的条件构造
 * @param {string} field 服务器字段
 * @param {*} value 值
 * @param {StaticOperator} operator 运算
 * @returns {(Condition | null)} 条件
 */
export function _getCondition(
	field: string,
	value: any,
	operator: StaticOperator
): Condition {
	return {
		field: field,
		value: value,
		operator: operator
	};
}

/**
 * 获得sourceId的统计条件
 * @export
 * @param {string} sourceId sourceId
 * @returns {Condition} 用于统计的条件对象
 */
export function getSourceIdCondition(sourceId?: string): Condition | null {
	if (!sourceId) {
		return null;
	}

	return _getCondition('sourceId', String(sourceId), StaticOperator.EqualTo);
}

/**
 * 获得sourceType的统计条件
 * @export
 * @param {ESourceType} sourceType sourceType
 * @returns {Condition} 用于统计的条件对象
 */
export function getSourceTypeCondition(
	sourceType?: ESourceType
): Condition | null {
	if (!sourceType) {
		return null;
	}
	switch (sourceType) {
		case ESourceType.Zip:
		case ESourceType.Video:
		case ESourceType.Camera:
			// case ESourceType.Pictural:
			// case ESourceType.LiveVideo:
			// case ESourceType.Box:
			return _getCondition('sourceType', sourceType, StaticOperator.EqualTo);

		default:
			return null;
	}
}

/**
 * 获得结构化数据的条件，如face, body
 * @export
 * @param {ETargetType} type targetType
 * @returns {Condition} 用于统计的条件对象
 */
export function getStuctualTypeCondition(type?: ETargetType): Condition | null {
	if (!type) {
		return null;
	}

	switch (type) {
		case ETargetType.Body:
		case ETargetType.Face:
			return _getCondition('targetType', type, StaticOperator.EqualTo); // 后台数据库字段 targetType

		default:
			return null;
	}
}

/**
 * 获得结构化数据的条件，如face, body
 * @export
 * @param {Array<ETargetType>} types targetType
 * @returns {Condition} 用于统计的条件对象
 */
export function getAllStuctualTypeCondition(
	types: Array<ETargetType>
): Condition {
	let allTypes: Array<ETargetType> = [];
	for (let info of types) {
		allTypes.push(info);
	}
	return _getCondition(
		'targetType',
		allTypes.join(','),
		StaticOperator.InRange
	);
}

/**
 * 获得时间范围
 * @param {?string} startDate 开始时间 YYYY-MM-DD HH:mm:ss
 * @param {?string} endDate 结束时间 YYYY-MM-DD HH:mm:ss
 * @returns {string} 时间范围 YYYY-MM-DD HH:mm:ss～YYYY-MM-DD HH:mm:ss，或者空字符串
 */
export function getDateRange(startDate?: string, endDate?: string): string {
	if (startDate && endDate) {
		return `${startDate}~${endDate}`;
	} else {
		if (startDate) {
			return `${startDate}~${moment().format('YYYY-MM-DD HH:mm:ss')}`;
		}

		if (endDate) {
			return `2018-11-11 00:00:00~${endDate}`;
		}

		return '';
	}
}

/**
 * 获得年龄的查询条件
 * @export
 * @param {EAgeValue} age 年龄
 * @returns {(Array<Condition> | null)} 查询条件
 */
export function getAgeTypeCondition(age?: EAgeValue): Array<Condition> | null {
	if (!age) {
		return null;
	}

	switch (age) {
		case EAgeValue.Child:
		case EAgeValue.MiddleAage:
		case EAgeValue.Young:
		case EAgeValue.Old: {
			let attrs = age.split(',');
			let result: Array<Condition> = [];
			if (attrs[0] !== undefined && attrs[0] !== null) {
				result.push(
					_getCondition(
						ValidFieldKeyForCollectionResult.Age,
						Number.parseFloat(attrs[0]),
						StaticOperator.GreatEqualThan
					)
				);
			}

			if (attrs[1] !== undefined && attrs[1] !== null) {
				result.push(
					_getCondition(
						ValidFieldKeyForCollectionResult.Age,
						Number.parseFloat(attrs[1]),
						StaticOperator.LessEqualThan
					)
				);
			}
			return result;
		}

		default:
			return null;
	}
}

/**
 * 种族条件
 * @export
 * @param {ERaceValue} race 种族
 * @returns {(Condition | null)} 查询条件
 */
export function getRaceConditon(race?: ERaceValue): Condition | null {
	if (!race) {
		return null;
	}

	switch (race) {
		case ERaceValue.Chinese:
		case ERaceValue.Other:
			return _getCondition(
				ValidFieldKeyForCollectionResult.Nation,
				race,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 性别查询条件
 * @export
 * @param {EGenderValue} [gender] 性别
 * @returns {(Condition | null)} 查询条件
 */
export function getGenderConditon(gender?: EGenderValue): Condition | null {
	if (!gender) {
		return null;
	}

	switch (gender) {
		case EGenderValue.Man:
		case EGenderValue.Woman:
			return _getCondition(
				ValidFieldKeyForCollectionResult.Gender,
				gender,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 帽子查询条件
 * @export
 * @param {EHatValue} [hat] 帽子
 * @returns {(Condition | null)} 查询条件
 */
export function getHatConditon(hat?: EHatValue): Condition | null {
	if (!hat) {
		return null;
	}

	switch (hat) {
		case EHatValue.Has:
		case EHatValue.No:
			return _getCondition(
				ValidFieldKeyForCollectionResult.Hat,
				hat,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 眼镜查询条件
 * @export
 * @param {EGlassesValue} [glass] 眼镜
 * @returns {(Condition | null)} 查询条件
 */
export function getGlassesConditon(glass?: EGlassesValue): Condition | null {
	if (!glass) {
		return null;
	}

	switch (glass) {
		case EGlassesValue.Has:
		case EGlassesValue.No:
		case EGlassesValue.SunGlasses:
			return _getCondition(
				ValidFieldKeyForCollectionResult.Glasses,
				glass,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 口罩条件
 * @export
 * @param {EFaceMaskValue} [mask] mask
 * @returns {(Condition | null)} 查询条件
 */
export function getMaskConditon(mask?: EFaceMaskValue): Condition | null {
	if (!mask) {
		return null;
	}

	switch (mask) {
		case EFaceMaskValue.Has:
		case EFaceMaskValue.No:
			return _getCondition(
				ValidFieldKeyForCollectionResult.FaceMask,
				mask,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getClothesConditon(clothes?: EClothesValue): Condition | null {
	if (!clothes) {
		return null;
	}

	switch (clothes) {
		case EClothesValue.LongSleeve:
		case EClothesValue.ShortSleeve:
			return _getCondition(
				ValidFieldKeyForCollectionResult.Clothes,
				clothes,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getClothesColorConditon(color?: EColorValue): Condition | null {
	if (!color) {
		return null;
	}

	switch (color) {
		case EColorValue.Black:
		case EColorValue.Blue:
		case EColorValue.Gray:
		case EColorValue.Green:
		case EColorValue.Orange:
		case EColorValue.Purple:
		case EColorValue.Red:
		case EColorValue.White:
		case EColorValue.Yellow:
			return _getCondition(
				ValidFieldKeyForCollectionResult.ClothesColor,
				color,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getClothesTextureConditon(
	texture?: ETextureValue
): Condition | null {
	if (!texture) {
		return null;
	}

	switch (texture) {
		case ETextureValue.Grid:
		case ETextureValue.Joint:
		case ETextureValue.Other:
		case ETextureValue.Pattern:
		case ETextureValue.PureColor:
		case ETextureValue.Stripe:
		case ETextureValue.Uniform:
			return _getCondition(
				ValidFieldKeyForCollectionResult.ClothesTexture,
				texture,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getTrousesConditon(
	trousers?: ETrousersValue
): Condition | null {
	if (!trousers) {
		return null;
	}

	switch (trousers) {
		case ETrousersValue.LongTrouser:
		case ETrousersValue.ShortTrouser:
		case ETrousersValue.Skirt:
			return _getCondition(
				ValidFieldKeyForCollectionResult.Trousers,
				trousers,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getTrousersColorConditon(
	color?: EColorValue
): Condition | null {
	if (!color) {
		return null;
	}

	switch (color) {
		case EColorValue.Black:
		case EColorValue.Blue:
		case EColorValue.Gray:
		case EColorValue.Green:
		case EColorValue.Orange:
		case EColorValue.Purple:
		case EColorValue.Red:
		case EColorValue.White:
		case EColorValue.Yellow:
			return _getCondition(
				ValidFieldKeyForCollectionResult.TrousersColor,
				color,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getToursersTextureConditon(
	texture?: ETextureValue
): Condition | null {
	if (!texture) {
		return null;
	}

	switch (texture) {
		case ETextureValue.Grid:
		case ETextureValue.Joint:
		case ETextureValue.Other:
		case ETextureValue.Pattern:
		case ETextureValue.PureColor:
		case ETextureValue.Stripe:
		case ETextureValue.Uniform:
			return _getCondition(
				ValidFieldKeyForCollectionResult.TrousersTexture,
				texture,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getOvercoatCondition(
	overcoat?: EOverCoatValue
): Condition | null {
	if (!overcoat) {
		return null;
	}

	switch (overcoat) {
		case EOverCoatValue.Has:
		case EOverCoatValue.No:
			return _getCondition(
				ValidFieldKeyForCollectionResult.OverCoat,
				overcoat,
				StaticOperator.EqualTo
			);

		default:
			return null;
	}
}

export function getBaggageConditon(
	baggage?: { [type in EBaggageType]?: EBaggageValue },
	confidence?: EConfidenceValue | undefined
): Condition[] {
	if (!baggage) {
		return [];
	}

	let baggageConditions: Array<Condition> = [];
	let types = Object.keys(baggage);
	for (let type of types) {
		if (baggage[type] !== EBaggageValue.All) {
			baggageConditions.push(
				_getCondition(type, baggage[type], StaticOperator.EqualTo)
			);

			// 置信度
			if (confidence) {
				baggageConditions.push(
					_getCondition(
						type + 'Confidence',
						Number.parseFloat(confidence),
						StaticOperator.GreatEqualThan
					)
				);
			}
		}
	}

	return baggageConditions;
}

// function getThresholdCondition(threshold?: number): Condition | null {
// 	if (!threshold) {
// 		return null;
// 	}

// 	return _getCondition(ValidFieldKeyForCollectionResult.Threshold, threshold, StaticOperator.GreatEqualThan);
// }

/**
 * 人脸属性查询条件集
 * @param {IFAnalysisResourceResPayload} payload 参数
 * @returns {AndQuery} 查询条件集
 */
export function getFaceQueryCondition(
	payload: IFAnalysisResourceResPayload
): Array<Condition> {
	let andBean: Array<Condition> = [];

	let selectedAttributes: Array<
		IFAttributeProperty
	> = ValidateTool.getValidArray(payload.selectedAttributes);
	for (let attribute of selectedAttributes) {
		switch (attribute.attributeType) {
			case EFaceAttributeType.Age:
				{
					// 年龄
					let ageCondition = getAgeTypeCondition(
						attribute.attributeValue as EAgeValue
					);
					if (ageCondition) {
						andBean.push(...ageCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.AgeConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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
						andBean.push(genderCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.GenderConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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
						andBean.push(glassesCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.GlassesConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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
						andBean.push(hatCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.HatConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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
						andBean.push(raceCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.RaceConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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
						andBean.push(maskCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.MaskConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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

	return andBean;
}

export function getBodyQueryCondition(
	payload: IFAnalysisResourceResPayload
): Array<Condition> {
	let andBean: Array<Condition> = [];

	let selectedAttributes: Array<
		IFAttributeProperty
	> = ValidateTool.getValidArray(payload.selectedAttributes);
	for (let attributeItem of selectedAttributes) {
		switch (attributeItem.attributeType) {
			case EBodyAttributeType.Clothes:
				{
					// 衣服
					let clothesCondition = getClothesConditon(
						attributeItem.attributeValue as EClothesValue
					);
					if (clothesCondition) {
						andBean.push(clothesCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.ClothesConfidence,
									Number.parseFloat(payload.attributeAccuracy),
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
						andBean.push(clothesColorCondition);

						// 颜色置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.ClothesColorConfidence,
									payload.attributeAccuracy,
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
						andBean.push(clothesTextureCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.ClothesTextureConfidence,
									payload.attributeAccuracy,
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
						andBean.push(trousersCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.TrousersConfidence,
									payload.attributeAccuracy,
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
						andBean.push(trousersColorCondition);

						// 颜色置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.TrousersColorConfidence,
									payload.attributeAccuracy,
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
						andBean.push(trousersTextureCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.TrousersTextureConfidence,
									payload.attributeAccuracy,
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
						andBean.push(overcoatCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.OvercoatConfidence,
									payload.attributeAccuracy,
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
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.HandBagConfidence,
									payload.attributeAccuracy,
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
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.SingleShouldBagConfidence,
									payload.attributeAccuracy,
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
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.BackbagConfidence,
									payload.attributeAccuracy,
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
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.DrawboxConfidence,
									payload.attributeAccuracy,
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
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getCondition(
									ValidFieldKeyForCollectionResult.CartConfidence,
									payload.attributeAccuracy,
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

	return andBean;
}
