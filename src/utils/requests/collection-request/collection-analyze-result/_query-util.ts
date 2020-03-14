import { ValidateTool } from 'ifutils/validate-tool';

import {
	ESourceType,
	ETargetType,
	EAgeValue,
	ERaceValue,
	ESortType,
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
	EBaggageValue,
	EMerge,
	IFAttributeProperty,
	EFaceAttributeType,
	EBodyAttributeType,
	EVehicleAttributeType,
	ECarTypeValue,
	ECarColorValue,
	ECarLicenseColorValue
} from 'sttypedefine';
import {
	QueryType,
	ValidFieldKeyForCollectionResult,
	Operator,
	AndQuery,
	OrQuery,
	TaskResultPayload
} from './types/_innter';
import { IFAnalysisResourceResPayload } from './types/outer';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';

/**
 * 返回查询条件
 * @param {string} field 查询的字段
 * @param {*} value 字段的值
 * @param {Operator} operator 查询的操作
 * @returns {QueryType} 查询条件
 */
function _getQuery(field: string, value: any, operator: Operator): QueryType {
	return {
		field: field,
		value: value,
		operator: operator
	};
}

/**
 * 获取sourceId的查询条件
 * @export
 * @param {string} sourceId sourceId
 * @returns {QueryType} 查询条件
 */
// function getSourceIdCondition(sourceId?: string): QueryType | null {
// 	if (!sourceId) {
// 		console.error('查询的sourceid为空');
// 		return null;
// 	}
// 	return _getQuery(ValidFieldKeyForCollectionResult.SourceId, sourceId, Operator.EqualTo);
// }

/**
 * 获取sourceIds的查询条件
 * @export
 * @param {Array<string>} sourceIds sourceId
 * @returns {QueryType} 查询条件
 */
function getSourceIdsCondition(sourceIds?: Array<string>): QueryType | null {
	let ids = ValidateTool.getValidArray(sourceIds);
	// 过滤掉空字符串的情况
	ids = ids.filter((item: string) => {
		return !!item;
	});
	if (ids.length > 0) {
		return _getQuery(
			ValidFieldKeyForCollectionResult.SourceId,
			ids.join(','),
			Operator.InRange
		);
	} else {
		console.error('查询的sourceids为空');
		return null;
	}
}

/**
 * 获取sourceType的查询条件
 * @param {ESourceType} sourceType sourceType
 * @returns {QueryType} 查询条件
 //  */
function getSourceTypeCondition(sourceType?: ESourceType): QueryType | null {
	if (!sourceType) {
		return null;
	}

	switch (sourceType) {
		// case ESourceType.Pictural:
		case ESourceType.Camera:
		case ESourceType.Video:
		case ESourceType.Zip:
			return _getQuery(
				ValidFieldKeyForCollectionResult.SourceType,
				sourceType,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 获得targetType的查询条件
 * @export
 * @param {ETargetType} targetType targetType
 * @returns {QueryType} 查询条件
 */
export function getTargetTypeCondition(
	targetType?: ETargetType
): QueryType | null {
	if (!targetType) {
		return null;
	}
	switch (targetType) {
		case ETargetType.Face:
		case ETargetType.Body:
		case ETargetType.Vehicle:
			return _getQuery(
				ValidFieldKeyForCollectionResult.TargetType,
				targetType,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 时间查询条件
 * @export
 * @param {string} [startDate] YYYY-MM-DD hh:mm:ss
 * @param {string} [endDate] YYYY-MM-DD hh:mm:ss
 * @returns {Array<QueryType>} 查询条件
 */
export function getDateCondition(
	startDate?: string,
	endDate?: string
): Array<QueryType> {
	let result: Array<QueryType> = [];
	if (startDate) {
		result.push(
			_getQuery(
				ValidFieldKeyForCollectionResult.DBInsertTimeRange,
				startDate,
				Operator.GreatEqualThan
			)
		);
	}
	if (endDate) {
		result.push(
			_getQuery(
				ValidFieldKeyForCollectionResult.DBInsertTimeRange,
				endDate,
				Operator.LessEqualThan
			)
		);
	}

	return result;
}

/**
 * 分页条件
 * @export
 * @param {number} page 当前页面顺序
 * @param {number} [pageSize=100] 页面元素个数
 * @returns {QueryType} 查询条件
 */
export function getPageTypeCondition(
	page: number = 1,
	pageSize: number = 100
): Array<QueryType> {
	let result: Array<QueryType> = [];

	result.push(
		_getQuery(ValidFieldKeyForCollectionResult.Page, page, Operator.EqualTo)
	);
	result.push(
		_getQuery(
			ValidFieldKeyForCollectionResult.PageSize,
			pageSize,
			Operator.EqualTo
		)
	);

	return result;
}

/**
 * 获得年龄的查询条件
 * @export
 * @param {EAgeValue} age 年龄
 * @returns {(Array<QueryType> | null)} 查询条件
 */
export function getAgeTypeCondition(age?: EAgeValue): Array<QueryType> | null {
	if (!age) {
		return null;
	}

	switch (age) {
		case EAgeValue.Child:
		case EAgeValue.MiddleAage:
		case EAgeValue.Young:
		case EAgeValue.Old: {
			let attrs = age.split(',');
			let result: Array<QueryType> = [];
			if (attrs[0] !== undefined && attrs[0] !== null) {
				result.push(
					_getQuery(
						ValidFieldKeyForCollectionResult.Age,
						attrs[0],
						Operator.GreatEqualThan
					)
				);
			}

			if (attrs[1] !== undefined && attrs[1] !== null) {
				result.push(
					_getQuery(
						ValidFieldKeyForCollectionResult.Age,
						attrs[1],
						Operator.LessEqualThan
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
 * @returns {(QueryType | null)} 查询条件
 */
export function getRaceConditon(race?: ERaceValue): QueryType | null {
	if (!race) {
		return null;
	}

	switch (race) {
		case ERaceValue.Chinese:
		case ERaceValue.Other:
			return _getQuery(
				ValidFieldKeyForCollectionResult.Nation,
				race,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 性别查询条件
 * @export
 * @param {EGenderValue} [gender] 性别
 * @returns {(QueryType | null)} 查询条件
 */
export function getGenderConditon(gender?: EGenderValue): QueryType | null {
	if (!gender) {
		return null;
	}

	switch (gender) {
		case EGenderValue.Man:
		case EGenderValue.Woman:
			return _getQuery(
				ValidFieldKeyForCollectionResult.Gender,
				gender,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 帽子查询条件
 * @export
 * @param {EHatValue} [hat] 帽子
 * @returns {(QueryType | null)} 查询条件
 */
export function getHatConditon(hat?: EHatValue): QueryType | null {
	if (!hat) {
		return null;
	}

	switch (hat) {
		case EHatValue.Has:
		case EHatValue.No:
			return _getQuery(
				ValidFieldKeyForCollectionResult.Hat,
				hat,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 眼镜查询条件
 * @export
 * @param {EGlassesValue} [glass] 眼镜
 * @returns {(QueryType | null)} 查询条件
 */
export function getGlassesConditon(glass?: EGlassesValue): QueryType | null {
	if (!glass) {
		return null;
	}

	switch (glass) {
		case EGlassesValue.Has:
		case EGlassesValue.No:
		case EGlassesValue.SunGlasses:
			return _getQuery(
				ValidFieldKeyForCollectionResult.Glasses,
				glass,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/**
 * 口罩条件
 * @export
 * @param {EFaceMaskValue} [mask] mask
 * @returns {(QueryType | null)} 查询条件
 */
export function getMaskConditon(mask?: EFaceMaskValue): QueryType | null {
	if (!mask) {
		return null;
	}

	switch (mask) {
		case EFaceMaskValue.Has:
		case EFaceMaskValue.No:
			return _getQuery(
				ValidFieldKeyForCollectionResult.FaceMask,
				mask,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getClothesConditon(clothes?: EClothesValue): QueryType | null {
	if (!clothes) {
		return null;
	}

	switch (clothes) {
		case EClothesValue.LongSleeve:
		case EClothesValue.ShortSleeve:
			return _getQuery(
				ValidFieldKeyForCollectionResult.Clothes,
				clothes,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getClothesColorConditon(color?: EColorValue): QueryType | null {
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
			return _getQuery(
				ValidFieldKeyForCollectionResult.ClothesColor,
				color,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getClothesTextureConditon(
	texture?: ETextureValue
): QueryType | null {
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
			return _getQuery(
				ValidFieldKeyForCollectionResult.ClothesTexture,
				texture,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getTrousesConditon(
	trousers?: ETrousersValue
): QueryType | null {
	if (!trousers) {
		return null;
	}

	switch (trousers) {
		case ETrousersValue.LongTrouser:
		case ETrousersValue.ShortTrouser:
		case ETrousersValue.Skirt:
			return _getQuery(
				ValidFieldKeyForCollectionResult.Trousers,
				trousers,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getTrousersColorConditon(
	color?: EColorValue
): QueryType | null {
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
			return _getQuery(
				ValidFieldKeyForCollectionResult.TrousersColor,
				color,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getToursersTextureConditon(
	texture?: ETextureValue
): QueryType | null {
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
			return _getQuery(
				ValidFieldKeyForCollectionResult.TrousersTexture,
				texture,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

export function getOvercoatCondition(
	overcoat?: EOverCoatValue
): QueryType | null {
	if (!overcoat) {
		return null;
	}

	switch (overcoat) {
		case EOverCoatValue.Has:
		case EOverCoatValue.No:
			return _getQuery(
				ValidFieldKeyForCollectionResult.OverCoat,
				overcoat,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

function getAnalysisTypeCondition(): QueryType {
	return _getQuery('operator', 'ifass-engine', Operator.EqualTo); // 分析任务类型条件
}

// function getThresholdCondition(threshold?: number): QueryType | null {
// 	if (!threshold) {
// 		return null;
// 	}

// 	return _getQuery(ValidFieldKeyForCollectionResult.Threshold, threshold, Operator.GreatEqualThan);
// }

/************** 二期的车辆相关 start ********************/

function getVehicleBrandSerialCondition(brand?: string): QueryType | null {
	if (!brand) {
		return null;
	}

	// TODO: 车辆品牌
	// switch (brand) {
	// 	case ECarBrandValue
	// }

	return _getQuery(
		ValidFieldKeyForCollectionResult.CarBrandCode,
		[brand].join(','),
		Operator.InRange
	);
}

function getVehicleBrandCondition(
	subProperties: Array<IFAttributeProperty> = []
): QueryType | null {
	let properties: Array<IFAttributeProperty> = ValidateTool.getValidArray(
		subProperties
	);

	let seraialCodes = properties.map((item: IFAttributeProperty) => {
		return item.attributeValue;
	});

	if (seraialCodes.length <= 0) {
		return null;
	}

	return _getQuery(
		ValidFieldKeyForCollectionResult.CarBrandCode,
		seraialCodes.join(','),
		Operator.InRange
	);
}

function _getLicenseNumberCondition(licenseNumber?: string): QueryType | null {
	if (!licenseNumber) {
		return null;
	}

	return _getQuery(
		ValidFieldKeyForCollectionResult.CarLicenseNumber,
		licenseNumber,
		Operator.LIKE
	);
}

function _getVehicleTypeCondiftion(
	vehicleType?: ECarTypeValue
): QueryType | null {
	if (!vehicleType) {
		return null;
	}

	switch (vehicleType) {
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
			return _getQuery(
				ValidFieldKeyForCollectionResult.CarType,
				vehicleType,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

function _getVehicleColorCondition(
	vehicleColor?: ECarColorValue
): QueryType | null {
	if (!vehicleColor) {
		return null;
	}

	switch (vehicleColor) {
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
			return _getQuery(
				ValidFieldKeyForCollectionResult.CarColor,
				vehicleColor,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

function _getLicenseColorCondition(
	licenseColor?: ECarLicenseColorValue
): QueryType | null {
	if (!licenseColor) {
		return null;
	}

	switch (licenseColor) {
		case ECarLicenseColorValue.Yellow:
		case ECarLicenseColorValue.Blue:
		case ECarLicenseColorValue.Black:
		case ECarLicenseColorValue.White:
		case ECarLicenseColorValue.Green:
		case ECarLicenseColorValue.YellowGreen:
		case ECarLicenseColorValue.GradientGreen:
			return _getQuery(
				ValidFieldKeyForCollectionResult.CarLicenseColor,
				licenseColor,
				Operator.EqualTo
			);

		default:
			return null;
	}
}

/************** 二期的车辆相关 end ********************/

/**
 * 人脸属性查询条件集
 * @param {IFAnalysisResourceResPayload} payload 参数
 * @returns {AndQuery} 查询条件集
 */
function getFaceQueryCondition(
	payload: IFAnalysisResourceResPayload
): AndQuery {
	let andBean: AndQuery = [];

	// 属性
	let attributes: Array<IFAttributeProperty> = ValidateTool.getValidArray(
		payload.selectedAttributes
	);
	// 过滤属性(采集只管跟当前targetType类型一直的属性)
	let neededAttributes = attributes.filter(
		(item: IFAttributeProperty, index: number) => {
			if (item.targetType === payload.currentTargetType) {
				return true;
			} else {
				return false;
			}
		}
	);

	for (let attributeItem of neededAttributes) {
		switch (attributeItem.attributeType) {
			case EFaceAttributeType.Age:
				{
					// 年龄
					let ageCondition = getAgeTypeCondition(
						attributeItem.attributeValue as EAgeValue
					);
					if (ageCondition) {
						andBean.push(...ageCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.AgeConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
						attributeItem.attributeValue as EGenderValue
					);
					if (genderCondition) {
						andBean.push(genderCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.GenderConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
						attributeItem.attributeValue as EGlassesValue
					);
					if (glassesCondition) {
						andBean.push(glassesCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.GlassesConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
						attributeItem.attributeValue as EHatValue
					);
					if (hatCondition) {
						andBean.push(hatCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.HatConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
						attributeItem.attributeValue as ERaceValue
					);
					if (raceCondition) {
						andBean.push(raceCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.RaceConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
						attributeItem.attributeValue as EFaceMaskValue
					);
					if (maskCondition) {
						andBean.push(maskCondition);

						// 置信度
						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.MaskConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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

	// // 人脸条件(引擎写死了ok, 就没必要查询这个条件了)
	// andBean.push(
	// 	_getQuery(
	// 		ValidFieldKeyForCollectionResult.ImageQuality,
	// 		EImageQuality.Normal,
	// 		Operator.EqualTo
	// 	)
	// );

	return andBean;
}

function getBodyQueryCondition(
	payload: IFAnalysisResourceResPayload
): AndQuery {
	let andBean: AndQuery = [];
	// 属性
	let attributes: Array<IFAttributeProperty> = ValidateTool.getValidArray(
		payload.selectedAttributes
	);

	// 过滤属性(采集只管跟当前targetType类型一直的属性)
	let neededAttributes = attributes.filter(
		(item: IFAttributeProperty, index: number) => {
			if (item.targetType === payload.currentTargetType) {
				return true;
			} else {
				return false;
			}
		}
	);

	for (let attributeItem of neededAttributes) {
		switch (attributeItem.attributeType) {
			case EBodyAttributeType.Clothes:
				{
					// 衣服款式
					let clothesCondition = getClothesConditon(
						attributeItem.attributeValue as EClothesValue
					);
					if (clothesCondition) {
						andBean.push(clothesCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.ClothesConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
								_getQuery(
									ValidFieldKeyForCollectionResult.ClothesColorConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
								_getQuery(
									ValidFieldKeyForCollectionResult.ClothesTextureConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
								_getQuery(
									ValidFieldKeyForCollectionResult.TrousersConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
								_getQuery(
									ValidFieldKeyForCollectionResult.TrousersColorConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
								_getQuery(
									ValidFieldKeyForCollectionResult.TrousersTextureConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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
								_getQuery(
									ValidFieldKeyForCollectionResult.OvercoatConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.HandBag:
				{
					// 手提包
					let handbagCondition = _getQuery(
						ValidFieldKeyForCollectionResult.HandBag,
						attributeItem.attributeValue as EBaggageValue,
						Operator.EqualTo
					);
					if (handbagCondition) {
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.HandBagConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.SingleShouldBag:
				{
					// 单肩包
					let handbagCondition = _getQuery(
						ValidFieldKeyForCollectionResult.SingleShouldBag,
						attributeItem.attributeValue as EBaggageValue,
						Operator.EqualTo
					);
					if (handbagCondition) {
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.SingleShouldBagConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.Backbag:
				{
					// 背包
					let handbagCondition = _getQuery(
						ValidFieldKeyForCollectionResult.Backbag,
						attributeItem.attributeValue as EBaggageValue,
						Operator.EqualTo
					);
					if (handbagCondition) {
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.BackbagConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
								)
							);
						}
					}
				}

				break;

			case EBodyAttributeType.Drawbox:
				{
					// 拉杆箱
					let handbagCondition = _getQuery(
						ValidFieldKeyForCollectionResult.Drawbox,
						attributeItem.attributeValue as EBaggageValue,
						Operator.EqualTo
					);
					if (handbagCondition) {
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.DrawboxConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
								)
							);
						}
					}
				}
				break;

			case EBodyAttributeType.Cart:
				{
					// 推车
					let handbagCondition = _getQuery(
						ValidFieldKeyForCollectionResult.Cart,
						attributeItem.attributeValue as EBaggageValue,
						Operator.EqualTo
					);
					if (handbagCondition) {
						andBean.push(handbagCondition);

						if (payload.attributeAccuracy) {
							andBean.push(
								_getQuery(
									ValidFieldKeyForCollectionResult.CartConfidence,
									payload.attributeAccuracy,
									Operator.GreatEqualThan
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

function getVehicleQueryCondition(
	payload: IFAnalysisResourceResPayload
): AndQuery {
	let andBean: AndQuery = [];

	// 属性
	let attributes: Array<IFAttributeProperty> = ValidateTool.getValidArray(
		payload.selectedAttributes
	);

	// 过滤属性(采集只管跟当前targetType类型一直的属性)
	let neededAttributes = attributes.filter(
		(item: IFAttributeProperty, index: number) => {
			if (item.targetType === payload.currentTargetType) {
				return true;
			} else {
				return false;
			}
		}
	);

	for (let attributeItem of neededAttributes) {
		switch (attributeItem.attributeType) {
			case EVehicleAttributeType.CarBrand:
				{
					let brandrCondition = getVehicleBrandCondition(
						attributeItem.subAttributeProperties
					);
					if (brandrCondition) {
						andBean.push(brandrCondition);

						// 品牌置信度
						// if (payload.attributeAccuracy) {
						// 	andBean.push(
						// 		_getQuery(
						// 			ValidFieldKeyForCollectionResult.CarBrandCodeConfidence,
						// 			payload.attributeAccuracy,
						// 			Operator.GreatEqualThan
						// 		)
						// 	);
						// }
					}
				}
				break;
			case EVehicleAttributeType.CarBrandSerials:
				{
					// 车系
					let brandrCondition = getVehicleBrandSerialCondition(
						attributeItem.attributeValue as string
					);
					if (brandrCondition) {
						andBean.push(brandrCondition);

						// 品牌置信度
						// if (payload.attributeAccuracy) {
						// 	andBean.push(
						// 		_getQuery(
						// 			ValidFieldKeyForCollectionResult.CarBrandCodeConfidence,
						// 			payload.attributeAccuracy,
						// 			Operator.GreatEqualThan
						// 		)
						// 	);
						// }
					}
				}
				break;

			case EVehicleAttributeType.CarType:
				{
					// 车辆类型
					let vehicleTypeCondition = _getVehicleTypeCondiftion(
						attributeItem.attributeValue as ECarTypeValue
					);
					if (vehicleTypeCondition) {
						andBean.push(vehicleTypeCondition);

						// 品牌置信度
						// if (payload.attributeAccuracy) {
						// 	andBean.push(
						// 		_getQuery(
						// 			ValidFieldKeyForCollectionResult.CarTypeConfidence,
						// 			payload.attributeAccuracy,
						// 			Operator.GreatEqualThan
						// 		)
						// 	);
						// }
					}
				}
				break;

			case EVehicleAttributeType.CarColor:
				{
					// 车辆颜色
					let vehicleColorCondition = _getVehicleColorCondition(
						attributeItem.attributeValue as ECarColorValue
					);
					if (vehicleColorCondition) {
						andBean.push(vehicleColorCondition);

						// 品牌置信度
						// if (payload.attributeAccuracy) {
						// 	andBean.push(
						// 		_getQuery(
						// 			ValidFieldKeyForCollectionResult.CarColorConfidence,
						// 			payload.attributeAccuracy,
						// 			Operator.GreatEqualThan
						// 		)
						// 	);
						// }
					}
				}
				break;

			case EVehicleAttributeType.CarLicenseColor:
				{
					// 车牌颜色
					let licenseColorCondition = _getLicenseColorCondition(
						attributeItem.attributeValue as ECarLicenseColorValue
					);
					if (licenseColorCondition) {
						andBean.push(licenseColorCondition);

						// 品牌置信度
						// if (payload.attributeAccuracy) {
						// 	andBean.push(
						// 		_getQuery(
						// 			ValidFieldKeyForCollectionResult.CarLicenseColorConfidence,
						// 			payload.attributeAccuracy,
						// 			Operator.GreatEqualThan
						// 		)
						// 	);
						// }
					}
				}
				break;

			case EVehicleAttributeType.CarLicenseNumber:
				{
					// 车牌
					let licenseNumberCondition = _getLicenseNumberCondition(
						attributeItem.attributeValue as string
					);
					if (licenseNumberCondition) {
						// 移到andBean里边去
						// andBean.push(licenseNumberCondition);
						// 品牌置信度
						// if (payload.attributeAccuracy) {
						// 	andBean.push(
						// 		_getQuery(
						// 			ValidFieldKeyForCollectionResult.CarLicenseNumberConfidence,
						// 			payload.attributeAccuracy,
						// 			Operator.GreatEqualThan
						// 		)
						// 	);
						// }
					}
				}
				break;

			default:
				break;
		}
	}

	return andBean;
}

/**
 * 将前端传入的类型转换成请求的实际结构
 * NOTE: 简单的解释，就是在[数据源]中查询[满足条件]的信息(and)
 * [数据源]是一个or查询
 * [满足条件]是一个or/and查询
 * 太师傅，我已经忘记了
 * 好了，你可以上了
 * @param {IFAnalysisResourceResPayload} payload 前端传入
 * @returns {TaskResultPayload | null}实际参数
 */
export function convertToRequestPayload(
	payload: IFAnalysisResourceResPayload
): TaskResultPayload | null {
	// 数据源查询条件
	let sourceQuery: OrQuery<AndQuery> = [];

	// 检索范围
	let sources: Array<IFUniqueDataSource> = ValidateTool.getValidArray(
		payload.sources
	);

	// 找到sourceType和对应的sourceId集合, {sourceType1: [sourceId1, sourceId2]}
	let sourceSearchData: { [key: string]: Array<string> } = {};
	for (let source of sources) {
		let sourceType = source.sourceType;
		let sourceId = source.sourceId;
		// eslint-disable-next-line
		if (sourceType != undefined && sourceId != undefined) {
			// NOTE: 只排除undefined和null的情况， 空字符串的情况下让通过
			// 检查sourceId
			let existSourceIds: Array<string> = sourceSearchData[sourceType];
			if (existSourceIds) {
				existSourceIds.push(sourceId);
				sourceSearchData[sourceType] = existSourceIds;
			} else {
				sourceSearchData[sourceType] = [sourceId];
			}
		}
	}

	let sourceTypes = Object.keys(sourceSearchData);
	for (let type of sourceTypes) {
		// @ts-ignore
		let sourceTypeQuery: QueryType | null = getSourceTypeCondition(type);
		let sourceIdsQuery: QueryType | null = getSourceIdsCondition(
			sourceSearchData[type]
		);

		let sourceAndQuery: AndQuery = [];
		if (sourceTypeQuery) {
			sourceAndQuery.push(sourceTypeQuery);
		}

		if (sourceIdsQuery) {
			sourceAndQuery.push(sourceIdsQuery);
		}

		if (sourceAndQuery.length > 0) {
			sourceQuery.push(sourceAndQuery);
		}
	}

	// [满足条件]的查询条件
	let otherQuery: OrQuery<AndQuery<QueryType>> = [];
	if (
		// face query
		payload.targetTypes &&
		payload.targetTypes.indexOf(ETargetType.Face) !== -1
	) {
		let faceConditions: Array<QueryType> = [];
		// 任务类型
		let targetCondition = getTargetTypeCondition(ETargetType.Face);
		if (targetCondition) {
			faceConditions.push(targetCondition);
		}
		// face query
		let faceQuery: AndQuery = getFaceQueryCondition(payload);
		faceConditions.push(...faceQuery);

		if (faceConditions.length > 0) {
			otherQuery.push(faceConditions);
		}
	}

	if (
		// body query
		payload.targetTypes &&
		payload.targetTypes.indexOf(ETargetType.Body) !== -1
	) {
		let bodyConditions: Array<QueryType> = [];
		// 任务类型
		let targetCondition = getTargetTypeCondition(ETargetType.Body);
		if (targetCondition) {
			bodyConditions.push(targetCondition);
		}
		// body query
		let bodyQuery: AndQuery = getBodyQueryCondition(payload);
		bodyConditions.push(...bodyQuery);

		if (bodyConditions.length > 0) {
			otherQuery.push(bodyConditions);
		}
	}

	// vehicle query
	if (
		payload.targetTypes &&
		payload.targetTypes.indexOf(ETargetType.Vehicle) !== -1
	) {
		let vehicleConditions: Array<QueryType> = [];
		// 任务类型
		let targetCondition = getTargetTypeCondition(ETargetType.Vehicle);
		if (targetCondition) {
			vehicleConditions.push(targetCondition);
		}

		// vehicle query
		let vehicleQuery: AndQuery = getVehicleQueryCondition(payload);
		vehicleConditions.push(...vehicleQuery);

		if (vehicleConditions.length > 0) {
			otherQuery.push(vehicleConditions);
		}
	}

	// targetType
	let andBean: AndQuery = [];

	// 时间
	let dateCondition = getDateCondition(payload.startDate, payload.endDate);
	andBean.push(...dateCondition);

	// 分页
	let pagnitionCondition = getPageTypeCondition(payload.page, payload.pageSize);
	andBean.push(...pagnitionCondition);

	// 数据分析类型
	andBean.push(getAnalysisTypeCondition());

	// 对于车牌，我们将其放在andBean里边
	if (payload.currentTargetType === ETargetType.Vehicle) {
		let attributes: Array<IFAttributeProperty> = ValidateTool.getValidArray(
			payload.selectedAttributes
		);
		let licenseNumberCondition: QueryType | null = null;
		for (let attribute of attributes) {
			if (attribute.attributeType === EVehicleAttributeType.CarLicenseNumber) {
				licenseNumberCondition = _getLicenseNumberCondition(
					attribute.attributeValue as string
				);
				break;
			}
		}

		if (licenseNumberCondition) {
			andBean.push(licenseNumberCondition);
		}
	}

	// NOTE: 分析任务没有相似度。相似度
	// let thresholdCondition = getThresholdCondition(payload.threshold);
	// if (thresholdCondition) {
	// 	andBean.push(thresholdCondition);
	// }
	let orBeanList = [];
	if (sourceQuery.length > 0) {
		orBeanList.push(sourceQuery);
	}

	if (otherQuery.length > 0) {
		// orBeanList.push(otherQuery);
		for (let query of otherQuery) {
			andBean.push(...query);
		}
	}

	// 可能有其他的扩展(参数)
	let realPayload: TaskResultPayload = {
		orBeanList: orBeanList,
		andBean: andBean,
		sort: ESortType.Descend,
		// set: !payload.mergeType ? EMerge.Intersection : EMerge.Union
		set: EMerge.Intersection, // NOTE: 后端要求写死
		relative: payload.currentTargetType === ETargetType.Vehicle ? true : false
	};
	/************* 转换为查询对象 END ************/

	return realPayload;
}
