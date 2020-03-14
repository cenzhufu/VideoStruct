/**
 * 行为布控的类型
 * @export
 * @enum {number}
 */
export enum EActionMonitorType {
	Ride = 1, // 骑行
	FallOver = 2, // 跌倒
	ManyPeople = 3, // 人群密集
	Disorder = 4 // 人群骚乱
}

export enum EActionScenceType {
	Unknown = 1
}

export enum EActionMonitorSceneType {}

/**
 * 行为布控的信息
 * @export
 * @interface IFActionMonitorInfo
 */
export interface IFActionMonitorInfo {
	cameraIds?: string; // 逗号分隔，和cameraId两者取一个
	cameraId?: string;
	type: EActionMonitorType;
	personId: string; // 登录用户id
	id?: string;
	sceneType?: EActionMonitorSceneType;
}
