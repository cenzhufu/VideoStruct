import * as intl from 'react-intl-universal';
// 分析源状态
export enum EAnalysisSourceStatus {
	Unknown = -1, // 前端添加， 未知的状态
	All = 99, // 前端添加， 所有正常状态（除了Unknown)
	Waiting = 0, // 刚创建,等待接入
	Analysising = 1, // 正在解析(对于文件使用)
	RealTimeAnalysis = 3, // 实时接入(对于实时数据流)
	Finished = 2, // 完成
	PAUSED = 4, // 停止状态
	STREAM = 5, // 实时视频流

	CommonFailed = 11000001, // 通用失败
	ResourceUnvalid = 11000006, // 资源非法，包括：下载压缩包失败、视频流无法连接等
	FileFormatError = 11000007, // 文件格式错误，包括：加密的压缩包、非zip压缩包、不支持的视频格式等
	NoImageError = 11000008, // 解析任务结果中无图片
	WaitingFor = 11000009, // 解析任务太多，等待被解析
	STREAMISNORMAL = 11000010, // 直播流连接正常
	STREAMISABNORMAL = 11000011 // 直播流连接异常
}

export function isValidAnalysisStatus(status: EAnalysisSourceStatus): boolean {
	return (
		status === EAnalysisSourceStatus.Waiting ||
		status === EAnalysisSourceStatus.Analysising ||
		status === EAnalysisSourceStatus.RealTimeAnalysis ||
		status === EAnalysisSourceStatus.Finished ||
		status === EAnalysisSourceStatus.PAUSED ||
		status === EAnalysisSourceStatus.STREAM ||
		status === EAnalysisSourceStatus.CommonFailed ||
		status === EAnalysisSourceStatus.FileFormatError ||
		status === EAnalysisSourceStatus.ResourceUnvalid ||
		status === EAnalysisSourceStatus.NoImageError ||
		status === EAnalysisSourceStatus.WaitingFor ||
		status === EAnalysisSourceStatus.STREAMISNORMAL ||
		status === EAnalysisSourceStatus.STREAMISABNORMAL
	);
}

export function getValidAnalysisStatus(
	status: EAnalysisSourceStatus
): EAnalysisSourceStatus {
	if (isValidAnalysisStatus(status)) {
		return status;
	} else {
		return EAnalysisSourceStatus.Unknown;
	}
}

/**
 * 是否完成（针对非实时视频）
 * @param {EAnalysisSourceStatus} status 状态
 * @returns {boolean} true表示完成
 */
export function isAnalysisSourceFinished(status: EAnalysisSourceStatus) {
	return status === EAnalysisSourceStatus.Finished;
}

/**
 * 是否失败
 * @param {EAnalysisSourceStatus} status 状态
 * @returns {boolean} true表示失败
 */
export function isAnalysisSourceFailed(status: EAnalysisSourceStatus) {
	return (
		status === EAnalysisSourceStatus.CommonFailed ||
		status === EAnalysisSourceStatus.FileFormatError ||
		status === EAnalysisSourceStatus.ResourceUnvalid ||
		status === EAnalysisSourceStatus.NoImageError ||
		status === EAnalysisSourceStatus.STREAMISABNORMAL ||
		status === EAnalysisSourceStatus.Unknown
	);
}

/**
 * 是否正在处理中
 * @param {EAnalysisSourceStatus} status 状态
 * @returns {boolean} true表示正在处理
 */
export function isAnalysisSourceProcessing(status: EAnalysisSourceStatus) {
	return (
		status === EAnalysisSourceStatus.Waiting ||
		status === EAnalysisSourceStatus.Analysising ||
		status === EAnalysisSourceStatus.STREAM ||
		status === EAnalysisSourceStatus.STREAMISNORMAL ||
		status === EAnalysisSourceStatus.RealTimeAnalysis
	);
}

/**
 * 是否等待接入中
 * @param {EAnalysisSourceStatus} status 状态
 * @returns {boolean} true表示等待
 */
export function isAnalysisSourceWaiting(status: EAnalysisSourceStatus) {
	return status === EAnalysisSourceStatus.WaitingFor;
}

/**
 * 是否暂停
 * @param {EAnalysisSourceStatus} status 状态
 * @returns {boolean} true表示暂停
 */
export function isAnalysisPaused(status: EAnalysisSourceStatus) {
	return status === EAnalysisSourceStatus.PAUSED;
}

export function getAnalysisStatusTip(status: EAnalysisSourceStatus): string {
	if (isAnalysisSourceFinished(status)) {
		return intl.get('ANALYSIS_FINISHED_STATUS').d('分析完成');
	}

	if (isAnalysisSourceProcessing(status)) {
		return intl.get('ANALYSIS_PROCESS_STATUS').d('正在解析');
	}

	if (isAnalysisSourceFailed(status)) {
		return intl.get('ANALYSIS_FAILED_STATUS').d('解析失败');
	}

	if (isAnalysisSourceWaiting(status)) {
		return intl.get('ANALYSIS_WATING_STATUS').d('等待解析');
	}

	if (isAnalysisPaused(status)) {
		return intl.get('ANALYSIS_PAUSED_STATUS').d('暂停解析');
	}

	return intl.get('ANALYSIS_UNKNOW_STATUS').d('未知状态');
}
