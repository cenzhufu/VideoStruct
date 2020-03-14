import {
	generateLikeCondition,
	LikeOperator,
	ILikeCondition,
	generateLikeQueryParams
} from '../src/util/like-condition';

describe('like condtion test', () => {
	test('pre like test', () => {
		expect(
			generateLikeCondition('key1', 'value1', LikeOperator.Prefix)
		).toEqual({
			key1: 'value1*'
		});
	});

	test('post like test', () => {
		expect(
			generateLikeCondition('key1', 'value1', LikeOperator.Postfix)
		).toEqual({
			key1: '*value1'
		});
	});

	test('in like test', () => {
		expect(generateLikeCondition('key1', 'value1', LikeOperator.In)).toEqual({
			key1: '*value1*'
		});
	});
});

describe('in query param test', () => {
	let condition1 = generateLikeCondition(
		'key1',
		'value1',
		LikeOperator.Prefix
	) as ILikeCondition;

	let condition2 = generateLikeCondition(
		'key2',
		'value2',
		LikeOperator.Postfix
	) as ILikeCondition;

	let condition3 = generateLikeCondition(
		'key3',
		'value3',
		LikeOperator.In
	) as ILikeCondition;

	test('normal like query param', () => {
		expect(
			generateLikeQueryParams([condition1, condition2, condition3])
		).toEqual({
			like: [{ key1: 'value1*' }, { key2: '*value2' }, { key3: '*value3*' }]
		});
	});
});
