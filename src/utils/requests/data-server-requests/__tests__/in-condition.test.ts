import {
	generateInCondition,
	IInCondition,
	generateInQueryParams
} from '../src/util/in-condition';

describe('basic in condition test', () => {
	test('normal in condition', () => {
		expect(generateInCondition('key1', [1, 2])).toEqual({
			key1: '1,2'
		});
	});
});

describe('in query params', () => {
	let condition1 = generateInCondition('key1', [1, 2]) as IInCondition;
	let condition2 = generateInCondition('key2', [
		'hello',
		'world'
	]) as IInCondition;

	test('normal in query', () => {
		expect(generateInQueryParams([condition1, condition2])).toEqual({
			in: {
				key1: '1,2',
				key2: 'hello,world'
			}
		});
	});
});
