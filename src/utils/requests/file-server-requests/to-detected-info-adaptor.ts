import { FileUploadResDataType } from './file-request';
import { IFDetectedStructualInfo } from '../collection-request';

/**
 * 文件上传结果转换到检测结果
 * @export
 * @param {FileUploadResDataType} fileUploadResult 上传结果
 * @returns {IFDetectedStructualInfo} 结果
 */
export function toDetectedInfoFromFileUploadResult(
	fileUploadResult: FileUploadResDataType
): IFDetectedStructualInfo {
	return {
		id: fileUploadResult.fileId,
		uri: fileUploadResult.fileUrl,
		faces: 0,
		faceList: [],
		bodys: 0,
		bodyList: [],
		cars: 0,
		carList: [],
		result: [],
		time: '2009-01-01 13:02:39'
	};
}
