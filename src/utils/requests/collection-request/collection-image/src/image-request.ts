import { IFRequestConfig } from 'ifvendors/utils/requests';
// 获取结构化信息的相关请求
import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse } from 'ifutils/requests';
import { getCollectionRequestUrl } from '../../_util';
import {
	IFStructuralInfo,
	CommonResponseDataType,
	ETargetType
} from 'sttypedefine';
import { IFDetectedStructualInfo, IFOriginalImageInfo } from './image-type';

import { DetectStructualInfoProxy } from './image-proxy';
import { IBAnalysisResultInfo } from '../../collection-analyze-result';
import { toStructuralInfoFromAnalysisResult } from '../../collection-analyze-result/to-structural-info-adaptor';
import { toDetectStructualInfo } from './_adapter';

/**
 * NOTE: 为了兼容之前的版本，在上传检测接口中的face, body等我们使用另外一个定义
 * @param file
 */
enum ETargetType_ForCompatible {
	Face = 0,
	Body = 1,
	Car = 2
}

/**
 * 上传图片检测结构化信息
 * @param {Bloe} file 图片
 * @param {Partial<IFRequestConfig>} [options={}] 请求配置
 * @returns {Promise<IFDetectedStructualInfo>} DetectStructualInfoType对象
 */
async function uploadImageAndDetect(
	file: Blob,
	options: Partial<IFRequestConfig> = {}
): Promise<IFDetectedStructualInfo> {
	let url = getCollectionRequestUrl('/collection/api/upload/image/multi/1.0');

	let formData = new FormData();
	formData.append('file', file);
	formData.append(
		'imageUploadJson',
		JSON.stringify({
			featureType: [
				ETargetType_ForCompatible.Face,
				ETargetType_ForCompatible.Body,
				ETargetType_ForCompatible.Car
			].join(',')
		})
	);
	let result: IFResponse<
		CommonResponseDataType<IFDetectedStructualInfo>
	> = await IFRequest.post(url, formData, options);

	// 获取服务器返回的结构data
	let serverData = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IBDetectedStructualInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	); // 真正的data
	return new Proxy(toDetectStructualInfo(data), DetectStructualInfoProxy);
}

/**
 * 通过图片链接去检测人脸，人体
 * @param {string} imageUrl 图片链接
 * @param {Partial<IFRequestConfig>} [options={}] 请求配置
 * @returns {IFDetectedStructualInfo} DetectStructualInfoType对象
 */
async function uploadImageAndDetectWithUrl(
	imageUrl: string,
	options: Partial<IFRequestConfig> = {}
): Promise<IFDetectedStructualInfo> {
	let url = getCollectionRequestUrl('/collection/api/upload/image/multi/1.0');

	let formData = new FormData();
	formData.append('url', imageUrl);
	formData.append(
		'imageUploadJson',
		JSON.stringify({
			featureType: [
				ETargetType_ForCompatible.Face,
				ETargetType_ForCompatible.Body,
				ETargetType_ForCompatible.Car
			].join(',')
		})
	);
	let result: IFResponse<
		CommonResponseDataType<IFDetectedStructualInfo>
	> = await IFRequest.post(url, formData, options);

	// 获取服务器返回的结构data
	let serverData = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let data: IBDetectedStructualInfo = ValidateTool.getValidObject(
		serverData['data'],
		{}
	); // 真正的data
	return new Proxy(toDetectStructualInfo(data), DetectStructualInfoProxy);
}

/**
 * 通过大图获取结构化数据信息（大图获取小图）
 * @param {string} imageId 大图id
 * @param {ETargetType[]} [targetTypes=[ETargetType.Face, ETargetType.Body]] 检索的小图类型
 * @param {Partial<IFRequestConfig>} [options={}] 请求配置
 * @returns {Promise<Array<IFStructuralInfo>>} IFStructuralInfo
 */
async function getStructuralInfoFromOriginalImageId(
	imageId: string,
	targetTypes: ETargetType[] = [ETargetType.Face, ETargetType.Body],
	options: Partial<IFRequestConfig> = {}
): Promise<Array<IFStructuralInfo>> {
	let url = getCollectionRequestUrl('/collection/api/image/search/face/1.0');

	let result: IFResponse<
		CommonResponseDataType<Array<IBAnalysisResultInfo>>
	> = await IFRequest.get(
		url,
		{
			id: imageId,
			targetType: targetTypes.join(',')
		},
		options
	);

	// @ts-ignore 获取服务器返回的结构data
	let data: CommonResponseDataType<
		Array<IBAnalysisResultInfo>
	> = ValidateTool.getValidObject(result['data'], {});
	// @ts-ignore
	let list: Array<IBAnalysisResultInfo> = ValidateTool.getValidArray(
		data['data'],
		[]
	);

	let structuralList: Array<IFStructuralInfo> = [];
	structuralList = list.map((item: IBAnalysisResultInfo) => {
		return toStructuralInfoFromAnalysisResult(item);
	});

	return structuralList;
}

/**
 * 获取关联的原始图片（大图）的信息(小图获取大图)
 * @param {string} structuralInfoId 结构化对象id
 * @param {ETargetType} [targetType=ETargetType.Face] structuralInfoId的类型
 * @param {Partial<IFRequestConfig>} [options={}] 请求配置
 * @returns {Promise<IFOriginalImageInfo>} OriginalImageType对象
 */
async function getOriginalImage(
	structuralInfoId: string,
	targetType: ETargetType = ETargetType.Face,
	options: Partial<IFRequestConfig> = {}
): Promise<IFOriginalImageInfo> {
	let url = getCollectionRequestUrl('/collection/api/image/search/1.0');

	let result: IFResponse<
		CommonResponseDataType<IFOriginalImageInfo>
	> = await IFRequest.get(
		url,
		{
			id: structuralInfoId,
			targetType: targetType
		},
		options
	);

	// @ts-ignore
	let serverData = ValidateTool.getValidObject(result['data'], {});

	// @ts-ignore
	return ValidateTool.getValidArray(serverData['data'])[0]; // NOTE: 永远只有一张
}

const CollectionResourceRequest = {
	uploadImageAndDetect: uploadImageAndDetect,
	uploadImageAndDetectWithUrl: uploadImageAndDetectWithUrl,
	getStructuralInfoFromOriginalImageId: getStructuralInfoFromOriginalImageId,
	getOriginalImage: getOriginalImage
};

export default CollectionResourceRequest;
