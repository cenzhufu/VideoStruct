import { ETargetType, DateFormat, IFStructuralInfo } from 'sttypedefine';
import {
	ESourceType,
	ETaskType,
	IBSupportedAttributes
} from 'stsrc/type-define';

// 特征信息
export interface FeatureInfo {
	// 位于图片的位置
	rect: string; // JSON.stringify({bottom: number, left: number; right: number; top: number})
}

export interface IBDetectedResultStructualInfo
	extends Partial<IBSupportedAttributes> {
	id: string;
	guid: string;
	targetType: ETargetType;
	targetImage: string;
	fromImageId: string;
	backgroundImage: string;
	time: typeof DateFormat;
	tarageRectFloat: Array<number>; // 小图片位于大图片的位置, 四个值[0,1] NOTE: deprecated
	targetRectFloat: Array<number>; // 小图片位于大图片的位置, 四个值[0,1] NOTE: 新版
}

// 检测后的结构化数据类型(后台返回的结构，前端也使用)

interface InnerIBDetectedStructuralInfo {
	id: string; // 大图id
	time: string; // YYYY-MM-DD HH:mm:ss, 上传时间
	uri: string; // 大图地址
	faces: number;
	faceList: Array<FeatureInfo>;
	bodys: number;
	bodyList: Array<FeatureInfo>;
	cars: number;
	carList: Array<FeatureInfo>;
}

export interface IBDetectedStructualInfo extends InnerIBDetectedStructuralInfo {
	result: Array<IBDetectedResultStructualInfo>;
}
export interface IFDetectedStructualInfo extends InnerIBDetectedStructuralInfo {
	result: Array<IFStructuralInfo>;
}

// 跟小图有关的大图信息(小图获取大图)
export interface IBOriginalImageInfo {
	id: string;
	time: string; // 抓拍时间
	url: string; // 图片地址
	json: string; //
	faces: number; // 人脸数量

	timeStamp: number; // 对于视频来说,是时间(s), 实时视频是时间戳(单位s)

	// 二期新增字段
	sourceType: ESourceType;
	sourceId: string;
}
export interface IFOriginalImageInfo extends IBOriginalImageInfo {
	taskType: ETaskType;
}
