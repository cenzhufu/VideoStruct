import { ETaskType } from './task-type';
import { ESourceType } from './source-type';
import { ETargetType } from './target-type';
import { IFAttributeProperty } from './attributes/attribute-type';
import { DateFormat } from './basic-datatype';
import { guid } from 'ifvendors/utils/guid';

// 统一的结构化数据定义

// 结构化的信息对象
export interface IFStructuralInfo {
	id: string; // 图片id
	targetImageUrl: string; //图片地址
	targetType: ETargetType; // 结构化类型
	targetRegionInOriginal?: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	}; // 小图片位于大图片的位置, 四个值[0,1], 采集直接返回了，而检索没有

	// 大图信息
	originalImageUrl: string; // 大图链接
	orignialImageId: string; // 大图id
	originalImageHeight?: number; // 大图高度(检索没有返回，采集返回了)
	originalImageWidth?: number; // 大图宽度（检索没有返回，采集返回了）

	// 数据源信息
	sourceId: string; // 数据源id
	sourceType: ESourceType; // 数据源类型

	// 其他属性
	time: typeof DateFormat; // 抓拍时间
	threshold: number; // 相似度(只有在检索时才会有的值，数据分析没有，默认设置为0)
	guid: string; // 属性关联的id

	/** 前端添加 */
	uuid: string; // 用来充当统一的key值

	// #region v2添加的属性
	attributeProperties: IFAttributeProperty[]; // 属性
	taskType: ETaskType; // 结果的任务类型，如是通过采集获得，或者是分析获得的

	// 前端添加
	updateTime: typeof DateFormat;
	// #endregion
}

/**
 * 生成一个无效的结果化对象
 * @export
 * @param {string} url 小图地址
 * @returns {IFStructuralInfo} 结果化对象
 */
export function generateUnvalidStructuralInfo(url: string): IFStructuralInfo {
	return {
		id: guid() + '_front_unvalid',
		targetImageUrl: url,
		targetType: ETargetType.Unknown,
		targetRegionInOriginal: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		originalImageUrl: 'void',
		orignialImageId: guid() + '_front_unvalid',
		originalImageHeight: 1,
		originalImageWidth: 1,

		sourceId: guid() + '_front_unvalid',
		sourceType: ESourceType.Unknown,

		time: '1999-01-01 00:00:00',
		threshold: 0,
		guid: guid(),

		uuid: guid(),
		attributeProperties: [],
		taskType: ETaskType.Unknown,
		updateTime: '1999-01-01 00:00:00'
	};
}
