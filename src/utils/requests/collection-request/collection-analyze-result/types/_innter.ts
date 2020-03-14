import { EMerge, ESortType } from 'sttypedefine';

/*************************查询分析结果操作的封装 ****************************/
// 操作符
export enum Operator {
	EqualTo = 'EQ', // 等于
	GreatThan = 'GT', // 大于
	GreatEqualThan = 'GTE', // 大于等于
	LessThan = 'LT', // 小于
	LessEqualThan = 'LTE', // 小于等于
	NotEqual = 'NEQ', // 不等于
	InRange = 'IN', // 在范围内
	LIKE = 'LIKE'
}

// 有效的field字段(用于采集结果的请求条件的key映射， 后边的是请求需要的字段)
// eslint-disable-next-line
export const ValidFieldKeyForCollectionResult = {
	ImageQuality: 'imgQuality', // 图片质量 EImageQuality
	// 数据源
	SourceType: 'sourceType', // 资源类型 ESourceType
	SourceId: 'sourceId', // 资源id string
	// 任务类型
	TargetType: 'targetType', // 分析类型 ETargetType
	// 时间
	TimeRange: 'time', // 时间 yyyy-MM-dd HH:mm:ss

	DBInsertTimeRange: 'db_insert_time', // 数据库插入时间 yyyy-MM-dd HH:mm:ss

	// 分页
	Page: 'pageNo', // number
	PageSize: 'pageSize', // number

	Threshold: 'threshold', // 相似度 number  // 分析任务没有这个属性
	// 人脸属性
	Gender: 'gender', // 性别 EGenderValue checked
	Age: 'age', // 年龄  EAgeValue  checked
	Nation: 'race', // 民族 ERaceValue checked
	Hat: 'hat', // 帽子  EHatValue checked
	Glasses: 'glasses', // 眼镜 EGlassesValue checked
	FaceMask: 'mask', // 口罩 EFaceMaskValue  checked
	AgeConfidence: 'ageConfidence', // 属性精度 EConfidenceValue checked
	GenderConfidence: 'genderConfidence', // 属性精度 EConfidenceValue checked
	GlassesConfidence: 'glassesConfidence', // 属性精度 EConfidenceValue  checked
	RaceConfidence: 'raceConfidence', // 属性精度 EConfidenceValue checked
	HatConfidence: 'hatConfidence', // 属性精度 EConfidenceValue  checked
	MaskConfidence: 'maskConfidence', // 属性精度 EConfidenceValue  checked
	// 人体属性
	Clothes: 'coatStyle', // 短袖  EClothesValue  checked
	ClothesTexture: 'coatPattern', // 花纹 ETextureValue  checked
	ClothesColor: 'coatColor', // 颜色 EColorValue checked
	Trousers: 'pantsStyle', // 长裤 ETrousersValue
	TrousersColor: 'pantsColor', // 颜色 EColorValue checked
	TrousersTexture: 'pantsPattern', // 裤子纹理 EColorValue checked
	OverCoat: 'hasCoat', // 大衣 EOverCoatValue
	ClothesColorConfidence: 'coatColorConfidence', // 衣服置信度
	TrousersColorConfidence: 'pantsColorConfidence', // 裤子置信度
	ClothesConfidence: 'coatStyleConfidence', // 上衣置信度
	ClothesTextureConfidence: 'coatPatternConfidence', // 上衣纹理置信度
	TrousersConfidence: 'pantsStyleConfidence', // 下衣置信度
	TrousersTextureConfidence: 'pantsPatternConfidence', // 下衣纹理置信度
	OvercoatConfidence: 'hasCoatConfidence', // 大衣置信度

	HandBag: 'handbag', // 手提包
	HandBagConfidence: 'handbagConfidence',
	SingleShouldBag: 'singlebag', // 单肩包
	SingleShouldBagConfidence: 'singlebagConfidence',
	Backbag: 'backbag', // 背包
	BackbagConfidence: 'backbagConfidence',
	Drawbox: 'drawbox', //拉杆箱
	DrawboxConfidence: 'drawboxConfidence', //拉杆箱
	Cart: 'cart',
	CartConfidence: 'cartConfidence', // 推车

	// 车辆属性
	CarType: 'type', // 车辆类型
	CarTypeConfidence: 'typeConfidence',

	CarColor: 'color', // 车辆颜色
	CarColorConfidence: 'colorConfidence', //

	CarBrandCode: 'brandCode', // 车辆品牌
	CarBrandCodeConfidence: 'brandConfidence',

	CarCall: 'call', // 是否有打电话
	CarCallConfidence: 'callConfidence',

	CarMainDriverBelted: 'mainDriverBelt', // 主驾驶是否系安全带
	CarMainDriverBeltedConfidence: 'mainDriverBeltConfidence',

	CarCoDriverBelted: 'coDriverBelt', // 副驾驶是否系安全带
	CarCoDriverBeltedConfidence: 'coDriverBeltConfidence',

	CarDanger: 'danger', // 是否装有危险品
	CarDangerConfidence: 'dangerConfidence', // 是否装有危险品

	CarCrashed: 'crash', // 是否有碰撞
	CarCrashedConfidence: 'crashConfindence', // 是否有碰撞

	CarLicenseNumber: 'plateNumber', // 车牌号码
	CarLicenseNumberConfidence: 'plateNumberConfidence',

	CarLicenseColor: 'plateColor', // 车牌颜色
	CarLicenseColorConfidence: 'plateColorConfidence',

	CarLicenseSheltered: 'plateShelter', // 是否遮挡
	CarLicenseShelteredConfidence: 'plateShelterConfidence',

	CarLicenseDestained: 'plateDestain', // 是否污损
	CarLicenseDestainedConfidence: 'plateDestainConfidence',

	// 车辆小物件
	CarMakerTag: 'makerTag', // 年检标签
	CarMakerTagConfidence: 'makerTagConfidence',

	CarMakerPaperBox: 'makerPaperBox', // 纸巾盒
	CarMakerPaperBoxConfidence: 'makerPaperBoxConfidence',

	CarMakerSunShield: 'makerSunShield', // 遮阳板
	CarMakerSunShieldConfidence: 'makerSunShieldConfidence',

	CarMakerPendant: 'makerPendant', // 挂件
	CarMakerPendantConfidence: 'makerPendantConfidence'
};

// 基本的查询类型
export type QueryType = {
	field: string; // key
	value: string; // value
	operator: Operator; // 操作符
};

// 子元素进行and查询
export type AndQuery<T = QueryType> = Array<T>;
// 子元素进行or查询
export type OrQuery<T = QueryType> = Array<T>; // eslint-disable-line

export type TaskResultPayload = {
	orBeanList: AndQuery<OrQuery<AndQuery>>;
	andBean: AndQuery<QueryType>; // QueryType1 && QueryType2
	sort: ESortType;
	set: EMerge; // 交并集
	relative: boolean; // 是否关联
};
/************************* ****************************/
