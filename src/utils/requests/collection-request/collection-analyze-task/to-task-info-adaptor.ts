import { ValidateTool } from 'ifutils/validate-tool';
import { IBAnalysisTaskInfo, IFAnalysisTaskInfo } from './task-type';
import { ETargetType, getValidTargetType } from 'stsrc/type-define';

export function toFTaskInfoFromBTask(
	bTaskInfo: IBAnalysisTaskInfo
): IFAnalysisTaskInfo {
	return {
		...bTaskInfo,
		analyzeType: ValidateTool.getValidArray(
			bTaskInfo.analyzeType.split(',')
		).map((type: ETargetType) => {
			return getValidTargetType(type);
		})
	};
}
