import { RequestClass, IFRequestConfig } from 'ifutils/requests';

let request: RequestClass = RequestClass.createInstance();

/**
 * 获得public文件夹下的资源
 * @param {string} relativePath 相对于public的路径
 * @param {Partial<IFRequestConfig>} [options = {}] 额外的信息
 * @returns {Promise<any>} 返回文件的信息
 */
export async function getPublicResorce(
	relativePath: string,
	options: Partial<IFRequestConfig> = {}
): Promise<any> {
	let result = await request.get(`${window.location.origin}/${relativePath}`);
	return result;
}
