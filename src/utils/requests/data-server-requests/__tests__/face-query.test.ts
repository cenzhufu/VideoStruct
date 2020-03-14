import {
	EGenderValue,
	IFAttributeProperty,
	EColorValue
} from 'sttypedefine/types/attributes/attribute-type';
import { ValidFieldKeyForCollectionResult } from 'stsrc/utils/requests/collection-request/collection-analyze-result/types/_innter';
// import { AllAttributes } from 'stcomponents/attribute-filter-panel/src/attribute-config';
import { generateFaceQueyParams } from '../src/util/generate-face-query-params';
import { FilterOperator } from '../src/util/filtration-condition';
import {
	generateFaceGenderProperty,
	generateBodyClotheColorProperty
} from 'stsrc/type-define';

describe('face query', () => {
	test('time range query', () => {
		expect(
			generateFaceQueyParams(['sourceIds'], {
				startDate: '2008-11-12 20:20:20',
				endDate: '2009-11-12 20:20:20'
				// selectedAttributes: AllAttributes
			})
		).toEqual({
			in: {
				sourceId: 'sourceIds'
			},
			filtration: {
				time: [
					{
						[FilterOperator.GreatEqualThan]: '2008-11-12 20:20:20',
						[FilterOperator.LessEqualThan]: '2009-11-12 20:20:20'
					}
				]
			}
		});
	});

	test('start date query', () => {
		expect(
			generateFaceQueyParams(['sourceIds'], {
				startDate: '2008-11-12 20:20:20',
				endDate: ''
				// selectedAttributes: AllAttributes
			})
		).toEqual({
			in: {
				sourceId: 'sourceIds'
			},
			filtration: {
				time: [
					{
						[FilterOperator.GreatEqualThan]: '2008-11-12 20:20:20'
					}
				]
			}
		});
	});

	test('end date query', () => {
		expect(
			generateFaceQueyParams(['sourceIds'], {
				startDate: '',
				endDate: '2008-11-12 20:20:20'
				// selectedAttributes: AllAttributes
			})
		).toEqual({
			in: {
				sourceId: 'sourceIds'
			},
			filtration: {
				time: [
					{
						[FilterOperator.LessEqualThan]: '2008-11-12 20:20:20'
					}
				]
			}
		});
	});

	test('end date query', () => {
		expect(
			generateFaceQueyParams(['sourceIds'], {
				startDate: '',
				endDate: ''
			})
		).toEqual({
			in: {
				sourceId: 'sourceIds'
			}
		});
	});

	test('attribute range query', () => {
		expect(
			generateFaceQueyParams(['sourceIds'], {
				startDate: '2008-11-12 20:20:20',
				endDate: '2009-11-12 20:20:20',
				selectedAttributes: [
					generateFaceGenderProperty(EGenderValue.Man) as IFAttributeProperty,
					generateFaceGenderProperty(EGenderValue.Woman) as IFAttributeProperty,
					generateBodyClotheColorProperty(
						EColorValue.Black
					) as IFAttributeProperty
				]
			})
		).toEqual({
			eq: [
				{
					[ValidFieldKeyForCollectionResult.Gender]: EGenderValue.Man
				},
				{
					[ValidFieldKeyForCollectionResult.Gender]: EGenderValue.Woman
				}
			],
			in: {
				sourceId: 'sourceIds'
			},
			filtration: {
				time: [
					{
						[FilterOperator.GreatEqualThan]: '2008-11-12 20:20:20',
						[FilterOperator.LessEqualThan]: '2009-11-12 20:20:20'
					}
				]
			}
		});
	});
});
