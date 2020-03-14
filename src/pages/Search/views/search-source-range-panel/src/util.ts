/**
 * 格式化一些数量的提示
 * @export
 * @param {number} count 数量
 * @returns {string} 格式化后的显示字符串
 */
export function formatCountTip(count: number): string {
	if (count >= 1000) {
		return '1000+';
	}
	return String(count);
}
