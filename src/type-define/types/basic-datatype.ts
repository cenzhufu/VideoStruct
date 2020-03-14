// 项目中基础的数据类型
// 出现在这里边的，是没有在项目中使用到的/前端直接使用而不是由后台返回的，不然的话，会单独建立一个文件，并附带一个valid方法)

// boolean 类型
export enum EBoolean {
	False = 0,
	True = 1
}

// 检索库类型
export enum ESearchLibType {
	Capture = 0, // 抓拍人员库
	Resident = 1, // 居住人员库
	Static = 2 // 静态人员库
}

// 图片质量
export enum EImageQuality {
	Normal = 'ok', // 正常
	PoseFilter = 'poseFilter', // 角度过滤
	BigSizeFilter = 'bigSizeFilter', // 大尺寸过滤
	MinSizeFilter = 'minSizeFilter', // 小尺寸过滤
	BlurFilter = 'blurFilter' // 模糊过滤
}

// 检索库类型
export enum ESearchLibrary {
	Capture = '0', // 抓拍人脸库
	Resident = '1', // 居住人员库
	Static = '2' // 静态人员库
}

// 合并方法
export enum EMerge {
	Intersection = 0, // 交集(精确)
	Union = 1 // 并集(非精确)
}

// 排序关键字
export enum ESortKey {
	Time = 'time', // 时间排序
	Score = 'score' // 相似度排序
}

// 排序方法
export enum ESortType {
	Ascend = 'asc', // 升序
	Descend = 'desc' // 降序
}

// 单独用来表示时间格式的 YYYY-MM-dd HH:mm:ss
// 我们在其他地方使用 typeof DateFormat，只是为了表明字符串应该为YYYY-MM-DD HH:mm:ss格式的
export const DateFormat: string = 'YYYY-MM-DD HH:mm:ss';
