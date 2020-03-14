import { EqualCondition } from './../src/util/equal-condion';
import {
	generateEqualCondition,
	generateEqualParams
} from '../src/util/equal-condion';

describe('normal basic condition', () => {
	test('basic equal condition', () => {
		expect(generateEqualCondition('key1', 'value1')).toEqual({
			key1: 'value1'
		});
	});

	test('null value', () => {
		// @ts-ignore
		expect(generateEqualCondition('key2', null)).toBe(null);
	});

	test('object value', () => {
		// @ts-ignore
		expect(generateEqualCondition('key3', {})).toBe(null);
	});

	test('array value', () => {
		// @ts-ignore
		expect(generateEqualCondition('key3', [])).toBe(null);
	});
});

describe('test equal query params', () => {
	let condition1 = generateEqualCondition('key1', 'value1') as EqualCondition;
	let condition2 = generateEqualCondition('key2', 'value2') as EqualCondition;
	test('basic equal condition', () => {
		expect(generateEqualParams([condition1, condition2])).toEqual({
			eq: [{ key1: 'value1' }, { key2: 'value2' }]
		});
	});
});
