import { EThumbFlag } from './../../tools/thumb-url';
import {
	IFStructuralInfo,
	IFAttributeProperty,
	ETaskType,
	toFAttributesFromBAttributes,
	ESourceType,
	DateFormat,
	getValidSourceType
} from 'sttypedefine';
import { IBAnalysisResultInfo } from './types/outer';
import { validateImageUrlField } from '../../tools';
import * as moment from 'moment';

export interface IToStructuralInfoFromAnalysisResultOptions {
	thumbFlag: EThumbFlag;
}

/**
 * 从数据分析结果转换成结构化数据
 * @export
 * @param {IBAnalysisResultInfo} item 数据分析结构
 * @param {IToStructuralInfoFromAnalysisResultOptions} options 额外选项
 * @returns {IFStructuralInfo} 结构化信息
 */
export function toStructuralInfoFromAnalysisResult(
	item: IBAnalysisResultInfo,
	options: IToStructuralInfoFromAnalysisResultOptions = {
		thumbFlag: EThumbFlag.Thumb100x100
	}
): IFStructuralInfo {
	// 兼容写法
	let rectFloat = item.targetRectFloat || item.tarageRectFloat || {};

	// 转换为前端的属性
	let attributeProperties: IFAttributeProperty[] = toFAttributesFromBAttributes(
		item
	);
	return {
		id: item.id,
		targetType: item.targetType,
		// NOTE: 不处理缩略图信息，缩略图交由具体的业务逻辑去处理
		targetImageUrl: validateImageUrlField(item.targetImage, false),

		sourceId: item.sourceId,
		sourceType: getValidSourceType(item.sourceType),
		orignialImageId: item.fromImageId,
		originalImageUrl: item.backgroundImage,

		originalImageHeight: item.bgImgHigh,
		originalImageWidth: item.bgImgWidth,
		targetRegionInOriginal: {
			left: Math.min(1, Math.max(0, rectFloat[0] || 0)),
			top: Math.min(1, Math.max(0, rectFloat[1] || 0)),
			right: Math.min(1, Math.max(0, rectFloat[2] || 1)),
			bottom: Math.min(1, Math.max(0, rectFloat[3] || 1))
		},
		threshold: 0,
		time: item.time || '',
		guid: item.guid,
		// 前端添加的属性
		// uuid: guid()
		// uuid: [图片]item.id + '_' + item.guid
		uuid: item._id ? item._id + '_analysis' : item.tid + '_tid_analysis',

		attributeProperties: attributeProperties,
		taskType:
			getValidSourceType(item.sourceType) === ESourceType.Camera
				? ETaskType.CaptureTask
				: ETaskType.AnalysisTask,
		updateTime: moment().format(DateFormat)
		// item.operator === 'ifass-engine'
		// 	? ETaskType.AnalysisTask
		// 	: item.operator === 'ifaas-collection'
		// 	? ETaskType.CaptureTask
		// 	: ETaskType.Unknown
	};
}
