/**********************统计有关 ×××××××××××××××××××××××××××××××××××*/

export enum StaticOperator {
	EqualTo = '=', // 等于
	GreatThan = '>', // 大于
	GreatEqualThan = '>=', // 大于等于
	LessThan = '<', // 小于
	LessEqualThan = '<=', // 小于等于
	NotEqual = '!=', // 不等于
	InRange = 'in', // 在范围内
	Exist = 'exist'
}

/**
 * 统计条件
 */
export type Condition = {
	field: string;
	value: any; // 多个值用逗号隔开
	operator: StaticOperator;
};
