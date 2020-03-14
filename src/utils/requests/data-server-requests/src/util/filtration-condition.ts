import * as is from 'is';

export enum FilterOperator {
	GreatThan = '$gt',
	LessThan = '$lt',
	GreatEqualThan = '$gte',
	LessEqualThan = '$lte'
}
export interface SingleFilterConditionValue {
	[key: string]: string | number;
}

/**
 * 生成单个的filter条件
 * @param {FilterOperator} operator 操作符
 * @param {(string | number)} value 值
 * @returns {(SingleFilterConditionValue | null)} 条件
 */
export function generateFilterCondition(
	operator: FilterOperator,
	value: string | number
): SingleFilterConditionValue | null {
	if (
		(operator === FilterOperator.GreatEqualThan ||
			operator === FilterOperator.LessEqualThan ||
			operator === FilterOperator.GreatThan ||
			operator === FilterOperator.LessThan) &&
		((is.string(value) && value) || is.number(value))
	) {
		return { [operator]: value };
	} else {
		return null;
	}
}

export interface FilterCondtion {
	operator: FilterOperator;
	value: string | number;
}

export interface FilterCondition {
	[key: string]: SingleFilterConditionValue[];
}

/**
 * 生成一个key的所有的filter条件
 * @export
 * @param {string} key 字段
 * @param {Array<FilterCondtion>} conditions 条件列表
 * @returns {FilterCondition} 条件
 */
export function generateAllFilterCondition(
	key: string,
	conditions: Array<FilterCondtion>
): FilterCondition {
	let resultCondition = {};
	for (let condition of conditions) {
		let filterCondition = generateFilterCondition(
			condition.operator,
			condition.value
		);
		if (filterCondition) {
			let keys = Object.keys(filterCondition);
			for (let key of keys) {
				resultCondition[key] = filterCondition[key];
			}
		}
	}
	if (Object.keys(resultCondition).length > 0) {
		return { [key]: [resultCondition] };
	} else {
		return {};
	}
}

/**
 * 将filterConditions生成用于请求的参数对象
 * @export
 * @param {FilterCondition[]} filterConditions filterConditions条件
 * @returns {object} object
 */
export function generateFilterParams(filterConditions: FilterCondition[]) {
	let result = {};
	for (let conditon of filterConditions) {
		let keys = Object.keys(conditon);
		for (let key of keys) {
			result[key] = conditon[key];
		}
	}
	if (Object.keys(result).length > 0) {
		return {
			filtration: result
		};
	} else {
		return {};
	}
}
