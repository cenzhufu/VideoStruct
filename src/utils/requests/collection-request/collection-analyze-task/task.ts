import { EAnalysisSourceStatus } from 'stutils/requests/collection-request';
import { getCollectionRequestUrl } from '../_util';

import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse, IFRequestConfig } from 'ifutils/requests';

import {
	CraeteAnalysisTaskReqPayloadType,
	IFAnalysisTaskInfo,
	IFAnalysisTaskProgressInfo,
	IBAnalysisTaskInfo
} from './task-type';
import { CommonResponseDataType, ETargetType, ETaskType } from 'sttypedefine';
import { toFTaskInfoFromBTask } from './to-task-info-adaptor';
// import { AnalysisTaskInfoProxyHandler } from './task-proxy';

/************************** 任务相关 ***********************/

/**
 * 创建分析任务
 * @param {CraeteAnalysisTaskReqPayloadType} payload 请求参数
 * @param {Partial<IFRequestConfig>} options 请求额外的配置
 * @returns {Promise<void>} void
 */
async function createAnalysisTask(
	payload: CraeteAnalysisTaskReqPayloadType,
	options: Partial<IFRequestConfig> = {}
): Promise<void> {
	let url = getCollectionRequestUrl('/collection/api/analyze/task/insert/1.0');

	await IFRequest.post(url, payload, options);

	return;
}

/**
 * 获取任务详情
 * @param {string} taskId 任务id
 * @param {Partial<IFRequestConfig>} options 请求的额外选项
 * @returns {Promise<IFAnalysisTaskInfo>} 任务详情
 */
async function getAnalysisTask(
	taskId: string,
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisTaskInfo> {
	let url = getCollectionRequestUrl(
		`/collection/api/analyze/task/id/${taskId}/1.0`
	);

	let result: IFResponse<
		CommonResponseDataType<IBAnalysisTaskInfo>
	> = await IFRequest.get(url, undefined, options);

	// @ts-ignore
	let serverData = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IBAnalysisTaskInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	);
	// 返回代理
	return toFTaskInfoFromBTask(data);
	// return new Proxy(data, AnalysisTaskInfoProxyHandler);
}

// #region 二期增加

interface ConfigType {
	'feign.hystrix.enabled': string; // 'true'
	'target.type': string; // 'face,body'
	'engine.processing.power': string; // 引擎总数
	'rest.engine.processing.power': string; // 文件引擎数量
}

/**
 * 获得支持的解析类型
 * @returns {Promise<Array<ETargetType>>} 解析类型
 */
async function getSupportedAnalysisTasks(): Promise<Array<ETargetType>> {
	// TODO: Faker
	let url = getCollectionRequestUrl(`/collection/api/common/apollo/1.0`);
	let result: IFResponse<
		CommonResponseDataType<ConfigType>
	> = await IFRequest.post(url, {});

	// @ts-ignore
	let serveData: CommonResponseDataType<
		ConfigType
	> = ValidateTool.getValidObject(result['data']);

	// @ts-ignore
	let data: ConfigType = ValidateTool.getValidObject(serveData['data']);

	let targetType: Array<string> = ValidateTool.getValidString(
		data['target.use.type']
	).split(',');

	// 转换成targetType
	let targetTypes: ETargetType[] = [];
	for (let type of targetType) {
		switch (type) {
			case ETargetType.Face:
				targetTypes.push(ETargetType.Face);
				break;

			case ETargetType.Body:
				targetTypes.push(ETargetType.Body);
				break;

			case ETargetType.Vehicle:
				targetTypes.push(ETargetType.Vehicle);
				break;

			default:
				break;
		}
	}
	return targetTypes;

	// return new Promise((resolve) => {
	// 	resolve([ETargetType.Face, ETargetType.Body, ETargetType.Vehicle]);
	// });
}

export interface IFEngineConfig {
	engineTotalNumber: number; // 引擎总数
	engineForFileNumber: number; // 文件引擎的数量
}

/**
 * 获取引擎配置
 * @returns {Promise<IFEngineConfig>} 引擎配置
 */
async function getEngineConfig(): Promise<IFEngineConfig> {
	let url = getCollectionRequestUrl(`/collection/api/common/apollo/1.0`);
	let result: IFResponse<
		CommonResponseDataType<ConfigType>
	> = await IFRequest.post(url, {});

	// @ts-ignore
	let serveData: CommonResponseDataType<
		ConfigType
	> = ValidateTool.getValidObject(result['data']);

	// @ts-ignore
	let data: ConfigType = ValidateTool.getValidObject(serveData['data']);

	// 引擎总数
	let engineTotal: number = 0;
	engineTotal = Math.max(
		0,
		ValidateTool.getValidNumber(
			Number.parseInt(data['engine.processing.power'], 10)
		)
	);

	// 文件引擎总数
	let fileEngineTotal: number = 0;
	fileEngineTotal = Math.max(
		0,
		ValidateTool.getValidNumber(
			Number.parseInt(data['rest.engine.processing.power'], 10)
		)
	);

	return {
		engineTotalNumber: engineTotal,
		engineForFileNumber: fileEngineTotal
	};
}

/**
 * 开始任务
 * @param {string} taskId 任务id
 * @returns {Promise<void>} void
 */
async function startAnalysisTask(taskId: string): Promise<void> {
	let url = getCollectionRequestUrl(`/collection/api/analyze/task/restart/1.0`);

	await IFRequest.post(url, {
		id: taskId
	});

	return;
}

async function queryAllTaskInfo(
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisTaskProgressInfo[]> {
	let url = getCollectionRequestUrl(`/collection/api/analyze/task/query/1.0`);

	let result: IFResponse<
		CommonResponseDataType<IFAnalysisTaskProgressInfo[]>
	> = await IFRequest.post(
		url,
		{
			statusList: [
				EAnalysisSourceStatus.RealTimeAnalysis,
				EAnalysisSourceStatus.STREAM
			]
		},
		options
	);

	// @ts-ignore
	let commomServerData: CommonResponseDataType<
		IFAnalysisTaskProgressInfo[]
	> = ValidateTool.getValidObject(result['data'], {});
	let serverData: IFAnalysisTaskProgressInfo[] = ValidateTool.getValidArray(
		commomServerData['data']
	);

	return serverData;
}

/**
 * 查询任务进度（新接口）
 * @param {ETaskType} taskType 任务类型
 * @param {string} sourceId 数据源id
 * @param {Partial<IFRequestConfig>} [options={}] 请求
 * @returns {Promise<IFAnalysisTaskProgressInfo>} 结果
 */
async function queryTaskProgressInfo(
	taskType: ETaskType,
	sourceId: string,
	options: Partial<IFRequestConfig> = {}
): Promise<IFAnalysisTaskProgressInfo> {
	let url = getCollectionRequestUrl(
		`/collection/api/analyze/task/process/query/1.0`
	);

	let result: IFResponse<
		CommonResponseDataType<IFAnalysisTaskProgressInfo[]>
	> = await IFRequest.post(
		url,
		{
			taskType: taskType,
			sourceId: sourceId
		},
		options
	);

	// @ts-ignore
	let commomServerData: CommonResponseDataType<
		IFAnalysisTaskProgressInfo[]
	> = ValidateTool.getValidObject(result['data'], {});
	let serverData: IFAnalysisTaskProgressInfo[] = ValidateTool.getValidArray(
		commomServerData['data']
	);

	if (serverData.length) {
		return serverData[0] as IFAnalysisTaskProgressInfo;
	} else {
		return Promise.reject(new Error('查询失败'));
	}
}

// #endregion

const CollectionTaskRequest = {
	createAnalysisTask: createAnalysisTask,
	getAnalysisTask: getAnalysisTask,
	getSupportedAnalysisTasks: getSupportedAnalysisTasks,
	startAnalysisTask: startAnalysisTask,
	queryTaskProgressInfo,
	getEngineConfig,
	queryAllTaskInfo
};

export default CollectionTaskRequest;
