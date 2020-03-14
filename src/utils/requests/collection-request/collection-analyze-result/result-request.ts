import { ListType, IFStructuralLinkInfo, ETargetType } from 'stsrc/type-define';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { TaskResultPayload } from './types/_innter';
import {
	IFAnalysisResourceResPayload,
	IBAnalysisResultLinkInfo
} from './types/outer';

import { CommonResponseDataType, EConfidenceValue, EMerge } from 'sttypedefine';
import { getCollectionRequestUrl } from '../_util';
import IFRequest, { IFRequestConfig, IFResponse } from 'ifutils/requests';

// import { AnalysisResultInfoProxy } from './result-proxy';
import { convertToRequestPayload } from './_query-util';
import { toStructuralLinkInfoFromBLinkInfo } from './to-structural-link-info-adaptor';

export interface AnalysisResultRequestOption {
	startDate: string; //开始时间(YYYY-MM-DD HH:mm: ss)， 没选时为""
	endDate: string; //结束时间(YYYY-MM-DD HH: mm: ss), 没选时为""

	attributeAccuracy: EConfidenceValue; //属性精确度， 默认ECondidence.Low, 一定存在
	threshold: number; // 相似度, 没有这个元素的时候返回默认的值（非空）

	targetTypes?: ETargetType[]; // 任务类型
	mergeType?: EMerge; // 交并集

	page?: number;
	pageSize?: number;
}

// async function getAnalysisResultSpecial(
// 	sourceRange: Array<IFUniqueDataSource>,
// 	selectedAttributes: Array<IFAttributeProperty>,
// 	options: Partial<AnalysisResultRequestOption>,
// 	requestOptions: Partial<IFRequestConfig> = {}
// ): Promise<ListType<IFStructuralLinkInfo>> {
// 	let defaultOptions: AnalysisResultRequestOption = {
// 		startDate: '',
// 		endDate: '',
// 		attributeAccuracy: EConfidenceValue.Low,
// 		threshold: 0.92,
// 		targetTypes: [],
// 		mergeType: EMerge.Union,
// 		page: 1,
// 		pageSize: 200
// 	};
// 	let realOptions: AnalysisResultRequestOption = {
// 		...defaultOptions,
// 		...options
// 	};

// 	return getAnalysisResult(
// 		{
// 			...realOptions,
// 			sources: sourceRange,
// 			selectedAttributes: selectedAttributes
// 		},
// 		requestOptions
// 	);
// }

/**
 * 获取分析结果
 * NOTE: 为了性能，这个结构返回的tatal为0.如果需要判断是否有更多，则通过返回的list.length跟pageSize的大小关系来判断
 * @param {*} payload 请求参数
 * @param {Partial<IFRequestConfig>} [options={}] 额外选项
 * @returns {Promise<Array<IFStructuralLinkInfo>>} 结果列表
 */
async function getAnalysisResult(
	payload: IFAnalysisResourceResPayload,
	options: Partial<IFRequestConfig> = {}
): Promise<ListType<IFStructuralLinkInfo>> {
	let url = getCollectionRequestUrl(
		'/collection/api/analyze/resource/result/list/1.0'
	);

	let realPayload: TaskResultPayload | null = convertToRequestPayload(payload);
	if (!realPayload) {
		return Promise.reject(new Error('错误的参数长度'));
	}

	let result: IFResponse<
		CommonResponseDataType<Array<IBAnalysisResultLinkInfo>>
	> = await IFRequest.post(url, { ...realPayload, needTotal: false }, options);

	// @ts-ignore
	let serverData: CommonResponseDataType<
		Array<IBAnalysisResultLinkInfo>
	> = ValidateTool.getValidObject(result['data'], {});

	// @ts-ignore
	let list: Array<IBAnalysisResultLinkInfo> = ValidateTool.getValidArray(
		serverData['data'],
		[]
	);

	// 数据转换
	let structuralInfoList: Array<IFStructuralLinkInfo> = list
		.filter((item: IBAnalysisResultLinkInfo) => {
			return item != null;
		})
		.map((item: IBAnalysisResultLinkInfo) => {
			let result: IFStructuralLinkInfo = toStructuralLinkInfoFromBLinkInfo(
				item
			);

			return result;
		});

	let total = ValidateTool.getValidNumber(serverData['total'], 0);
	let listResult: ListType<IFStructuralLinkInfo> = {
		total: total,
		list: structuralInfoList
	};
	return listResult;
}

/**
 * 获取分析的小图对应的大图结果
 * @param {IFAnalysisResourceResPayload} payload 请求荷载
 * @param {Partial<IFRequestConfig>} [options={}] 请求options
 * @returns {ListType<IFOriginalImageInfo>} 大图列表信息
 */
async function getAnalysisResultOfOriginalInfos(
	payload: IFAnalysisResourceResPayload,
	options: Partial<IFRequestConfig> = {}
): Promise<ListType<IFStructuralLinkInfo>> {
	let result = await getAnalysisResult(payload, options);

	return result;
}

export const CollectionAnalysisResultRequest = {
	getAnalysisResult: getAnalysisResult,
	getAnalysisResultOfOriginalInfos: getAnalysisResultOfOriginalInfos
};
