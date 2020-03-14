import Config from 'stconfig';
import { TypeValidate } from 'ifvendors/utils/validate-tool';

/**
 * 给链接添加protocol
 * @export
 * @param {string} path 链接地址
 * @returns {string} 绝对地址
 */
export function addUrlPrefixIfNeeded(path: string): string {
	let prefix = Config.getUriPrefix();
	if (TypeValidate.isString(path)) {
		if (path.match(/^https?/)) {
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
