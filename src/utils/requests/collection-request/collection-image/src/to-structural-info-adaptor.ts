import {
	IFStructuralInfo,
	getValidTargetType,
	toFAttributesFromBAttributes,
	ESourceType,
	ETaskType,
	IFAttributeProperty,
	DateFormat
} from 'stsrc/type-define';
import { IBDetectedResultStructualInfo } from './image-type';
import { IToStructuralInfoFromAnalysisResultOptions } from '../../collection-analyze-result/to-structural-info-adaptor';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import { guid } from 'ifvendors/utils/guid';
import * as moment from 'moment';

/**
 * 从上传检测的结果中转换为structuralInfo
 * @export
 * @param {IBDetectedResultStructualInfo} bInfo 检测结果
 * @param {IToStructuralInfoFromAnalysisResultOptions} [options={
 * 		thumbFlag: EThumbFlag.Thumb100x100
 * 	}] 额外选项
 * @returns {IFStructuralInfo} structuralInfo
 */
export function toStructuralInfoFromDetectedInfo(
	bInfo: IBDetectedResultStructualInfo,
	options: IToStructuralInfoFromAnalysisResultOptions = {
		thumbFlag: EThumbFlag.Thumb100x100
	}
): IFStructuralInfo {
	let attributeProperties: IFAttributeProperty[] = toFAttributesFromBAttributes(
		bInfo
	);

	// 兼容写法
	let rectFloat = bInfo.targetRectFloat || bInfo.tarageRectFloat || {};
	return {
		id: bInfo.id,
		targetType: getValidTargetType(bInfo.targetType),
		time: bInfo.time,
		threshold: 0,
		orignialImageId: bInfo.fromImageId,
		originalImageUrl: bInfo.backgroundImage,

		targetImageUrl: bInfo.targetImage,

		sourceId: '',
		sourceType: ESourceType.Unknown,

		guid: bInfo.guid,

		targetRegionInOriginal: {
			left: Math.min(1, Math.max(0, rectFloat[0] || 0)),
			top: Math.min(1, Math.max(0, rectFloat[1] || 0)),
			right: Math.min(1, Math.max(0, rectFloat[2] || 1)),
			bottom: Math.min(1, Math.max(0, rectFloat[3] || 1))
		},

		uuid: guid() + '_detected',
		attributeProperties: attributeProperties,
		taskType: ETaskType.Unknown,
		updateTime: moment().format(DateFormat)
	};
}
