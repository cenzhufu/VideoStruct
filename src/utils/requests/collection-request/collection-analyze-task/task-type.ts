import {
	IFAnalysisSourceProfileInfo,
	EAnalysisSourceStatus
} from '../collection-analyze-source';
import { ETargetType } from 'sttypedefine';

/**********************创建分析任务 ***********************/
export interface CraeteAnalysisTaskReqPayloadType {
	resourceId: string; // 接入源的id
	analyzeTypes: string; // 分析类型,多个以","拼接, 组成为EStructuraInfoType
}

/**********************获取析任务 ***********************/

interface IBasicAnalysisInfo {
	id: string;
	resourceId: string; // 接入源id
	status: EAnalysisSourceStatus; // 分析源的状态:
	analyzeProgress: number; // 任务进度
	analyzeResource?: IFAnalysisSourceProfileInfo; // 该任务的分析源信息
	userId: string; // 创建改任务的用户id
	createTime: string; // 接入开始时间 YYYY-MM-DD HH:mm:ss  2018-01-02 23:00:00
	updateTime: string; // 接入更新时间 YYYY-MM-DD HH:mm:ss  2018-01-02 23:00:00
}

export interface IBAnalysisTaskInfo extends IBasicAnalysisInfo {
	analyzeType: string; // 分析类型, etargetType, 逗号分隔
}

// 分析任务的信息结构
export interface IFAnalysisTaskInfo extends IBasicAnalysisInfo {
	analyzeType: ETargetType[]; // 分析类型
}

// 任务进度信息（front end)
export interface IFAnalysisTaskProgressInfo {
	id: string; // 任务id
	analyzeType: string; // 逗号分隔， targetType
	status: EAnalysisSourceStatus;
	analyzeProgress: number; // 进度
	createTime: number;
	updateTime: number;
	current: number;
	total: number;
	successCount: number;
	failedCount: number;
	resultId: number;
}

// 任务进度信息(back end)
export interface IBAnalysisTaskProgressInfo extends IFAnalysisTaskProgressInfo {
	[key: string]: any;
}
