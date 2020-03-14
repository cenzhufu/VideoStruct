import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';
import { Condition } from '../_types';
import * as moment from 'moment';
import { IStatisticItemInfo } from './data-request-type';
import {
	CommonResponseDataType,
	ETargetType,
	ESourceType,
	getValidTargetType
} from 'sttypedefine';
import {
	getDataServerRequestUrl,
	getDateRange,
	getSourceIdCondition,
	getSourceTypeCondition,
	getStuctualTypeCondition,
	getAllStuctualTypeCondition,
	getFaceQueryCondition,
	getBodyQueryCondition
} from '../_utils';
import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse, IFRequestConfig } from 'ifutils/requests';
import { IFAnalysisResourceResPayload } from '../../../collection-request';
import { IFNewAttributesFilterInfo } from 'stsrc/components/attribute-filter-panel';
import { generateFaceQueyParams } from '../util/generate-face-query-params';
import { generateBodyQueyParams } from '../util/generate-body-query-params';
import { generateVehicleQueyParams } from '../util/generate-car-query-params';
import { IFSearchStatisticInfo } from 'stsrc/utils/requests/search-service-requeests';

/**
 * 查询统计结果(最底层的封装)
 * 文档: http://192.168.2.150:8090/pages/viewpage.action?pageId=4980860&preview=/4980860/4982095/IFaaS-3.0%E6%95%B0%E6%8D%AE%E6%9C%8D%E5%8A%A1%E8%AF%A6%E7%BB%86%E8%AE%BE%E8%AE%A1%E8%AF%B4%E6%98%8E%E4%B9%A6%20V1.1.docx
 * @param {string} tableName 表名字
 * @param {string} fileds 统计项的key(数据库的key), 多字段查询使用"#"拼接, 如果想查询所有字段，传入"notDefined"
 * @param {string} dateRange 时间区间 "YYYY-MM-DD HH:mm:ss~YYYY-MM-DD HH:mm:ss", 如果要查询全部时间段，传入空字符串即可
 * @param {Array<Condition>} conditions 过滤条件
 * @param {Object} options {} 其他字段
 * @param {IFRequestConfig} requestOptions {} 其他字段
 * @returns {Promise<Array<IStatisticItemInfo>>} 统计结构
 */
async function getStatisticInfo(
	tableName: string,
	fileds: string,
	dateRange: string,
	conditions: Array<Condition>,
	options: Object = {},
	requestOptions: IFRequestConfig = {}
): Promise<Array<IStatisticItemInfo>> {
	let url = getDataServerRequestUrl('/data/oper/statistic/1.0');

	let results: IFResponse<
		CommonResponseDataType<Array<IStatisticItemInfo>>
	> = await IFRequest.post(
		url,
		{
			tableName: tableName,
			statisticalItem: fileds,
			date: dateRange,
			conditions: conditions,
			...options
		},
		requestOptions
	);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		Array<IStatisticItemInfo>
	> = ValidateTool.getValidObject(results['data'], {});

	let data: Array<IStatisticItemInfo> = ValidateTool.getValidArray(
		serverData['data'],
		[]
	);
	return data;
}

/**
 * 获取某个数据源人脸的统计数量
 * NOTE: payload中的sources字段我们只会取第一个元素用来统计
 * @param {IFAnalysisResourceResPayload} payload 请求参数
 * @returns {Promise<Array<IStatisticItemInfo>>} 统计结果
 */
async function getAnalysisFaceStaticResult(
	payload: IFAnalysisResourceResPayload
): Promise<Array<IStatisticItemInfo>> {
	let tableName = 'multobj';
	let dateRange = getDateRange(payload['startDate'], payload['endDate']);

	// source
	let sources: Array<IFUniqueDataSource> = ValidateTool.getValidArray(
		payload.sources
	);
	// let sourceIds = ValidateTool.getValidArray(payload['sourceIds'], []);
	// let sourceTypes = ValidateTool.getValidArray(payload['sourceTypes']);

	// if (sourceIds.length !== sourceTypes.length) {
	// 	return Promise.reject(new Error('参数长度不一样'));
	// }

	let conditions: Array<Condition> = [];
	if (sources.length > 0) {
		let sourceIdCondition = getSourceIdCondition(sources[0].sourceId);
		let sourceTypeCondition = getSourceTypeCondition(sources[0].sourceType);

		if (sourceIdCondition && sourceTypeCondition) {
			conditions.push(sourceIdCondition);
			conditions.push(sourceTypeCondition);
		} else {
			return Promise.reject(new Error('sourceId/sourceType查询条件出错'));
		}
	}

	conditions.push(...getFaceQueryCondition(payload));

	// @ts-ignore
	return getStatisticInfo(tableName, 'notDefined', dateRange, [
		...conditions,
		getStuctualTypeCondition(ETargetType.Face)
	]);
}

/**
 * 获得某个分析源人体的统计数量
 * NOTE: payload中的sources字段我们只会取第一个元素用来统计
 * @param {IFAnalysisResourceResPayload} payload 请求参数
 * @returns {Promise<Array<IStatisticItemInfo>>} 统计结果
 */
async function getAnalysisBodyStaticResult(
	payload: IFAnalysisResourceResPayload
): Promise<Array<IStatisticItemInfo>> {
	let tableName = 'multobj';
	let dateRange = getDateRange(payload['startDate'], payload['endDate']);

	// source
	let sources: Array<IFUniqueDataSource> = ValidateTool.getValidArray(
		payload.sources
	);
	// let sourceIds = ValidateTool.getValidArray(payload['sourceIds'], []);
	// let sourceTypes = ValidateTool.getValidArray(payload['sourceTypes']);

	// if (sourceIds.length !== sourceTypes.length) {
	// 	return Promise.reject(new Error('参数长度不一样'));
	// }

	let conditions: Array<Condition> = [];
	if (sources.length > 0) {
		let sourceIdCondition = getSourceIdCondition(sources[0].sourceId);
		let sourceTypeCondition = getSourceTypeCondition(sources[0].sourceType);

		if (sourceIdCondition && sourceTypeCondition) {
			conditions.push(sourceIdCondition);
			conditions.push(sourceTypeCondition);
		} else {
			return Promise.reject(new Error('sourceId/sourceType查询条件出错'));
		}
	}

	conditions.push(...getBodyQueryCondition(payload));

	// @ts-ignore
	return getStatisticInfo(tableName, 'notDefined', dateRange, [
		...conditions,
		getStuctualTypeCondition(ETargetType.Body)
	]);
}

/**
 * 获得某个分析源人体和人脸,车辆的总的统计数量
 * NOTE: payload中的sources字段我们只会取第一个元素用来统计
 * @param {IFnalysisStatisticResPayload} payload 请求参数
 * @returns {Promise<Array<IStatisticItemInfo>>} 统计结果
 */
async function getTotalAnalysisStaticResult(
	payload: IFAnalysisResourceResPayload
) {
	let tableName = 'multobj';
	let dateRange = getDateRange(payload['startDate'], payload['endDate']);

	let conditions: Array<Condition> = [];

	// source
	let sources: Array<IFUniqueDataSource> = ValidateTool.getValidArray(
		payload.sources
	);
	// // sourceId, sourceType
	// let sourceIds = ValidateTool.getValidArray(payload.sourceIds, []);
	// let sourceTypes = ValidateTool.getValidArray(payload.sourceTypes);

	// if (sourceIds.length !== sourceTypes.length) {
	// 	return Promise.reject(new Error('参数长度不一样'));
	// }

	if (sources.length > 0) {
		// 只会取第一个
		let sourceIdCondition = getSourceIdCondition(sources[0].sourceId);
		let sourceTypeCondition = getSourceTypeCondition(sources[0].sourceType);

		if (sourceIdCondition && sourceTypeCondition) {
			conditions.push(sourceIdCondition);
			conditions.push(sourceTypeCondition);
		} else {
			return Promise.reject(new Error('sourceId/sourceType查询条件出错'));
		}
	}

	conditions.push(
		...getFaceQueryCondition(payload),
		...getBodyQueryCondition(payload)
	);
	return getStatisticInfo(tableName, 'notDefined', dateRange, [
		...conditions,
		getAllStuctualTypeCondition([
			ETargetType.Face,
			ETargetType.Body,
			ETargetType.Vehicle
		])
	]);
}

/**
 * 获取某个数据源今天的采集量
 * @param {string} sourceId 数据源id
 * @param {Array<ETargetType>} [targetTypes=[]] target types
 * @param {sourceType} [sourceType=ESourceType.Camera] 数据源类型
 * @returns {number} 采集量
 */
async function getTodaySourceStaticResult(
	sourceId: string,
	targetTypes: Array<ETargetType> = [],
	sourceType: ESourceType = ESourceType.Camera
): Promise<number> {
	let tableName = 'multobj';
	let today = moment(new Date().getTime()).format('YYYY-MM-DD');
	let dateRange = getDateRange(today + ' 00:00:00', today + ' 23:59:59'); // TODO: 今天时间范围

	let sourceIdCondition = getSourceIdCondition(sourceId);
	let sourceTypeCondition = getSourceTypeCondition(sourceType);

	let conditions: Array<Condition> = [];
	if (sourceIdCondition && sourceTypeCondition) {
		conditions.push(sourceIdCondition);
		conditions.push(sourceTypeCondition);
	} else {
		return Promise.reject(new Error('sourceId/sourceType查询条件出错'));
	}

	let result = await getStatisticInfo(tableName, 'notDefined', dateRange, [
		...conditions,
		getAllStuctualTypeCondition(targetTypes) // NOTE: 是否需要统计车辆？
	]);

	return (result[0] && result[0].statisticalResult) || 0;
}

export interface CaptureStatisticsRequestOptions
	extends Partial<IFNewAttributesFilterInfo> {
	page: number;
	pageSize: number;

	sourceIds?: Array<string>;
	sourceType?: ESourceType;
	targetTypes?: ETargetType[]; // 任务类型
}

async function getSourceIdStatisticsResult(
	options: Partial<CaptureStatisticsRequestOptions> = {},
	requestOptions: Partial<IFRequestConfig> = {}
): Promise<IFSearchStatisticInfo[]> {
	let defaultOptions = {
		page: 1,
		pageSize: 50,
		targetTypes: ETargetType.Face
	};

	// @ts-ignore
	let mergetOptions: Partial<CaptureStatisticsRequestOptions> = {
		...defaultOptions,
		...options
	};

	let queryObject = {};
	switch (mergetOptions.currentTargetType) {
		case ETargetType.Face:
			queryObject = generateFaceQueyParams([], mergetOptions);
			break;

		case ETargetType.Body:
			queryObject = generateBodyQueyParams([], mergetOptions);
			break;

		case ETargetType.Vehicle:
			queryObject = generateVehicleQueyParams([], mergetOptions);
			break;

		default:
			break;
	}

	let tableName = 'multobj';
	let result: Array<IStatisticItemInfo> = await getStatisticInfo(
		tableName,
		'sourceId#targetType',
		'',
		[],
		{
			conditionBefore: {
				limitBefore: 100000000,
				...queryObject
			},
			pageParam: {
				pageNo: mergetOptions.page,
				pageSize: mergetOptions.pageSize
			},
			orderBy: {
				time: -1
			}
		},
		requestOptions
	);

	// 解析result
	// @ts-ignore 我不会写这个类型啊
	let convertedResults: IFSearchStatisticInfo[] = result
		.map((item: IStatisticItemInfo) => {
			return parserSourceIdStatisticsResult(item);
		})
		.filter(Boolean);
	return convertedResults;
}

function parserSourceIdStatisticsResult(
	info: IStatisticItemInfo
): IFSearchStatisticInfo | null {
	let values: string[] = info.statisticalValue.split('#');
	if (values.length === 2) {
		let sourceId = values[0];
		let targetType = getValidTargetType(values[1] as ETargetType);
		if (targetType !== ETargetType.Unknown) {
			return {
				sourceId: sourceId,
				targetType: targetType,
				count: info.statisticalResult,
				sourceType: ESourceType.Camera
			};
		} else {
			return null;
		}
	} else {
		return null;
	}
}

export const DataServerRequests = {
	getStatisticInfo: getStatisticInfo,
	getAnalysisFaceStaticResult: getAnalysisFaceStaticResult,
	getAnalysisBodyStaticResult: getAnalysisBodyStaticResult,
	getTotalAnalysisStaticResult: getTotalAnalysisStaticResult,
	getTodaySourceStaticResult,
	getSourceIdStatisticsResult: getSourceIdStatisticsResult
};
