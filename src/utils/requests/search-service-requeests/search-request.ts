import {
	EVehicleAttributeType,
	EConfidenceValue
} from './../../../type-define/types/attributes/attribute-type';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import {
	CommonResponseDataType,
	ECarColorValue,
	ECarTypeValue,
	ECarLicenseColorValue
} from 'stsrc/type-define';
import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFRequestConfig, IFResponse } from 'ifutils/requests';
import { getSearchInfoRequestUrl } from './_url';
import {
	IFStructuralInfo,
	ETargetType,
	ESourceType,
	ESortKey,
	ESortType,
	ListType,
	IFStructuralLinkInfo,
	EAgeValue,
	EMerge,
	IFAttributeProperty,
	DateFormat,
	EFaceAttributeType,
	ERaceValue,
	EGenderValue,
	EHatValue,
	EGlassesValue,
	EFaceMaskValue,
	EBodyAttributeType,
	EColorValue,
	EClothesValue,
	ETextureValue,
	ETrousersValue,
	EOverCoatValue,
	EBaggageValue
} from 'sttypedefine';
import {
	IBSearchParamsType,
	IBLinkSearchResultDataType,
	FilterMapType,
	FaceFilterType,
	BodyFilterType,
	IBSearchResult,
	VehicleFilterType
} from './types/_innter';
import {
	IFSearchDataSourceInfo,
	IFSearchStatisticInfo,
	IFSearchResult,
	ESearchDataSourceType
} from './types/outer';

import { ValidFieldKeyForCollectionResult } from '../collection-request/collection-analyze-result/types/_innter';
import { toStructuralLinkInfoFromBLinkInfo } from './to-structural-link-info-adaptor';
import { greetAndEqualThanSearchCondition } from './_search-util';

const PAGE_SIZE: number = 200;

export interface SourceRangeType {
	sourceIds: string[];
	sourceTypes: ESourceType[];
}

/**
 *
 * 目标搜索-不关联图片查询
 * @param {IBSearchParamsType} params 过滤条件
 * @param {Partial<IFRequestConfig>} [options={}] 额外选项
 * @returns {Promise<ListType<IFStructuralLinkInfo>>} 返回数据搜索结果
 */
async function _getSearchResult(
	params: IBSearchParamsType,
	options: Partial<IFRequestConfig> = {}
): Promise<IFSearchResult> {
	let url = getSearchInfoRequestUrl(
		'/api/intellif/search/searchTargetImage/2.0'
	);
	let result: IFResponse<
		CommonResponseDataType<IBSearchResult>
	> = await IFRequest.post(url, params, options);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IBSearchResult
	> = ValidateTool.getValidObject(result['data'], {});

	// @ts-ignore
	let searchResult: IBSearchResult = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	// 结果数据
	const data: ListType<IFStructuralLinkInfo> = {
		list: formatResultsData(
			ValidateTool.getValidArray(searchResult['results'])
		),
		// @ts-ignore
		total: serverData.total | 0
	};

	// @ts-ignore 统计数据
	let staticInfos: IFSearchStatisticInfo[] = ValidateTool.getValidArray(
		searchResult['sourceCount'],
		[]
	);

	return {
		results: data,
		staticInfos: staticInfos
	};
}

export interface SearchOptions {
	page: number; // 分页
	pageSize: number; // 分页
	mergeType: EMerge; // 合并方法
	showTypes: ETargetType[]; // 结果显示的类型
	sort: ESortKey; // 排序字段
	sortType: ESortType; // 排序类型
	threshold: number; // 相似度
	startTime: typeof DateFormat | null;
	endTime: typeof DateFormat | null;
	currentTargetType: ETargetType;
	attributeAccuracy: EConfidenceValue; //属性精确度， 默认ECondidence.Low, 一定存在
}

function convertToRequestSourceTarget(
	sourceTargetList: Array<IFStructuralInfo>
): IFSearchDataSourceInfo[] {
	const Images: IFSearchDataSourceInfo[] = [];
	for (let structuralInfo of sourceTargetList) {
		let Img = {
			imageType: ESearchDataSourceType.ID,
			imageData: structuralInfo.id,
			targetType: structuralInfo.targetType
		};
		Images.push(Img);
	}

	return Images;
}

function convertToRequestSourceRange(
	sourceList: Array<IFUniqueDataSource>
): SourceRangeType {
	let sourceIds: Array<string> = [];
	let sourceTypes: Array<ESourceType> = [];
	for (let item of sourceList) {
		sourceIds.push(item.sourceId);
		sourceTypes.push(item.sourceType);
	}
	let sourceTypeList = new Set(sourceTypes);
	const sourceRange = { sourceIds, sourceTypes: [...sourceTypeList] };
	return sourceRange;
}

async function getSearchResultsParams(
	sourceTargetList: Array<IFStructuralInfo>,
	sourceRangeList: Array<IFUniqueDataSource>,
	attributes: Array<IFAttributeProperty>,
	options: Partial<SearchOptions> = {},
	requestOptions: Partial<IFRequestConfig> = {}
) {
	let sources: IFSearchDataSourceInfo[] = convertToRequestSourceTarget(
		sourceTargetList
	);
	let sourceRange: SourceRangeType = convertToRequestSourceRange(
		sourceRangeList
	);

	return getSearchResults(
		sources,
		sourceRange,
		attributes,
		options,
		requestOptions
	);
}

async function getSearchResults(
	sources: Array<IFSearchDataSourceInfo>,
	sourceRange: SourceRangeType,
	attributes: Array<IFAttributeProperty>,
	options: Partial<SearchOptions> = {},
	requestOptions: Partial<IFRequestConfig> = {}
): Promise<IFSearchResult> {
	const defaultOptions = {
		page: 1, // 分页
		pageSize: PAGE_SIZE, // 分页
		mergeType: EMerge.Union, // 合并方法
		showTypes: [ETargetType.Face, ETargetType.Body], // 结果显示的类型
		sort: ESortKey.Score, // 排序字段
		sortType: ESortType.Descend, // 排序类型
		threshold: 0.92, // 相似度
		startTime: null,
		endTime: null,
		attributeAccuracy: EConfidenceValue.Low
	};

	let mergedOptions = {
		...defaultOptions,
		...options
	};

	// if (options.attributeAccuracy) {
	// 	mergedOptions.attributeAccuracy = [
	// 		options.attributeAccuracy,
	// 		'*'
	// 	].toString();
	// }

	// 主属性
	let mainType: ETargetType = ETargetType.Unknown;
	for (let source of sources) {
		if (source.targetType !== ETargetType.Unknown) {
			mainType = source.targetType;
			break;
		}
	}

	if (mainType === ETargetType.Unknown) {
		// 没有有效的搜索目标
		// return Promise.reject(new Error('参数错误'));
		return {
			results: {
				total: 0,
				list: []
			},
			staticInfos: []
		};
	}

	let currentTargetType: ETargetType =
		options.currentTargetType || ETargetType.Face;

	const faceAttr = _getFaceAttributesSearchCondition(
		sourceRange,
		attributes,
		mergedOptions.attributeAccuracy
	);
	const bodyAttr = _getBodyAttributesSearchCondition(
		sourceRange,
		attributes,
		mergedOptions.attributeAccuracy
	);
	const vehicleAttr = _getVehicleAttributesSearchCondition(
		sourceRange,
		attributes,
		mergedOptions.attributeAccuracy
	);

	let filterMap = [];
	switch (mainType) {
		case ETargetType.Face:
			filterMap.push(faceAttr);
			if (currentTargetType === ETargetType.Body) {
				filterMap.push(bodyAttr);
			} else if (currentTargetType === ETargetType.Vehicle) {
				filterMap.push(vehicleAttr);
			}

			break;

		case ETargetType.Body:
			filterMap.push(bodyAttr);
			if (currentTargetType === ETargetType.Face) {
				filterMap.push(faceAttr);
			} else if (currentTargetType === ETargetType.Vehicle) {
				filterMap.push(vehicleAttr);
			}
			break;

		case ETargetType.Vehicle:
			filterMap.push(vehicleAttr);
			if (currentTargetType === ETargetType.Face) {
				filterMap.push(faceAttr);
			} else if (currentTargetType === ETargetType.Body) {
				filterMap.push(bodyAttr);
			}
			break;
	}

	const param: IBSearchParamsType = {
		filterMap,
		image: sources,
		// dimension: ETargetType.Face,
		// type: '0,1,2', //检索库类型 (0 : 抓拍人脸库1:居住人员库 2: 静态人员库)
		threshold: mergedOptions.threshold,
		startTime: mergedOptions.startTime,
		endTime: mergedOptions.endTime,
		sort: mergedOptions.sort,
		sortType: mergedOptions.sortType,
		page: mergedOptions.page,
		pageSize: mergedOptions.pageSize,
		mergeType: mergedOptions.mergeType,
		targets: mergedOptions.showTypes
	};

	let result = await _getSearchResult(param, requestOptions);
	return result;
}

function _getFaceAttributesSearchCondition(
	sourceRange: SourceRangeType,
	attributes: Array<IFAttributeProperty>,
	attributeAccuracy: string
): FilterMapType {
	let faceCondition: FaceFilterType = {
		sourceId: sourceRange.sourceIds.join(','),
		sourceType: sourceRange.sourceTypes.join(','),
		age: EAgeValue.All,
		race: ERaceValue.All,
		gender: EGenderValue.All,
		hat: EHatValue.All,
		glasses: EGlassesValue.All,
		mask: EFaceMaskValue.All
	};
	for (let attributeItem of attributes) {
		switch (attributeItem.attributeType) {
			case EFaceAttributeType.Age: {
				faceCondition[ValidFieldKeyForCollectionResult.Age] =
					attributeItem.attributeValue === EAgeValue.All
						? EAgeValue.All
						: attributeItem.attributeValue === EAgeValue.Old
						? '[' + attributeItem.attributeValue + ',*]'
						: '[' + attributeItem.attributeValue + ']';

				// 置信度
				if (attributeAccuracy) {
					faceCondition[
						ValidFieldKeyForCollectionResult.AgeConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EFaceAttributeType.Gender: {
				// @ts-ignore
				faceCondition[ValidFieldKeyForCollectionResult.Gender] =
					attributeItem.attributeValue;

				if (attributeAccuracy) {
					faceCondition[
						ValidFieldKeyForCollectionResult.GenderConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EFaceAttributeType.Glasses: {
				// @ts-ignore
				faceCondition[ValidFieldKeyForCollectionResult.Glasses] =
					attributeItem.attributeValue;

				if (attributeAccuracy) {
					faceCondition[
						ValidFieldKeyForCollectionResult.GlassesConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}
				break;
			}

			case EFaceAttributeType.Hat: {
				// @ts-ignore
				faceCondition[ValidFieldKeyForCollectionResult.Hat] =
					attributeItem.attributeValue;

				if (attributeAccuracy) {
					faceCondition[
						ValidFieldKeyForCollectionResult.HatConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}
				break;
			}

			case EFaceAttributeType.Race: {
				// @ts-ignore
				faceCondition[ValidFieldKeyForCollectionResult.Nation] =
					attributeItem.attributeValue;

				if (attributeAccuracy) {
					faceCondition[
						ValidFieldKeyForCollectionResult.RaceConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EFaceAttributeType.Mask: {
				// @ts-ignore
				faceCondition[ValidFieldKeyForCollectionResult.FaceMask] =
					attributeItem.attributeValue;

				if (attributeAccuracy) {
					faceCondition[
						ValidFieldKeyForCollectionResult.MaskConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}
				break;
			}

			default:
				break;
		}
	}
	return {
		targetType: ETargetType.Face,
		attribute: faceCondition
	};
}

function _getBodyAttributesSearchCondition(
	sourceRange: SourceRangeType,
	attributes: Array<IFAttributeProperty>,
	attributeAccuracy: string
): FilterMapType {
	let bodyCondition: BodyFilterType = {
		sourceId: sourceRange.sourceIds.join(','),
		sourceType: sourceRange.sourceTypes.join(','),
		coatColor: EColorValue.All, //{“black”:0.1,//黑色”blue”: 0.2,//蓝色”green”: 0.3,//绿色”red”: 0.4,//红色”white”: 0.5,//白色”yellow”: 0.5,//黄色”gray”: 0.8,//灰色”orange”: 0.9,//橙色”purple”: 0.7}//紫色
		pantsColor: EColorValue.All,
		// bodyAngle: string; //人体角度front：正面side：侧面back：背后
		// bodyAgeStage: string; //年龄阶段 child：少年adult：成年senior：老年
		coatStyle: EClothesValue.All,
		coatPattern: ETextureValue.All,
		pantsStyle: ETrousersValue.All,
		pantsPattern: ETextureValue.All,
		hasCoat: EOverCoatValue.All,
		// bodyGender: EGenderValue;
		// handbag: { [type in EBaggageType]?: EBaggageValue };
		handbag: EBaggageValue.All,
		singlebag: EBaggageValue.All,
		backbag: EBaggageValue.All,
		drawbox: EBaggageValue.All,
		cart: EBaggageValue.All
	};
	for (let attributeItem of attributes) {
		switch (attributeItem.attributeType) {
			case EBodyAttributeType.Clothes: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.Clothes
				] = attributeItem.attributeValue as EClothesValue; // 上衣样式

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.ClothesConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.ClothesColor: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.ClothesColor
				] = attributeItem.attributeValue as EColorValue; // 上衣颜色

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.ClothesColorConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.ClothesTexture: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.ClothesTexture
				] = attributeItem.attributeValue as ETextureValue; // 上衣纹理

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.ClothesTextureConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.Trousers: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.Trousers
				] = attributeItem.attributeValue as ETrousersValue; // 裤子样式

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.TrousersConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.TrousersColor: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.TrousersColor
				] = attributeItem.attributeValue as EColorValue; // 裤子颜色

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.TrousersColorConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.TrousersTexture: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.TrousersTexture
				] = attributeItem.attributeValue as ETextureValue; // 裤子纹理

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.TrousersTextureConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.Coat: {
				bodyCondition[
					ValidFieldKeyForCollectionResult.OverCoat
				] = attributeItem.attributeValue as EOverCoatValue; // 是否有大衣

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.OvercoatConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.HandBag: {
				// 手提包
				bodyCondition[
					ValidFieldKeyForCollectionResult.HandBag
				] = attributeItem.attributeValue as EBaggageValue;

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.HandBagConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.SingleShouldBag: {
				// 单肩包
				bodyCondition[
					ValidFieldKeyForCollectionResult.SingleShouldBag
				] = attributeItem.attributeValue as EBaggageValue;

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.SingleShouldBagConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.Backbag: {
				// 背包
				bodyCondition[
					ValidFieldKeyForCollectionResult.Backbag
				] = attributeItem.attributeValue as EBaggageValue;

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.BackbagConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.Drawbox: {
				// 拉杆箱
				bodyCondition[
					ValidFieldKeyForCollectionResult.Drawbox
				] = attributeItem.attributeValue as EBaggageValue;

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.DrawboxConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			case EBodyAttributeType.Cart: {
				// 手推车
				bodyCondition[
					ValidFieldKeyForCollectionResult.Cart
				] = attributeItem.attributeValue as EBaggageValue;

				if (attributeAccuracy) {
					bodyCondition[
						ValidFieldKeyForCollectionResult.CartConfidence
					] = greetAndEqualThanSearchCondition(attributeAccuracy);
				}

				break;
			}

			default:
				break;
		}
	}
	return {
		targetType: ETargetType.Body,
		attribute: bodyCondition
	};
}

function _getVehicleAttributesSearchCondition(
	sourceRange: SourceRangeType,
	attributes: Array<IFAttributeProperty>,
	attributeAccuracy: string
): FilterMapType {
	let vehicleCondition: VehicleFilterType = {
		sourceId: sourceRange.sourceIds.join(','),
		sourceType: sourceRange.sourceTypes.join(','),

		color: ECarColorValue.All,
		type: ECarTypeValue.All,
		brandCode: '',
		plateNumber: '',
		plateColor: ECarLicenseColorValue.All
	};

	for (let attributeItem of attributes) {
		switch (attributeItem.attributeType) {
			case EVehicleAttributeType.CarBrand: {
				vehicleCondition[
					ValidFieldKeyForCollectionResult.CarBrandCode
				] = attributeItem.subAttributeProperties
					.map((property: IFAttributeProperty) => {
						return property.attributeValue;
					})
					.join(','); // 车辆品牌code

				// if (attributeAccuracy) {
				// 	vehicleCondition[
				// 		ValidFieldKeyForCollectionResult.CarBrandCodeConfidence
				// 	] = greetAndEqualThanSearchCondition(attributeAccuracy);
				// }

				break;
			}

			case EVehicleAttributeType.CarBrandSerials: {
				vehicleCondition[ValidFieldKeyForCollectionResult.CarBrandCode] =
					attributeItem.attributeValue; // 车辆品牌code

				// if (attributeAccuracy) {
				// 	vehicleCondition[
				// 		ValidFieldKeyForCollectionResult.CarBrandCodeConfidence
				// 	] = greetAndEqualThanSearchCondition(attributeAccuracy);
				// }

				break;
			}

			case EVehicleAttributeType.CarColor: {
				vehicleCondition[
					ValidFieldKeyForCollectionResult.CarColor
				] = attributeItem.attributeValue as ECarColorValue; // 车辆颜色

				// if (attributeAccuracy) {
				// 	vehicleCondition[
				// 		ValidFieldKeyForCollectionResult.CarColorConfidence
				// 	] = greetAndEqualThanSearchCondition(attributeAccuracy);
				// }

				break;
			}

			case EVehicleAttributeType.CarType: {
				vehicleCondition[
					ValidFieldKeyForCollectionResult.CarType
				] = attributeItem.attributeValue as ECarTypeValue; // 车辆类型

				// if (attributeAccuracy) {
				// 	vehicleCondition[
				// 		ValidFieldKeyForCollectionResult.CarTypeConfidence
				// 	] = greetAndEqualThanSearchCondition(attributeAccuracy);
				// }

				break;
			}

			case EVehicleAttributeType.CarLicenseColor: {
				vehicleCondition[
					ValidFieldKeyForCollectionResult.CarLicenseColor
				] = attributeItem.attributeValue as ECarLicenseColorValue; // 裤子样式

				// if (attributeAccuracy) {
				// 	vehicleCondition[
				// 		ValidFieldKeyForCollectionResult.CarLicenseColorConfidence
				// 	] = greetAndEqualThanSearchCondition(attributeAccuracy);
				// }

				break;
			}

			case EVehicleAttributeType.CarLicenseNumber: {
				vehicleCondition[ValidFieldKeyForCollectionResult.CarLicenseNumber] =
					'{%' + attributeItem.attributeValue + '%}'; // 车牌号码
				// if (attributeAccuracy) {
				// 	vehicleCondition[
				// 		ValidFieldKeyForCollectionResult.CarLicenseNumberConfidence
				// 	] = greetAndEqualThanSearchCondition(attributeAccuracy);
				// }
				break;
			}

			default:
				break;
		}
	}
	return {
		targetType: ETargetType.Vehicle,
		attribute: vehicleCondition
	};
}

/**
 * 格式化有关联结果数据
 * @param {Array<IBLinkSearchResultDataType>} results 要格式化的数据
 * @returns {Array<IFStructuralLinkInfo>} 格式化结果
 */
function formatResultsData(
	results: Array<IBLinkSearchResultDataType>
): Array<IFStructuralLinkInfo> {
	let data: Array<IFStructuralLinkInfo> = [];

	if (results) {
		for (let item of results) {
			if (item) {
				//@ts-ignore
				let result: IFStructuralLinkInfo = toStructuralLinkInfoFromBLinkInfo(
					item
				);
				data.push(result);
			}
		}
	}
	return data;
}

async function getSearchStatisticsInfoParams(
	sourceTargetList: Array<IFStructuralInfo>,
	attributes: Array<IFAttributeProperty>,
	options: Partial<SearchOptions> = {},
	requestOptions: Partial<IFRequestConfig> = {}
) {
	let sources: IFSearchDataSourceInfo[] = convertToRequestSourceTarget(
		sourceTargetList
	);

	return getSearchStatisticsInfo(sources, attributes, options, requestOptions);
}

async function getSearchStatisticsInfo(
	sources: Array<IFSearchDataSourceInfo>,
	attributes: Array<IFAttributeProperty>,
	options: Partial<SearchOptions> = {},
	requestOptions: Partial<IFRequestConfig> = {}
): Promise<Array<IFSearchStatisticInfo>> {
	let response: IFSearchStatisticInfo[] = [];
	let result: IFSearchResult = await getSearchResults(
		sources,
		{
			sourceIds: [],
			sourceTypes: []
		},
		attributes,
		options,
		requestOptions
	);

	if (result && result.staticInfos.length > 0) {
		response = result.staticInfos;
	}

	return response;
}

//保留小数
// function _reservedDecimal(val: number, digit: number) {
// 	// if (Number(val) === 1) {
// 	// 	return 0.99;
// 	// }
// 	return Number(Number(val).toFixed(digit));
// }

const SearchService = {
	// getSearchResults,
	getSearchResultsParams,
	getSearchStatisticsInfo,
	getSearchStatisticsInfoParams
};

export default SearchService;
