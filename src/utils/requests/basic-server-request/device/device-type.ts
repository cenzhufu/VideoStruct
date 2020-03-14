import * as is from 'is';

export enum EDeviceWorkType {
	Unknown = -1,
	Capture = 0, // 抓拍模式
	RTSP = 3 // RTSP模式
}

export function getValidDeviceWorkType(
	type: any,
	defaultValue: EDeviceWorkType = EDeviceWorkType.Unknown
): EDeviceWorkType {
	if (!is.number(type)) {
		return EDeviceWorkType.Unknown;
	}

	switch (type) {
		case EDeviceWorkType.Capture:
		case EDeviceWorkType.RTSP:
			return type;

		default:
			return defaultValue;
	}
}

// 添加设备的请求参数
export interface AddDeviceRequestsPayloadType {
	ip: string;
	areaId: string;
	name: string;
	loginUser: string;
	password: string;
	id?: string;
	port?: string;
	channel?: string; //通道号
	geoString: string; //经纬度

	capture_type?: EDeviceWorkType;
	rtsp?: string; // 当capture_type为rtsp时，需要传入这个字段
	ability?: string; // 解析目标，现在传空值表示只是创建记录，并不应用这个信息
}

/****************************后台接口返回  *********************************************/
// 设备信息类型(后台返回)
export interface IBDeviceInfo {
	created: string; // YYYY-MM-DD HH:mm:ss
	updated: string; // YYYY-MM-DD HH:mm:ss
	id: string;
	ip: string;
	name: string;
	port: string;
	areaId: string; // 所属区域id
	areaName: string; // 所属区域的名字

	geoString?: string; // 'POINT(经度 维度)‘

	captureType?: EDeviceWorkType;
	rtsp?: string; // 当capture_type为rtsp时，需要传入这个字段

	loginUser: string; // 账号
	password: string; // 密码
	channel: string; // 通道
}

export interface IRGetDeviceListPayload {
	pageNo: number;
	pageSize: number;
	searchText?: string;
	orderBy?: 'updated desc';
	applyCameraOffset?: boolean;
}
