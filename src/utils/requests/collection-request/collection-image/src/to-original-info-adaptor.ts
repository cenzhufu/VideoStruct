import { ESourceType, getValidSourceType, ETaskType } from 'sttypedefine';
import { IFOriginalImageInfo, IBOriginalImageInfo } from './image-type';
export function toFOriginalInfoFromBOriginalInfo(
	info: IBOriginalImageInfo
): IFOriginalImageInfo {
	return {
		id: info.id,
		time: info.time,
		url: info.url,
		json: info.json,
		faces: info.faces,
		timeStamp: info.timeStamp,
		sourceType: getValidSourceType(info.sourceType),
		sourceId: info.sourceId,
		taskType:
			getValidSourceType(info.sourceType) === ESourceType.Camera
				? ETaskType.CaptureTask
				: ETaskType.AnalysisTask
	};
}
