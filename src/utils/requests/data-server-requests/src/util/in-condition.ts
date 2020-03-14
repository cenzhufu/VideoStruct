import * as is from 'is';

export interface IInCondition {
	[key: string]: string;
}

/**
 * 生成in的条件
 * @export
 * @param {string} key 字段
 * @param {(Array<string | number>)} values 值列表
 * @returns {(IInCondition | null)} in条件或者null
 */
export function generateInCondition(
	key: string,
	values: Array<string | number>
): IInCondition | null {
	if (key && is.string(key) && is.array(values) && values.length > 0) {
		return {
			[key]: values.join(',')
		};
	} else {
		return null;
	}
}

/**
 * 生成in的请求参数
 * @export
 * @param {Array<IInCondition>} inConditions in条件数据
 * @returns {object} 查询参数
 */
export function generateInQueryParams(inConditions: Array<IInCondition>) {
	let result = {};
	for (let conditon of inConditions) {
		let keys = Object.keys(conditon);
		for (let key of keys) {
			result[key] = conditon[key];
		}
	}

	if (Object.keys(result).length > 0) {
		return {
			in: result
		};
	} else {
		return {};
	}
}
