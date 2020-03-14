import {
	generateAllFilterCondition,
	FilterOperator,
	generateFilterCondition
} from '../src/util/filtration-condition';

describe('normal filter condition', () => {
	test('all normal than', () => {
		expect(
			generateAllFilterCondition('key1', [
				{
					operator: FilterOperator.GreatThan,
					value: 'value1'
				},
				{
					operator: FilterOperator.LessThan,
					value: 'value2'
				},
				{
					operator: FilterOperator.GreatEqualThan,
					value: 'value3'
				},
				{
					operator: FilterOperator.LessEqualThan,
					value: 'value4'
				}
			])
		).toEqual({
			key1: [
				{
					[FilterOperator.GreatThan]: 'value1',
					[FilterOperator.LessThan]: 'value2',
					[FilterOperator.GreatEqualThan]: 'value3',
					[FilterOperator.LessEqualThan]: 'value4'
				}
			]
		});
	});

	test('o number', () => {
		expect(
			generateAllFilterCondition('key1', [
				{
					operator: FilterOperator.GreatThan,
					value: 0
				}
			])
		).toEqual({
			key1: [
				{
					[FilterOperator.GreatThan]: 0
				}
			]
		});
	});

	test('void string', () => {
		expect(
			generateAllFilterCondition('key1', [
				{
					operator: FilterOperator.GreatThan,
					value: ''
				}
			])
		).toEqual({});
	});

	test('void string', () => {
		expect(generateFilterCondition(FilterOperator.GreatThan, '')).toBe(null);
	});
});
