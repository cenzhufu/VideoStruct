import { EMerge } from './../../../type-define/types/basic-datatype';
import {
	EConfidenceValue,
	IFAttributeProperty,
	ETargetType
} from 'sttypedefine';

// 前端页面使用的结构
// 属性过滤组件的输出类型
export interface IFNewAttributesFilterInfo {
	startDate: string; //开始时间(YYYY-MM-DD HH:mm: ss)， 没选时为""
	endDate: string; //结束时间(YYYY-MM-DD HH: mm: ss), 没选时为""

	attributeAccuracy: EConfidenceValue; //属性精确度， 默认ECondidence.Low, 一定存在
	// threshold: number; // @deprecated 相似度, 没有这个元素的时候返回默认的值（非空）

	selectedAttributes: Array<IFAttributeProperty>;

	// 二期添加
	faceThreshold: number; // 人脸相似度
	bodyThreshold: number; // 人体相似度

	// 是否精确匹配
	faceResultMergeType: EMerge;
	bodyesultMergeType: EMerge;

	showBodyRelatedWithFace: boolean; // 是否显示人脸关联的人体信息
	showFaceRelatedWithBody: boolean; // 是否显示人体关联的人脸信息
	showVehicleRelatedWithFace: boolean; // 是否先是人脸关联的车辆信息

	currentTargetType: ETargetType;
}
