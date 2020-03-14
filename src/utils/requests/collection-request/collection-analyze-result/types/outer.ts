import { IFNewAttributesFilterInfo } from 'stcomponents/attribute-filter-panel';
import {
	ESourceType,
	ETargetType,
	ETaskType,
	EMerge,
	IBSupportedAttributes
} from 'sttypedefine';

import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';

// 数据分析任务结果的请求类型
export interface IFAnalysisResourceResPayload
	extends Partial<IFNewAttributesFilterInfo> {
	sources: Array<IFUniqueDataSource>; // 数据源
	targetTypes?: ETargetType[]; // 任务类型
	mergeType?: EMerge; // 交并集

	page?: number;
	pageSize?: number;
}

/**
 * 后台分析结果返回的结构对象
 * @export
 * @interface IBAnalysisResultInfo
 */
export interface IBAnalysisResultInfo extends Partial<IBSupportedAttributes> {
	_id: string; // 数据库id
	tid: string; // 引擎id(当作唯一的id使用)

	id: string; // id
	targetImage: string; // 图片地址
	sourceType: ESourceType;
	sourceId: string; // 分析源id
	targetType: ETargetType;
	fromImageId: string; // 大图id
	backgroundImage: string; // 大图链接
	json: string;
	taskType: ETaskType;
	time: string;

	guid: string; // 关联的id

	//
	tarageRectFloat: Array<number>; // 小图片位于大图片的位置, 四个值[0,1] NOTE: deprecated
	targetRectFloat: Array<number>; // 小图片位于大图片的位置, 四个值[0,1] NOTE: 新版
	bgImgHigh: number; // 大图高度
	bgImgWidth: number; // 大图宽度

	// 二期需要的字段
	operator: 'ifass-engine' | 'ifaas-collection'; // 分析任务或者采集任务
}

export interface IBAnalysisResultLinkInfo {
	// 二期修改为数组
	faces: IBAnalysisResultInfo[];
	bodies: IBAnalysisResultInfo[];
	cars: IBAnalysisResultInfo[];
}
