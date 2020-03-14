import { EAnalysisSourceStatus } from 'stutils/requests/collection-request';

import { ESourceType, ETargetType } from 'sttypedefine';
import { IFFileUploadResultInfo } from 'stsrc/utils/requests/file-server-requests';
export enum EUploadStatus {
	Unknown = 'unknown', // 未知
	Waiting = 'wating', // 等待中
	Processing = 'processing', // 处理中
	Failed = 'failed', // 失败
	Succeed = 'succeed', // 成功
	Paused = 'paused', // 暂停
	Unvalid = 'unvalid' // 无效的
}

export enum EUploadAndAnalysisStepType {
	Unknown = 'unknown',
	Uploading = 'uploading',
	Analysising = 'analysising'
}

// 上传和更新任务的记录
export interface IFUploadAndAnalysisProcessInfo {
	taskId: string; // 唯一标志符
	uploadStatus: EUploadStatus;
	uploadProcess: number; // [0, 100] 上传进度

	targetTypes: ETargetType[]; // 解析类型

	fileUniqueKey: string; // 非md5值，只是前端用来通过判断文件的唯一性

	// file: File;
	fileUploadResult?: IFFileUploadResultInfo;

	// 阶段
	stepType: EUploadAndAnalysisStepType;

	// 创建的数据源信息
	sourceType: ESourceType;
	sourceId: string;
	id: string; // 数据源记录的id(用于删除)
	sourceStatus: EAnalysisSourceStatus;
	analysisTaskId: string; // 分析任务task id
	analysisProcess: number; // [0, 100] 解析进度

	error: Error | null;
	tip: string;

	size: number;
	name: string;
}
