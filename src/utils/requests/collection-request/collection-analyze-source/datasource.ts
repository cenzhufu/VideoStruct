import { EAnalysisSourceStatus } from './analysis-source-status-type';
// 分析源相关
import { getAnalysisRequestUrl, getCollectionRequestUrl } from '../_util';

import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse, IFRequestConfig } from 'ifutils/requests';

import { CommonResponseDataType, ListType, ESourceType } from 'sttypedefine';
import {
	CreateAnalysisSourceReqPayloadType,
	IFAnalysisSourceProfileInfo,
	IFAnalysisDataSourceListReqPayload,
	IFAnalysisSourceDetailInfo,
	UpdateAnalysisSourceReqPayloadType,
	CreateAnalysisTaskPayloadType,
	IFAnalysisTaskProfileInfo,
	IBAnalysisSourceDetailInfo
} from './datasource-type';
import { AnalysisSourceProfileInfoProxyHandler } from './datasource-proxy';
import { toFSourceInfoFromB } from './to-source-info-adaptor';

/**
 * 创建分析数据源
 * @param {CreateAnalysisSourceReqPayloadType} payload 请求参数
 * @param {Partial<IFRequestConfig>} options 请求额外配置
 * @returns {Promise<IFAnalysisSourceProfileInfo>} 数据源
 */
async function createAnalysisSource(
	payload: CreateAnalysisSourceReqPayloadType,
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisSourceProfileInfo> {
	let url = getCollectionRequestUrl(
		'/collection/api/analyze/resource/insert/1.0'
	);

	let sourceUrl = '';
	let matchResult = payload.sourceUrl.match(/(?:\/\/).*?(\/.*)/);
	if (matchResult) {
		sourceUrl = matchResult[1];
	} else {
		sourceUrl = payload.sourceUrl;
	}

	let result: IFResponse<
		CommonResponseDataType<IFAnalysisSourceProfileInfo>
	> = await IFRequest.post(
		url,
		{
			...payload,
			sourceUrl: sourceUrl
		},
		options
	);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFAnalysisSourceProfileInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IFAnalysisSourceProfileInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);
	// 假装转换了一下B -> F
	return new Proxy(data, AnalysisSourceProfileInfoProxyHandler);
}

/**
 * 删除分析源
 * @param {string} sourceIds 分析员id集合，用逗号(,)分隔
 * @param {Partial<IFRequestConfig>} options 请求额外配置
 * @returns {Promise<void>} void
 */
async function deleteAnalysisSource(
	sourceIds: string,
	options: Partial<IFRequestConfig> = {}
): Promise<boolean> {
	let url = getAnalysisRequestUrl(
		'/structuring/api/analyze/resource/delete/1.0'
	);

	await IFRequest.post(
		url,
		{
			ids: sourceIds
		},
		options
	);
	let res = true;

	return res;
}

/**
 * 获得分析数据源列表
 * @param {IFAnalysisDataSourceListReqPayload} payload 请求参数
 * @param {Partial<IFRequestConfig>} options 请求额外配置
 * @returns {Promise<ListType<IFAnalysisSourceDetailInfo>>} 分析源信息
 */
async function getAnalysisSourceList(
	payload: IFAnalysisDataSourceListReqPayload,
	options: Partial<IFRequestConfig> = {}
): Promise<ListType<IFAnalysisSourceDetailInfo>> {
	let url = getAnalysisRequestUrl('/structuring/api/analyze/resource/list/1.0');

	let result: IFResponse<
		CommonResponseDataType<Array<IFAnalysisSourceDetailInfo>>
	> = await IFRequest.post(url, payload, options);
	// @ts-ignore
	let serverData: CommonResponseDataType<
		Array<IBAnalysisSourceDetailInfo>
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: Array<IBAnalysisSourceDetailInfo> = ValidateTool.getValidArray(
		serverData['data'],
		[]
	);
	// 假装转换了B->F

	let fList: IFAnalysisSourceDetailInfo[] = data.map(
		(bInfo: IBAnalysisSourceDetailInfo) => {
			return toFSourceInfoFromB(bInfo);
		}
	);
	// 对于实时视频流则再次获取一下数据流

	// 数据代理检测
	// let proxyResult: Array<IFAnalysisSourceDetailInfo> = [];
	// for (let item of fList) {
	// 	proxyResult.push(new Proxy(item, AnalysisResourceDetailProxyHandler));
	// }

	// 总数
	let total = ValidateTool.getValidNumber(serverData['total'], fList.length);

	return {
		total: total,
		list: fList
	};
}

/**
 * 获取单一的数据源信息
 * @param {string} sourceId 数据源id
 * @param {ESourceType} sourceType 数据源类型
 * @param {Partial<IFRequestConfig>} [options={}] 其他选项
 * @returns {Promise<IFAnalysisSourceDetailInfo>} 数据源信息
 */
async function getAnalysisSourceInfo(
	sourceId: string,
	sourceType: ESourceType,
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisSourceDetailInfo | null> {
	let result: ListType<
		IFAnalysisSourceDetailInfo
	> = await getAnalysisSourceList({
		sourceIds: [sourceId],
		sourceTypes: [sourceType],
		page: 1,
		pageSize: 1
	});

	if (result['list'].length > 0) {
		return result['list'][0];
	} else {
		return null;
	}
}

/**
 * 更新分析数据源
 * @param {UpdateAnalysisSourceReqPayloadType} payload 请求参数
 * @param {Partial<IFRequestConfig>} options 请求额外配置
 * @returns {Promise<IFAnalysisSourceProfileInfo>} 数据源
 */
async function updateAnalysisSource(
	payload: UpdateAnalysisSourceReqPayloadType,
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisSourceProfileInfo> {
	let url = getCollectionRequestUrl(
		'/collection/api/analyze/resource/update/1.0'
	);

	let result: IFResponse<
		CommonResponseDataType<IFAnalysisSourceProfileInfo>
	> = await IFRequest.put(url, payload, options);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		IFAnalysisSourceProfileInfo
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IFAnalysisSourceProfileInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);

	// 假装转换了B--->F

	return new Proxy(data, AnalysisSourceProfileInfoProxyHandler);
}

/**
 * 获取已接入的摄像头数据
 * @param {string} query str
 * @param {Partial<IFAnalysisDataSourceListReqPayload>} [params={}] 接口的额外参数
 * @param {Partial<IFRequestConfig>} [options={}] 请求的额外参数
 * @returns {Promise<ListType<IFAnalysisSourceDetailInfo>>} 数据列表
 */
async function getRealTimeVideoFileList(
	query: string = '',
	params: Partial<IFAnalysisDataSourceListReqPayload> = {},
	options: Partial<IFRequestConfig> = {}
): Promise<ListType<IFAnalysisSourceDetailInfo>> {
	return CollectionAnalysisSourceRequest.getAnalysisSourceList(
		{
			page: 1,
			pageSize: 500,
			query: query,
			sourceTypes: [ESourceType.Camera],
			// NOTE: 有时间的话要判断一下params格式的正确性
			...params
		},
		options
	);
}

/**
 * 获取已接入的离线视频的数据
 * @param {string} query 查询字符串
 * @param {number} page page
 * @param {number} pageSize  pageSize
 * @returns {Promise<ListType<IFAnalysisSourceDetailInfo>>} 数据
 */
async function getOfflineVideoFileList(
	query: string = '',
	page: number = 1,
	pageSize: number = 500
): Promise<ListType<IFAnalysisSourceDetailInfo>> {
	return CollectionAnalysisSourceRequest.getAnalysisSourceList({
		page: page,
		pageSize: pageSize,
		query: query,
		status: [
			EAnalysisSourceStatus.Analysising,
			EAnalysisSourceStatus.Finished,
			EAnalysisSourceStatus.RealTimeAnalysis,
			EAnalysisSourceStatus.Waiting,
			EAnalysisSourceStatus.PAUSED
		],
		sourceTypes: [ESourceType.Video]
	});
}

/**
 * 获取已接入的批量图片的数据
 * @param {string} query 查询字符串
 * @param {number} page page
 * @param {number} pageSize  pageSize
 * @returns {Promise<ListType<IFAnalysisSourceDetailInfo>>} 数据
 */
async function getBatchImageFileList(
	query: string = '',
	page: number = 1,
	pageSize: number = 500
): Promise<ListType<IFAnalysisSourceDetailInfo>> {
	return CollectionAnalysisSourceRequest.getAnalysisSourceList({
		page: page,
		pageSize: pageSize,
		query: query,
		status: [
			EAnalysisSourceStatus.Analysising,
			EAnalysisSourceStatus.Finished,
			EAnalysisSourceStatus.RealTimeAnalysis,
			EAnalysisSourceStatus.Waiting,
			EAnalysisSourceStatus.PAUSED
		],
		sourceTypes: [ESourceType.Zip]
	});
}

/**
 *   c创建人物解析通道
 * @param {CreateAnalysisTaskPayloadType} payload  参数
 * @param {Partial<IFRequestConfig>} [options={}] 取消
 * @returns {Promise<IFAnalysisTaskProfileInfo>} 结果
 */
async function createAnalysissTask(
	payload: CreateAnalysisTaskPayloadType,
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisTaskProfileInfo> {
	let url = getCollectionRequestUrl('/collection/api/analyze/task/create/1.0');

	let result: IFResponse<
		CommonResponseDataType<IFAnalysisTaskProfileInfo>
	> = await IFRequest.post(url, payload, options);

	// @ts-ignore
	const serverData: CommonResponseDataType<
		IFAnalysisTaskProfileInfo
	> = ValidateTool.getValidObject(result['data'], {});

	return ValidateTool.getValidObject(
		serverData['data']
	) as IFAnalysisTaskProfileInfo;
}

const CollectionAnalysisSourceRequest = {
	createAnalysisSource: createAnalysisSource,
	deleteAnalysisSource: deleteAnalysisSource,
	getAnalysisSourceList: getAnalysisSourceList,
	getSingleAnalysisSourceInfo: getAnalysisSourceInfo,
	updateAnalysisSource: updateAnalysisSource,
	getOfflineVideoFileList: getOfflineVideoFileList,
	getRealTimeVideoFileList: getRealTimeVideoFileList,
	getBatchImageFileList: getBatchImageFileList,
	createAnalysissTask
};

export default CollectionAnalysisSourceRequest;
