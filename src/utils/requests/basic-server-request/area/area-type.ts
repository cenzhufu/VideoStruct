import { IBDeviceInfo } from './../device/device-type';

// 添加区域请求参数的类型
export interface AddAreaRequestPayloadType {
	name: string; //
	parentId?: string; // 默认0
	type?: number; // 类型
	longitude?: string; // 116.420366
	latitude?: string; // 39.935961
	sortNum?: number; // 排序字段
	description?: string; // 描述
}

// 区域数据类型（后台返回的结构）
export interface IBAreaInfo {
	name: string; //
	parentId: string; // 默认0
	type?: number; // 类型
	longitude?: string; // 116.420366
	latitude?: string; // 39.935961
	sortNum?: number; // 排序字段
	id: string;
	created: string; // YYYY-MM-DD HH:mm:ss
	updated: string; // YYYY-MM-DD HH:mm:ss
	node_type: string; // 't_area'
	childList: Array<IBAreaInfo>; // 孩子
	nextList: Array<IBDeviceInfo>; // 设备
	description: string;
}
