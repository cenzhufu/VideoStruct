/**
 * 保留几位小数截取数字
 * @param {string | number} value 值
 * @param {number} fixed 保留几位小数
 * @returns {number} 截取后的数字
 */
export function trimNumberToFixed(
	value: string | number,
	fixed: number = 1
): number {
	// TODO: fixed还未实现
	let matched: RegExpMatchArray | null = String(value).match(/\d{0,}\.\d/);
	if (matched) {
		return Number.parseFloat(matched[0]);
	} else {
		return Number.parseFloat(String(value));
	}
}
