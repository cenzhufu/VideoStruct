// @ts-check

/*
 *用来管理系统配置和用户配置
 */
import { ValidateTool, TypeValidate } from 'ifutils/validate-tool';
import SystemConfig from './SystemConfig';
import PublicResourceRequests from 'stutils/requests/public-resource-requests';
import { IFResponse } from 'ifvendors/utils/requests';
import { ETargetType } from 'sttypedefine';

async function loadUserConfig() {

	let result: IFResponse<Object> = await PublicResourceRequests.getPublicResorce('config.json');
	let data = result['data'];

	// 默认导出到window
	// @ts-ignore
	window.config = data;
	return data;
}

let resultConfig = {};

/**
 * 初始化配置信息
 */
export async function initSystemConfig() {
	return loadUserConfig().then((userSetting: Object) => {
		// 合并系统的配置和用户的配置
		let unconfigableConfig = ValidateTool.getValidObject(SystemConfig['unconfigable'], {});
		let configableConfig = ValidateTool.getValidObject(SystemConfig['configable'], {});
		resultConfig = { ...configableConfig, ...userSetting, ...unconfigableConfig};
	}).catch((error) => {
		// 默认读取系统的配置
		let unconfigableConfig = ValidateTool.getValidObject(SystemConfig['unconfigable'], {});
		let configableConfig = ValidateTool.getValidObject(SystemConfig['configable'], {});
		resultConfig = { ...configableConfig, ...unconfigableConfig };
	})
}

/**
 * 定义获取的方法
 * @NOTE: 注意以下的所有方法请不要在函数之外使用，
 * 因为Config的初始化是异步的，在函数之外将不会出现预期的结果
 */


/**
 * 获得map 的配置
 */
export function getMapConfig(): Object {
	return ValidateTool.getValidObject(resultConfig['mapServer'], {});
}

/**
 * 获得api request 地址的配置
 */
export function getApiRequestAddress(): Object {
	return ValidateTool.getValidObject(resultConfig['apiRequestAddress'], {});
}

/**
 * 获得请求的base url
 * @export
 * @returns {string} base url
 */
export function getBaseApiRequestAddress(): string {
	let apiConfig = getApiRequestAddress();
	// return ValidateTool.getValidString(apiConfig['base-request'], '');
	return ValidateTool.getValidString(apiConfig['ip'], '');
}

export function getBaseApiRequestPort(): string {
	let apiConfig = getApiRequestAddress();
	return ValidateTool.getValidString(apiConfig['port'], '')
}

/**
 * 获得responese之后的链接地址映射的配置
 * @export
 * @returns {Array<{from: string, to: string}>} 配置
 */
export function getResponseUrlHostMapConfig(): Array<{from: string, flag: string, to: string}> {
	return ValidateTool.getValidArray(resultConfig['responeseUrlHostMap']);
}

/**
 * 获得request的映射配置
 * @export
 * @returns {Array<{from: string, to: string}>} 配置
 */
export function getRequestUrlHostMapConfig(): Array<{from: string, flag: string, to: string}> {
	return ValidateTool.getValidArray(resultConfig['requestUrlHostMap']);
}

/**
 * 获得uri链接的前缀
 * @return uri链接前缀
 */
export function getUriPrefix(): string {
	let config = ValidateTool.getValidObject(resultConfig['uriPrefixV3']);
	return ValidateTool.getValidString(config['ip']) + ':' + ValidateTool.getValidString(config['port']);
}


/**
 * 获得mqtt服务器的配置
 * @export
 * @returns {{ip: string, port: string}}
 */
export function getMqttServerInfo(): {ip: string, port: string} {
	// @ts-ignore
	return ValidateTool.getValidObject(resultConfig['mqttServer']);
}

/**
 * 获得mqtt服务器的ip地址
 * @export
 * @returns {string}
 */
export function getMqttServerIpAddress(): string {
	let serverInfo: {ip: string, port: string} = getMqttServerInfo();
	// NOTE: 自带前缀
	return serverInfo['ip'] || '127.0.0.1';
}

/**
 * 获得mqtt服务器的端口号
 * @export
 * @returns {string}
 */
export function getMqttServerPort(): string {
	let serverInfo: { ip: string, port: string } = getMqttServerInfo();
	return serverInfo['port'] || '9001';
}

/*******************支持的文件格式 *************************/

/**
 * 获得支持的文件格式配置
 * @returns {Object} {zipFileFormat: Array<string>, picturalFileFormat: Array<string>, videoFileFormat: Array<string>}
 */
function getFileFormatConfig(): Object {
	return ValidateTool.getValidObject(resultConfig['supportedFileFormat']);
}


/**
 * 获得支持的图片格式
 * @export
 * @returns {Array<string>} 图片扩展名(带.)
 */
export function getSupportedPicFormat(): Array<string> {
	let config = getFileFormatConfig();
	return ValidateTool.getValidArray(config['picturalFileFormat']);
}

/**
 * 获得支持的视频格式
 * @export
 * @returns {Array<string>} 图片扩展名(带.)
 */
export function getSupportedVideoFormat(): Array<string> {
	let config = getFileFormatConfig();
	return ValidateTool.getValidArray(config['videoFileFormat']);
}

/**
 * 获得支持的压缩包格式
 * @export
 * @returns {Array<string>} 图片扩展名(带.)
 */
export function getSupportedRarFormat(): Array<string> {
	let config = getFileFormatConfig();
	return ValidateTool.getValidArray(config['zipFileFormat']);
}

/**
 * 是否开启缩略图
 * @export
 * @returns {boolean} true表示开启
 */
export function isThumbnailEnabled(): boolean {
	if (TypeValidate.isBoolean(resultConfig['thumbnailEnabled'])) {
		return resultConfig['thumbnailEnabled'];
	} else {
		return true;
	}
}

/**
 * 获取地图播放轨迹的时速
 * @export
 * @returns {number}
 */
export function getMapLocusSpeed(): number {
	return resultConfig['mapLocusSpeed'] || 0;
}

/**
 * 默认的分析任务配置(NOTE: 临时方案)
 * @export
 * @returns {Array<ETargetType>}
 */
export function getDefaultAnalysisTasks(): Array<ETargetType> {
	return [ETargetType.Face, ETargetType.Body];
}


/**
 * 获取摄像头管理的区域级数
 * @export
 * @returns {number}
 */
export function getAreaLevels(): number {
	return ValidateTool.getValidNumber(resultConfig['maxAreaLevels'], 3);
}

/**
 * 获取默认显示相似度
 * @export
 * @returns {number}
 */
export function getFaceDefaultThreshold(): number {
	return ValidateTool.getValidNumber(resultConfig['defaultFaceSimilarityThreshold'], 92);
}

export function getBodyDefaultThreshold(): number {
	return ValidateTool.getValidNumber(resultConfig['defaultBodySimilarityThreshold'], 88);
}

let _supportedTasks: ETargetType[] = [];

/**
 * 初始化
 * @export
 * @param {ETargetType[]} tasks
 */
export function initSupportedAnalysisTasks(tasks: ETargetType[]) {
	_supportedTasks = ValidateTool.getValidArray(tasks);
}

/**
 * 获得支持的解析type
 * 需要先调用initSupportedAnalysisTasks
 * @export
 * @returns {ETargetType[]}
 */
export function getSupportedAnalysisTargets(): ETargetType[] {
	return _supportedTasks;
}

// 调用
export default resultConfig;
