import { IBActionAlarmInfo } from 'stsrc/utils/mqtt';
import {
	EActionMonitorType,
	EActionScenceType
} from 'stsrc/utils/requests/monitor-request/src/action-monitor/types';
import { IFDeviceInfo } from 'stsrc/type-define';
export interface IBActionAlarmInfo {
	id: string;
	userId: string;
	cameraId: string;
	type: EActionMonitorType;
	sceneType: EActionScenceType; // TODO: 后台没定义
	time: number;
	url: string; // 图片地址
}

export interface IFActionAlarmInfo extends IBActionAlarmInfo {
	// 前端添加
	isNewMessage: boolean; // 是否新消息

	cameraInfo?: IFDeviceInfo;
	uuid: string;
}
