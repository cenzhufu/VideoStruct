// 任务类型
export enum ETaskType {
	Unknown = 'unknown', // 前端添加
	AnalysisTask = 'analyzeTask', // 分析任务
	CaptureTask = 'snaperTask' // 引擎抓拍任务
}

/**
 * 获得有效的taskType
 * @export
 * @param {ETaskType} taskType taskType
 * @returns {ETaskType} 有效的task type
 */
export function getValiedTaskType(taskType: ETaskType): ETaskType {
	if (!taskType) {
		return ETaskType.Unknown;
	}

	switch (taskType) {
		case ETaskType.AnalysisTask:
		case ETaskType.CaptureTask:
			return taskType;

		default:
			return ETaskType.Unknown;
	}
}
