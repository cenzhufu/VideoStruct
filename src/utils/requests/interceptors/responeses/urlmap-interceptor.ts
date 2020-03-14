// @ts-check
import { IFResponse } from 'ifvendors/utils/requests';
import Config from 'stconfig';
import { ValidateTool } from 'ifutils/validate-tool';
/**
 * url地址替换
 * @param   {IFResponse<any>} response response对象
 * @returns {IFResponse<any>} 替换过url地址的response对象
 */
function UrlMapInterceptor(response: IFResponse<any>): IFResponse<any> {
	// TODO: url替换
	let resultResponse = response;
	try {
		let responseStr = JSON.stringify(response);
		// 替换字符串
		let urlHostMapLists: Array<{
			from: string;
			flag: string;
			to: string;
		}> = Config.getResponseUrlHostMapConfig();

		for (let i = 0; i < urlHostMapLists.length; i++) {
			let map: { from: string; to: string } = urlHostMapLists[i];
			responseStr = responseStr.replace(
				new RegExp(
					ValidateTool.getValidString(map['from'], ''),
					ValidateTool.getValidString(map['flag'], '')
				),
				ValidateTool.getValidString(map['to'], '')
			);
		}

		resultResponse = JSON.parse(responseStr);
	} catch (error) {
		console.error('UrlMapInterceptor', error);
	}

	return resultResponse;
}

export default UrlMapInterceptor;
