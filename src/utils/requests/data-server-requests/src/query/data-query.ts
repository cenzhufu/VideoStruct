import { ETargetType, IFStructuralInfo, ESourceType } from 'sttypedefine';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { IFResponse, IFRequest, IFRequestConfig } from 'ifutils/requests';
import { getDataServerRequestUrl } from '../_utils';
import { CommonResponseDataType, ListType } from 'stsrc/type-define';
import { IBAnalysisResultInfo } from 'stsrc/utils/requests/collection-request';
import { IFNewAttributesFilterInfo } from 'stsrc/components/attribute-filter-panel';
import { generateFaceQueyParams } from '../util/generate-face-query-params';
import { generateBodyQueyParams } from '../util/generate-body-query-params';
import { generateVehicleQueyParams } from '../util/generate-car-query-params';
import { toStructuralInfoFromAnalysisResult } from 'stsrc/utils/requests/collection-request/collection-analyze-result/to-structural-info-adaptor';

// 文档： http://192.168.2.150:8090/pages/viewpage.action?pageId=4980860&preview=/4980860/4982095/IFaaS-3.0%E6%95%B0%E6%8D%AE%E6%9C%8D%E5%8A%A1%E8%AF%A6%E7%BB%86%E8%AE%BE%E8%AE%A1%E8%AF%B4%E6%98%8E%E4%B9%A6%20V1.1.docx
// 走数据服务的搜索接口

/**
 * 数据服务的搜索接口
 * @param {string} tableName  表名字，只支持face, image, alarm
 * @param {string} keys 要返回的属性字段，传入all表示所有
 * @param {Object} [options={}] 其他条件
 * @param {Partial<IFRequestConfig>} [requestOptions={}] 请求的选项
 * @returns {Promise<ListType<Object>>} 对应的查询结果
 */
async function query(
	tableName: string,
	keys: string,
	options: Object = {},
	requestOptions: Partial<IFRequestConfig> = {}
): Promise<ListType<Object>> {
	let url = getDataServerRequestUrl('/data/oper/query/1.0');

	let results: IFResponse<
		CommonResponseDataType<Array<Object>>
	> = await IFRequest.post(
		url,
		{
			type: tableName,
			keys: keys,
			operator: 'ifaas-web',
			operation: 'query',
			...options
		},
		requestOptions
	);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		Array<Object>
	> = ValidateTool.getValidObject(results['data'], {});

	let data: Array<Object> = ValidateTool.getValidArray(serverData['data'], []);

	// total
	let total = ValidateTool.getValidNumber(serverData['total'], 0);
	return {
		total: total,
		list: data
	};
}

export interface CaptureImageListOptions
	extends Partial<IFNewAttributesFilterInfo> {
	page: number;
	pageSize: number;

	sourceIds?: Array<string>;
	sourceType?: ESourceType;
	targetTypes?: ETargetType[]; // 任务类型
}

/**
 * 获得摄像头抓拍的小图列表信息
 * @param {string[]} sourceIds  数据源
 * @param {ETargetType} targetType  targetType
 * @param {Partial<CaptureImageListOptions>} [options={}] 其他条件
 * @param {Partial<IFRequestConfig>} [requestOptions={}] 请求的选项
 * @returns {Promise<ListType<IFOriginalImageInfo>>} 结果
 */
async function getCameraCaptureImageList(
	sourceIds: string[],
	targetType: ETargetType,
	options: Partial<CaptureImageListOptions> = {},
	requestOptions: Partial<IFRequestConfig> = {}
): Promise<ListType<IFStructuralInfo>> {
	let defaultOptions = {
		page: 1,
		pageSize: 50,
		targetTypes: ETargetType.Face
	};

	let mergetOptions = {
		...defaultOptions,
		...options
	};

	let queryObject = {};
	switch (mergetOptions.currentTargetType) {
		case ETargetType.Face:
			queryObject = generateFaceQueyParams(sourceIds, mergetOptions);
			break;

		case ETargetType.Body:
			queryObject = generateBodyQueyParams(sourceIds, mergetOptions);
			break;

		case ETargetType.Vehicle:
			queryObject = generateVehicleQueyParams(sourceIds, mergetOptions);
			break;

		default:
			break;
	}

	let tableName = '';
	switch (targetType) {
		case ETargetType.Face:
			tableName = 'face';
			break;

		case ETargetType.Body:
			tableName = 'body';
			break;

		case ETargetType.Vehicle:
			tableName = 'car';
			break;

		default:
			break;
	}

	if (!tableName) {
		return Promise.reject(new Error('错误的查询目标'));
	}
	// @ts-ignore
	let result: ListType<IBAnalysisResultInfo> = await query(
		tableName,
		'all',
		{
			pageParam: {
				pageNo: mergetOptions.page,
				pageSize: mergetOptions.pageSize
			},
			orderBy: {
				time: -1
			},
			...queryObject
		},
		requestOptions
	);

	return {
		total: result.total,
		list: filterOriginalInfosFromStructuralInfos(result.list) // 小图对应的大图信息
	};
}

function filterOriginalInfosFromStructuralInfos(
	infos: Array<IBAnalysisResultInfo>
): Array<IFStructuralInfo> {
	return infos.map((item: IBAnalysisResultInfo) => {
		return toStructuralInfoFromAnalysisResult(item);
	});
}

export const DataServerQueryRequests = {
	getCameraCaptureImageList: getCameraCaptureImageList
};
