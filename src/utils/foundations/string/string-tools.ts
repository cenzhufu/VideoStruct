import { TypeValidate } from 'ifvendors/utils/validate-tool';
import NumberTools from 'ifutils/number';

export function getFileSizeTip(size: number) {
	if (size <= 0) {
		return '--';
	}

	// byte
	if (size < 1024) {
		return `${size}B`;
	}

	if (size < 1024 * 1024) {
		let MbStr: string = String(size / 1024);
		// 保留一位小数
		return NumberTools.trimNumberToFixed(MbStr) + 'K';
	}

	if (size < 1024 * 1024 * 1024) {
		let MbStr: string = String(size / (1024 * 1024));
		// 保留一位小数
		return NumberTools.trimNumberToFixed(MbStr) + 'M';
	}

	// G
	let GbStr: string = String(size / (1024 * 1024 * 1024));
	// 保留一位小数
	return NumberTools.trimNumberToFixed(GbStr) + 'G';
}

/**
 * data uri 转换成blob对象
 * @export
 * @param {string} dataUri data url
 * @returns {(Blob | null)} blob或null
 */
export function dataUriToBlob(dataUri: string): Blob | null {
	if (TypeValidate.isString(dataUri)) {
		let byteString;
		if (dataUri.split(',')[0].indexOf('base64') >= 0) {
			byteString = atob(dataUri.split(',')[1]);
		} else {
			byteString = unescape(dataUri.split(',')[1]);
		}
		// parse the mime type
		let mimeString = dataUri
			.split(',')[0]
			.split(':')[1]
			.split(';')[0];
		// construct a Blob of the image data
		let array = [];
		for (let i = 0; i < byteString.length; i++) {
			array.push(byteString.charCodeAt(i));
		}
		return new Blob([new Uint8Array(array)], {
			type: mimeString
		});
	} else {
		return null;
	}
}
