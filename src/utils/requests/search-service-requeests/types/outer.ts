import { IFStructuralLinkInfo } from 'stsrc/type-define';
import { ESourceType, ETargetType, ListType } from 'sttypedefine';

// 搜索的数据源类型
export enum ESearchDataSourceType {
	ID = 'id', //检索人体id
	Base64 = 'data', //图片文件byte数组) base64
	Url = 'url', //图片地址
	Guid = 'guid' //关联图片属性
}

// 搜索的数据源的信息
export interface IFSearchDataSourceInfo {
	targetType: ETargetType; //图片维度，“face”或”body”
	imageType: ESearchDataSourceType;
	imageData: string; //图片文件byte数组) base64、id、url 三选一
}

// 单个数据源的数量信息(sourceType在外层)
export interface IBSearchSourceStatisticInfo {
	sourceId: string;
	count: number;
}
export interface IFSearchSourceStatisticInfo
	extends IBSearchSourceStatisticInfo {}

// 一组相同类型的搜索统计结果
export interface IBSearchStatisticInfo {
	sourceType: ESourceType;
	targetType: ETargetType;
	sourceId: string;
	count: number;
	// sourceIdCounts?: IFSearchSourceStatisticInfo[];
}
export interface IFSearchStatisticInfo extends IBSearchStatisticInfo {}

export interface IFSearchResult {
	results: ListType<IFStructuralLinkInfo>;
	staticInfos: IFSearchStatisticInfo[];
}
