import {
	ECarTypeValue,
	ECarColorValue,
	ECarLicenseColorValue
} from './../../../../type-define/types/attributes/attribute-type';
import { IFSearchDataSourceInfo, IFSearchStatisticInfo } from './outer';
import {
	EColorValue,
	ERaceValue,
	EGenderValue,
	EHatValue,
	EGlassesValue,
	EFaceMaskValue,
	EClothesValue,
	ETextureValue,
	ETrousersValue,
	EOverCoatValue,
	ESortKey,
	ESortType,
	ETargetType,
	ESourceType,
	EBaggageValue,
	EMerge,
	DateFormat,
	IBSupportedAttributes
} from 'sttypedefine';

// 内部使用的类型
// TODO: 跟新版检索页定义的重复
interface StructSearchType {
	sourceId: string; //抓拍源id, 逗号分隔
	sourceType: string; // 数据源， 逗号分隔
}

//人脸搜索入参属性
export interface FaceFilterType extends StructSearchType {
	// imgQuality?: EImageQuality; //ok：正常图片 poseFilter：角度过滤 bigSizeFilter：大尺寸过滤 	 minSizeFilter：小尺寸过滤 blurFilter：模糊过滤
	age: string; // ''表示所有， [a, b]表示在年龄a,b范围里边， [a, *]表示大于a
	race: ERaceValue; //种族han：汉族 other：其他 unknown：未知，比如系统不支持
	gender: EGenderValue; //性别male：男性 female：女性
	hat: EHatValue; //帽子yes：戴帽子no：没有戴帽子unknown：未知，比如系统不支持
	glasses: EGlassesValue; //眼镜no：没有戴眼镜glasses：带普通眼镜sunglass：带墨镜
	mask: EFaceMaskValue; //面罩yes：戴口罩no：没有戴口罩unknown：未知，比如系统不支持
}

//人体搜索入参属性
export interface BodyFilterType extends StructSearchType {
	coatColor: EColorValue; //{“black”:0.1,//黑色”blue”: 0.2,//蓝色”green”: 0.3,//绿色”red”: 0.4,//红色”white”: 0.5,//白色”yellow”: 0.5,//黄色”gray”: 0.8,//灰色”orange”: 0.9,//橙色”purple”: 0.7}//紫色
	pantsColor: EColorValue;
	// bodyAngle: string; //人体角度front：正面side：侧面back：背后
	// bodyAgeStage: string; //年龄阶段 child：少年adult：成年senior：老年
	coatStyle: EClothesValue;
	coatPattern: ETextureValue;
	pantsStyle: ETrousersValue;
	pantsPattern: ETextureValue;
	hasCoat: EOverCoatValue;
	// bodyGender: EGenderValue;
	// handbag: { [type in EBaggageType]?: EBaggageValue };
	handbag: EBaggageValue;
	singlebag: EBaggageValue;
	backbag: EBaggageValue;
	drawbox: EBaggageValue;
	cart: EBaggageValue;
}

export interface VehicleFilterType extends StructSearchType {
	type: ECarTypeValue;
	color: ECarColorValue;
	brandCode: string; // code
	plateNumber: string; //
	plateColor: ECarLicenseColorValue;
}

export interface FilterMapType {
	targetType: ETargetType;
	attribute: FaceFilterType | BodyFilterType | VehicleFilterType;
}
// 检索请求的参数
export interface IBSearchParamsType {
	image: IFSearchDataSourceInfo[]; // 搜索源
	filterMap: FilterMapType[]; // 搜索条件
	type?: string; //检索库类型 (0 : 抓拍人脸库1:居住人员库 2: 静态人员库)
	threshold: number; // 相似度
	startTime: typeof DateFormat | null; //数据开始时间(yyyy-MM-dd HH:mm:ss)
	endTime: typeof DateFormat | null; //数据结束时间(yyyy-MM-dd HH:mm:ss)
	sort: ESortKey; //数据排序字段（暂时支持time，score）
	sortType: ESortType; //排序方式：asc, desc
	page: number; // 分页
	pageSize: number; // 分页
	mergeType: EMerge; // 结果合并控制
	targets: ETargetType[]; // 结果显示的类型
}

// interface FilterMapType extends FaceFilterType, BodyFilterType {}

interface IBSearchAttribute extends Partial<IBSupportedAttributes> {
	fromImageId: string;
	backgroundImage: string;
	sourceType: ESourceType;
	sourceId: string;
}
export interface NoLinkSearchResultDataType {
	id: number;
	file: string;
	guid: string;
	time: string;
	dimension?: string;
	targetType: ETargetType;
	score: number;
	attribute: IBSearchAttribute;
}

export interface IBLinkSearchResultDataType {
	face?: NoLinkSearchResultDataType;
	body?: NoLinkSearchResultDataType;
	car?: NoLinkSearchResultDataType;

	faces?: NoLinkSearchResultDataType[];
	bodies?: NoLinkSearchResultDataType[];
	cars?: NoLinkSearchResultDataType[];
}

export interface IBSearchResult {
	resultCount: number;
	resultTotal: number;
	resultTime: number;
	results: Array<IBLinkSearchResultDataType>; // 查询结果
	sourceCount: IFSearchStatisticInfo[]; // 数据源统计信息
}
