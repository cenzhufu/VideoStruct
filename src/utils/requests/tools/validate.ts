// 公共的验证方法

import { addUrlPrefixIfNeeded } from 'stsrc/utils/requests/interceptors/responeses/uriprefix-interceptor';
import { addThumbFlagToImageUrlIfNeeded, EThumbFlag } from './thumb-url';
/**
 * 对id字段进行验证，得到有效的id值
 * @export
 * @param {string} id id
 * @returns {string} valid id
 */
export function validateIdField(id: string): string {
	return id || '';
}

/**
 * 对time字段进行
 * @export
 * @param {string} time ddd
 * @returns {string} ddd
 */
export function validateTimeField(time: string): string {
	// TODO: 短短的
	return '';
}

/**
 * 验证图片地址
 * @export
 * @param {string} imageUrl 图片地址
 * @param {boolean} [generateThumb=true] 是否生成缩略图
 * @param {EThumbFlag} [thumbFlag=EThumbFlag.Thumb100x100] 缩略图配置
 * @returns {string} 验证后的缩略图
 */
export function validateImageUrlField(
	imageUrl: string,
	generateThumb: boolean = true,
	thumbFlag: EThumbFlag = EThumbFlag.Thumb100x100
): string {
	if (generateThumb) {
		return addUrlPrefixIfNeeded(
			addThumbFlagToImageUrlIfNeeded(imageUrl, thumbFlag)
		);
	} else {
		return addUrlPrefixIfNeeded(imageUrl);
	}
}
