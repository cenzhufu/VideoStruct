import { IFResponse } from 'ifvendors/utils/requests';

// query
const thumbQuery: string = '_100x100.jpg'; //

// 添加url缩略图链接
function UriThumbInterceptor(response: IFResponse<any>): IFResponse<any> {
	// 获得数据
	let responseStr = JSON.stringify(response);
	// 添加
	let reg = /("(?:uri|imageData|targetImage|file)"):\s?"([^"]*?)"/g;

	let resultStr = responseStr.replace(reg, function replaceUri(
		match: string,
		p1: string,
		p2: string,
		offset: number,
		str: string
	): string {
		// 如果是绝对路径则不作处理
		// 给p2添加query
		return `${p1}: "${p2}${thumbQuery}"`;
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

export default UriThumbInterceptor;
