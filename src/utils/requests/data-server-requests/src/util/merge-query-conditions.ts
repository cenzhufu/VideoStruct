import { generateInQueryParams, IInCondition } from './in-condition';
import { IBDataQueryConditions } from '../query/query-type';
import { generateEqualParams, EqualCondition } from './equal-condion';
import { generateLikeQueryParams, ILikeCondition } from './like-condition';
import { generateFilterParams, FilterCondition } from './filtration-condition';

/**
 * 由多个查询对象生成一个全新的查询对象
 * @export
 * @param {IBDataQueryConditions[]} conditionParams 查询条件
 * @returns {IBDataQueryConditions} 合并后的查询条件
 */
export function mergetQueryConditionParams(
	conditionParams: IBDataQueryConditions[]
): IBDataQueryConditions {
	return conditionParams.reduce(
		(
			previousValue: IBDataQueryConditions,
			currentValue: IBDataQueryConditions
		) => {
			return mergetTwoQueryConditionParam(previousValue, currentValue);
		},
		{}
	);
}

/**
 * 两两合并
 * @param {IBDataQueryConditions} param1 参数一
 * @param {IBDataQueryConditions} param2 参数二
 * @returns {IBDataQueryConditions} 合并的结果
 */
function mergetTwoQueryConditionParam(
	param1: IBDataQueryConditions,
	param2: IBDataQueryConditions
): IBDataQueryConditions {
	let result: IBDataQueryConditions = {
		...generateInQueryParams(getArray<IInCondition>([param1.in, param2.in])),
		...generateEqualParams(
			flatArray<EqualCondition>(
				getArray<EqualCondition[]>([param1.eq, param2.eq])
			)
		),
		...generateLikeQueryParams(
			flatArray<ILikeCondition>(
				getArray<ILikeCondition[]>([param1.like, param2.like])
			)
		),
		...generateFilterParams(
			getArray<FilterCondition>([param1.filtration, param2.filtration])
		)
	};

	// 移除不必要的

	return result;
}

function getArray<T>(values: Array<T | null | undefined>): Array<T> {
	// @ts-ignore
	return values.filter<T>((item: T | null | undefined) => {
		return !!item;
	});
}

function flatArray<T>(values: Array<Array<T>>): Array<T> {
	let result: Array<T> = [];
	for (let value of values) {
		result.push(...value);
	}

	return result;
}
