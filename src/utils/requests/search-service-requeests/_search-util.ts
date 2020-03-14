// 查询条件

/**
 * 大于等于的条件
 * @export
 * @param {(number | string)} value 值
 * @returns {string} 条件
 */
export function greetAndEqualThanSearchCondition(
	value: number | string
): string {
	return `[${value},*]`;
}

/**
 * 大于条件
 * @export
 * @param {(number | string)} value 值
 * @returns {string} 条件
 */
export function greetThanSearchCondition(value: number | string): string {
	return `(${value},*)`;
}

/**
 * 小于等于的条件
 * @export
 * @param {(number | string)} value 值
 * @returns {string} 条件
 */
export function lessAndEqualThanSeachCondition(value: number | string): string {
	return `[*,${value}]`;
}

/**
 * 小于条件
 * @export
 * @param {(number | string)} value 值
 * @returns {string} 条件
 */
export function lessThanSeachCondition(value: number | string): string {
	return `(*,${value})`;
}

/**
 * 在范围里边(都不包括)
 * @export
 * @param {(number | string)} small 左边的值
 * @param {(number | string)} big 右边的值
 * @returns {string} (small, big)
 */
export function betweenSearchCondition(
	small: number | string,
	big: number | string
): string {
	return `(${small},${big})`;
}
