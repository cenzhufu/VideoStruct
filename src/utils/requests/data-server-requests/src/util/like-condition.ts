import * as is from 'is';

export enum LikeOperator {
	In = 'in', // 包含
	Prefix = 'prefix', // 以开头的
	Postfix = 'postfix' // 后缀
}

export interface ILikeCondition {
	[key: string]: string;
}

function _generateLikeConditionValue(
	value: string,
	likeOperator: LikeOperator
) {
	switch (likeOperator) {
		case LikeOperator.In:
			return `*${value}*`;

		case LikeOperator.Prefix:
			return `${value}*`;

		case LikeOperator.Postfix:
			return `*${value}`;

		default:
			return value;
	}
}

/**
 * 生成模糊搜索的条件
 * @export
 * @param {string} key 字段
 * @param {string} value 值
 * @param {LikeOperator} likeOperator 模糊搜索的操作符
 * @returns {(ILikeCondition | null)} like条件或者null
 */
export function generateLikeCondition(
	key: string,
	value: string,
	likeOperator: LikeOperator = LikeOperator.In
): ILikeCondition | null {
	if ((key && value && is.string(key)) || is.string(value)) {
		return {
			[key]: _generateLikeConditionValue(value, likeOperator)
		};
	} else {
		return null;
	}
}

/**
 * 由like条件生成like查询的参数
 * @export
 * @param {ILikeCondition} likeConditions like条件
 * @returns {object} 查询参数
 */
export function generateLikeQueryParams(
	likeConditions: ILikeCondition[]
): object {
	if (likeConditions.length > 0) {
		return {
			like: likeConditions
		};
	} else {
		return {};
	}
}
