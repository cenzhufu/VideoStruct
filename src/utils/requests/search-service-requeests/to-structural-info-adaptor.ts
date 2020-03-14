import {
	DateFormat,
	ESourceType,
	getValidSourceType,
	getValidTargetType
} from 'stsrc/type-define';
import { validateImageUrlField } from 'stsrc/utils/requests/tools';
import NumberTools from 'ifutils/number';
import {
	IFStructuralInfo,
	IFAttributeProperty,
	ETaskType,
	toFAttributesFromBAttributes
} from 'sttypedefine';
import { NoLinkSearchResultDataType } from 'stsrc/utils/requests/search-service-requeests/types/_innter';
import * as moment from 'moment';

/**
 * 从无关联搜索结果类型转换成结构化类型
 * @param {NoLinkSearchResultDataType} item 无关联搜索结果类型
 * @returns {IFStructuralInfo} 结构化数据
 */
export function toStructuralInfoFromNoLinkResultType(
	item: NoLinkSearchResultDataType
): IFStructuralInfo {
	let attributeProperties: IFAttributeProperty[] = toFAttributesFromBAttributes(
		item.attribute
	);

	let obj: IFStructuralInfo = {
		id: String(item.id),
		targetType: getValidTargetType(item.targetType),
		// NOTE: 不处理缩略图信息，缩略图交由业务逻辑去处理
		targetImageUrl: validateImageUrlField(item.file, false),
		time: item.time,
		threshold: item.score ? NumberTools.trimNumberToFixed(item.score * 100) : 0,
		orignialImageId: item.attribute.fromImageId,
		originalImageUrl: item.attribute.backgroundImage,
		sourceId: item.attribute.sourceId,
		sourceType: getValidSourceType(item.attribute.sourceType),

		guid: item.guid,
		// 前端添加的属性
		// uuid: guid()
		// uuid: item.guid + '_' + item.id
		uuid: String(item.id) + '_search', // NOTE: 检索服务的id已经确保了唯一

		attributeProperties: attributeProperties,
		taskType:
			getValidSourceType(item.attribute.sourceType) === ESourceType.Camera
				? ETaskType.CaptureTask
				: ETaskType.AnalysisTask,
		updateTime: moment().format(DateFormat)
		// item.attribute.operator === 'ifass-engine'
		// 	? ETaskType.AnalysisTask
		// 	: item.attribute.operator === 'ifaas-collection'
		// 	? ETaskType.CaptureTask
		// 	: ETaskType.Unknown
	};

	return obj;
}
