import { IBUserInfo } from './../account/types';
import { IFUserInfo } from 'stsrc/type-define';
//查询记录后台数据返回类型
export interface IBRecordInfo {
	logType: number;
	userInfo?: IBUserInfo;
	opt_time: string;
	operateTime: string;
	description: string;
	_id: string;
	id: string;
	userId: string;
	tid: string;
	operator: string;
}

//查询记录前端使用数据类型
export interface IFRecordInfo {
	id: string;
	operateTime: string;
	logType: number;
	userInfo?: IFUserInfo;
	description: string;
}

//查询记录前端请求数据类型
export interface IRecordDataSourceListReqPayload {
	page: number;
	pageSize: number;
	query?: string;
	userIds?: string;
	logType?: string;
	startTime?: string;
	endTime?: string;
}
