import { IFFileUploadResultInfo } from './file-request';
import Config from 'stconfig';
import { ValidateTool } from 'ifutils/validate-tool';
import IFRequest, { IFResponse, IFRequestConfig } from 'ifutils/requests';

// 权限服务端口号(网关), 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
// const port = 8762;
// 注册中心服务名， 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
const gatewayName = 'ifaas-file';

/**
 * 获得auth服务的请求url
 * @param {string} path 相对路径，前面带有/, 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4980867
 * @param {boolean} addZuul 是否添加zuul前缀
 * @returns {string} 请求url
 */
export function getFileInfoRequestUrl(
	path: string,
	addZuul: boolean = false
): string {
	// 这句话不要放在函数外边，因为Config的初始化是异步的
	const hostname = Config.getBaseApiRequestAddress();
	return `${
		window.location.protocol
	}//${hostname}:${Config.getBaseApiRequestPort()}${
		addZuul ? '/zuul/' : '/'
	}${gatewayName}${path}`;
}

// 文件上传接口的返回数据类型（后台返回/业务层）
export interface FileUploadResDataType {
	fileUrl: string;
	fileId: string;
}

/**
 * 图片文件上传接口
 * @param {File} file 文件数据
 * @param {string} ext 文件扩展名
 * @returns {Promise<FileUploadResDataType>} FileUploadResDataType对象
 */
async function uploadImageFile(file: Blob): Promise<FileUploadResDataType> {
	let url = getFileInfoRequestUrl('/fileUploadMulti');
	let formData = new FormData();
	formData.append('file', file);
	let result: IFResponse<FileUploadResDataType> = await IFRequest.post(
		url,
		formData
	);
	// @ts-ignore
	return ValidateTool.getValidObject(result['data']['data'], {});
}

/**
 * 文件状态类型
 */
export interface FileStatusType {
	fileMD5: string;
	lock: 0 | 1; //  0表示未占用，1表示占用
	totalChunks: number; // 文件分块的总数量
	currChunk: number; // 当前待传的分片序号
	path: string; // 文件路径
}

/**
 * 获得文件检查的请求配置
 * @param {string} md5 文件md5
 * @returns {Partial<IFRequestConfig>} 请求配置
 */
function getFileStatusCheckRequestConfig(
	md5: string
): Partial<IFRequestConfig> {
	let data = new FormData();
	data.append('fileMD5', md5);
	return {
		url: getFileInfoRequestUrl('/checkFile/1.0'),
		data: data,
		method: 'post'
	};
}
/**
 * 文件状态的检测，在分片上传中使用
 * @param {string} md5 文件的md5值
 * @param {IFRequestConfig} options 额外选项
 * @returns {Promise<FileStatusType>} 文件状态描述
 */
async function fileStatusCheck(
	md5: string,
	options: IFRequestConfig = {}
): Promise<FileStatusType> {
	// TODO: 参数检测

	let url = getFileInfoRequestUrl('/checkFile/1.0');

	//
	let date = new FormData();
	date.append('fileMD5', md5);
	let result: IFResponse<FileStatusType> = await IFRequest.post(
		url,
		date,
		options
	);

	let data = ValidateTool.getValidObject(result['data'], {}); // 服务器返回的统一结构
	// TODO: 返回值验证
	// @ts-ignore
	return ValidateTool.getValidObject(data['data'], {});
}

// 文件上传的结果
export interface IFFileUploadResultInfo {
	fileUrl: string;
	id: string;
	fileSize: number;
	filemd5: string;
	fileName: string;
}

/**
 * 获得文件分片上传的请求参数
 * @param {Blob} sliceFile blob
 * @param {number} currentChunk 当前分片的次序
 * @param {number} chunkSize 分片的大小
 * @param {number} fileSize 文件的大小
 * @param {string} md5 文件的md5
 * @param {File} file 原始文件
 * @returns {Partial<IFRequestConfig>} 请求配置
 */
function getFileSliceUploadRequestConfig(
	sliceFile: Blob,
	currentChunk: number,
	chunkSize: number,
	fileSize: number,
	md5: string,
	file: File
): Partial<IFRequestConfig> {
	let url = getFileInfoRequestUrl('/bigFileUploadMulti/1.0', true);

	let formData = new FormData();

	formData.append('file', sliceFile, file.name);
	formData.append('fileMD5', md5);
	formData.append('totalChunks', String(Math.ceil(fileSize / chunkSize)));
	formData.append('currChunk', String(currentChunk));
	formData.append('fileSize', String(fileSize));

	return {
		url: url,
		data: formData,
		method: 'post'
	};
}
/**
 * 文件的分片上传
 * @param {Blob} blob 分片的数组
 * @param {string} md5 文件的md5值
 * @param {number} fileSize 文件的总大小(byte)
 * @param {number} totalChunks  文件总分片数
 * @param {number} currentChunk 当前分片的次序
 * @param {File} file 文件
 * @param {IFRequestConfig} options 额外选项
 * @returns {Promise<IFFileUploadResultInfo | null>} 所有分片都上传完成后返回FileUploadResultType
 */
async function fileSplitChunkUpload(
	blob: Blob,
	md5: string,
	fileSize: number,
	totalChunks: number = 1,
	currentChunk: number = 0,
	file: File,
	options: IFRequestConfig = {}
): Promise<IFFileUploadResultInfo> {
	// TODO: 参数检测
	let url = getFileInfoRequestUrl('/bigFileUploadMulti/1.0', true);

	let formData = new FormData();
	formData.append('file', blob, file.name);
	formData.append('fileMD5', md5);
	formData.append('totalChunks', String(totalChunks));
	formData.append('currChunk', String(currentChunk));
	formData.append('fileSize', String(fileSize));
	let result = await IFRequest.post(url, formData, options);

	// TODO: 返回值验证
	let data = ValidateTool.getValidObject(result['data'], {}); // 服务器返回的统一结构
	// @ts-ignore
	return ValidateTool.getValidObject(data['data'], {});
}

const FileRequest = {
	uploadImageFile: uploadImageFile,
	fileStatusCheck: fileStatusCheck,
	fileSplitChunkUpload: fileSplitChunkUpload,

	getFileStatusCheckRequestConfig: getFileStatusCheckRequestConfig,
	getFileSliceUploadRequestConfig: getFileSliceUploadRequestConfig
};

export default FileRequest;
