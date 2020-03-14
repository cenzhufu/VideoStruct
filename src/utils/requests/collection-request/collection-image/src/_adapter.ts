import { ValidateTool } from 'ifutils/validate-tool';
import {
	IFDetectedStructualInfo,
	IBDetectedStructualInfo,
	IBDetectedResultStructualInfo
} from './image-type';
import { toStructuralInfoFromDetectedInfo } from './to-structural-info-adaptor';

/**
 * 上传检测格式的适配（do nothing)
 * @export
 * @param {IFDetectedStructualInfo} detectedInfo 待转换的数据
 * @returns {IFDetectedStructualInfo} 转换后的数据
 */
export function toDetectStructualInfo(
	detectedInfo: IBDetectedStructualInfo
): IFDetectedStructualInfo {
	let results = ValidateTool.getValidArray(detectedInfo.result);
	return {
		...detectedInfo,
		result: results.map((item: IBDetectedResultStructualInfo) => {
			return toStructuralInfoFromDetectedInfo(item);
		})
	};
}
