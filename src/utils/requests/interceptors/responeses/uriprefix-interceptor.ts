import { IFResponse } from 'ifvendors/utils/requests';
import Config from 'stconfig';
import { TypeValidate } from 'ifvendors/utils/validate-tool';

export function addUrlPrefixIfNeeded(path: string): string {
	let prefix = Config.getUriPrefix();
	if (TypeValidate.isString(path)) {
		if (path.match(/^https?/) || path.match(/^data:image/)) {
			return path;
		} else {
			return `${window.location.protocol}//${prefix}${path}`;
		}
	} else {
		console.warn('not a valid path', path);
		// 其他情况不做任何处理
		return path;
	}
}

function UriPrefixInterceptor(response: IFResponse<any>): IFResponse<any> {
	// 获得数据
	let responseStr = JSON.stringify(response);
	// let prefix = Config.getUriPrefix();
	// NOTE: 已扩展名判断不行
	// 支持的格式
	// let format: string = [
	// 	...Config.getSupportedPicFormat(),
	// 	// ...Config.getSupportedRarFormat(),
	// 	...Config.getSupportedVideoFormat()
	// ]
	// 	.map((format: string) => {
	// 		// 转义.
	// 		// eslint-disable-next-line
	// 		return format.replace('.', '\\.');
	// 	})
	// 	.join('|');
	// let formatReg = new RegExp(`"([^"]*?)(${format})"`, 'g');
	// // 添加
	// // let reg = /("(?:uri|imageData|backgroundImage|targetImage)"):\s?"(.*?)"/g;

	// let resultStr = responseStr.replace(formatReg, function replaceUri(
	// 	match: string,
	// 	path: string,
	// 	extend: string,
	// 	offset: number,
	// 	str: string
	// ): string {
	// 	// 如果是绝对路径则不作处理
	// 	if (path.match(/^https?/)) {
	// 		return `"${path}${extend}"`;
	// 	} else {
	// 		return `"${window.location.protocol}//${prefix}${p1}${extend}"`;
	// 	}
	// });

	// 添加
	// uri: 上传检测接口
	// imageData
	let reg = /("(?:uri|imageData|backgroundImage|targetImage|sourceUrl|url)"):\s?"([^:*]*?)"/g;

	let resultStr = responseStr.replace(reg, function replaceUri(
		match: string,
		key: string,
		path: string,
		offset: number,
		str: string
	): string {
		// 如果是绝对路径则不作处理
		let absolutePath = addUrlPrefixIfNeeded(path);
		return `${key}: "${absolutePath}"`;
	});

	let result;
	try {
		result = JSON.parse(resultStr);
	} catch (error) {
		console.error('UriPrefixInterceptor error', error);
		result = response;
	}

	return result;
}

export default UriPrefixInterceptor;
