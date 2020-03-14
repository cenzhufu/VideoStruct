import { IBAnalysisTaskInfo } from './../collection-analyze-task/task-type';
import {
	IBAnalysisSourceDetailInfo,
	IFAnalysisSourceDetailInfo
} from './datasource-type';

import { toFTaskInfoFromBTask } from '../collection-analyze-task/to-task-info-adaptor';
import {
	getAnalysisStatusTip,
	getValidAnalysisStatus
} from './analysis-source-status-type';
export function toFSourceInfoFromB(
	bInfo: IBAnalysisSourceDetailInfo
): IFAnalysisSourceDetailInfo {
	return {
		...bInfo,
		statusTip: getAnalysisStatusTip(getValidAnalysisStatus(bInfo.status)),
		analyzeTasks: bInfo.analyzeTasks.map((bTaskInfo: IBAnalysisTaskInfo) => {
			return toFTaskInfoFromBTask(bTaskInfo);
		})
	};
}
