import * as is from 'is';

export interface EqualCondition {
	[key: string]: string | number;
}

/**
 * 生成相等的查询条件
 * @export
 * @param {string} key 字段
 * @param {(string | number)} value 值
 * @returns {(EqualCondition | null)} 条件
 */
export function generateEqualCondition(
	key: string,
	value: string | number
): EqualCondition | null {
	if (key && is.string(key) && (is.string(value) || is.number(value))) {
		return { [key]: value };
	} else {
		return null;
	}
}

/**
 * 生成相等的查询参数
 * @export
 * @param {Array<EqualCondition>} equalConditions 相等条件列表
 * @returns {object} 查询参数
 */
export function generateEqualParams(
	equalConditions: Array<EqualCondition>
): object {
	let result = {};
	for (let conditon of equalConditions) {
		let keys = Object.keys(conditon);
		for (let key of keys) {
			result[key] = conditon[key];
		}
	}

	if (Object.keys(result).length > 0) {
		return {
			eq: [result]
		};
	} else {
		return {};
	}
}
