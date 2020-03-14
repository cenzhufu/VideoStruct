import { IFFileInfo } from '../types/fileinfo-datatype';
import {
	IFAnalysisSourceDetailInfo,
	IFAnalysisSourceProfileInfo
} from 'stsrc/utils/requests/collection-request';

/**
 * 将数据分析信息转换成fileInfo类型
 * @export
 * @param {IFAnalysisSourceDetailInfo} analysisInfo 数据分析info
 * @returns {IFFileInfo} file info
 */
export function toFFileInfoFromAnalysisInfo(
	analysisInfo: IFAnalysisSourceDetailInfo | IFAnalysisSourceProfileInfo
): IFFileInfo {
	return {
		id: analysisInfo.sourceId || '',
		name: analysisInfo.sourceName || '',
		sourceSize: analysisInfo.sourceSizeTip || '',
		count: null
	};
}
