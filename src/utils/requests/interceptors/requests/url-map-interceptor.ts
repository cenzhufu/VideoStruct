// @ts-check
import Config from 'stconfig';
import { ValidateTool } from 'ifutils/validate-tool';
import { IFRequestConfig } from 'ifvendors/utils/requests';

/**
 * 请求映射
 * @param {IFRequestConfig} value 请求配置
 * @returns {IFRequestConfig} 请求配置
 */
function UrlRequestMapInterceptor(value: IFRequestConfig): IFRequestConfig {
	try {
		let requestUrl = value.url as string;
		// 替换字符串
		let urlHostMapLists: Array<{
			from: string;
			flag: string;
			to: string;
		}> = Config.getRequestUrlHostMapConfig();

		for (let i = 0; i < urlHostMapLists.length; i++) {
			let map: { from: string; to: string } = urlHostMapLists[i];
			requestUrl = requestUrl.replace(
				new RegExp(
					ValidateTool.getValidString(map['from'], ''),
					ValidateTool.getValidString(map['flag'], '')
				),
				ValidateTool.getValidString(map['to'], '')
			);
		}

		value.url = requestUrl;
	} catch (error) {
		console.error('UrlMapInterceptor', error);
	}

	return value;
}

export default UrlRequestMapInterceptor;
