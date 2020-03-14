import { EDeviceWorkType } from 'stsrc/utils/requests/basic-server-request';
import { IFAreaInfo } from './areainfo-datatype';

// 设备节点类型

/****************************前端业务逻辑使用  *********************************************/
export interface IFDeviceInfo {
	id: string; // 设备id
	name: string; // 设备名字

	areaId: string; // 区域id
	areaName: string; // 区域名字

	ip?: string;
	port?: string;
	count?: number | null;

	lat?: number; // 纬度
	lng?: number; // 经度

	loginUser: string; // 账号
	password: string; // 密码
	channel: string; // 通道

	captureType: EDeviceWorkType;
	rtsp: string;

	parent: IFAreaInfo | null;

	// 前端添加
	state?: number; // 用来判断样式
	uuid: string; // 充当key
}

export function getDefaultDeviceInfo(): IFDeviceInfo {
	return {
		id: '',
		name: '',
		areaId: '',
		areaName: '',
		loginUser: '',
		password: '',
		channel: '',
		uuid: '',
		parent: null,
		captureType: EDeviceWorkType.Unknown,
		rtsp: ''
	};
}
