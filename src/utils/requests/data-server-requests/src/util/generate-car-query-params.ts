import { IBDataQueryConditions } from './../query/query-type';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { ETargetType } from 'stsrc/type-define';
import { ValidFieldKeyForCollectionResult } from 'stsrc/utils/requests/collection-request/collection-analyze-result/types/_innter';
import { CaptureImageListOptions } from '../query/data-query';
import {
	generateEqualCondition,
	EqualCondition,
	generateEqualParams
} from './equal-condion';
import {
	generateInCondition,
	IInCondition,
	generateInQueryParams
} from './in-condition';
import {
	generateAllFilterCondition,
	FilterOperator,
	generateFilterParams
} from './filtration-condition';
import { generateVehicleAttributeConditions } from './generate-attribute-query-condition';
import { mergetQueryConditionParams } from './merge-query-conditions';

export function generateVehicleQueyParams(
	sourceIds: string[],
	options: Partial<CaptureImageListOptions>
): IBDataQueryConditions {
	let inConditions: IInCondition[] = [];
	// source id
	let inSourceIdsConditions: IInCondition | null = generateInCondition(
		ValidFieldKeyForCollectionResult.SourceId,
		sourceIds
	);
	if (inSourceIdsConditions) {
		inConditions.push(inSourceIdsConditions);
	}

	// target type
	if (
		options.currentTargetType &&
		options.currentTargetType !== ETargetType.Unknown
	) {
		let inTargetConditions: IInCondition | null = generateInCondition(
			ValidFieldKeyForCollectionResult.TargetType,
			ValidateTool.getValidArray([options.currentTargetType])
		);
		if (inTargetConditions) {
			inConditions.push(inTargetConditions);
		}
	}

	// source type
	let equalConditions: EqualCondition[] = [];
	if (options.sourceType) {
		let sourceTypeEqualCondition = generateEqualCondition(
			ValidFieldKeyForCollectionResult.SourceType,
			options.sourceType
		);
		if (sourceTypeEqualCondition) {
			equalConditions.push(sourceTypeEqualCondition);
		}
	}

	let attributesConditions: IBDataQueryConditions = generateVehicleAttributeConditions(
		ValidateTool.getValidArray(options.selectedAttributes)
	);
	// equalConditions.push(...attributesConditions);

	let filterConditions = [];

	// 时间过滤
	let filterTimeCondition = generateAllFilterCondition(
		ValidFieldKeyForCollectionResult.DBInsertTimeRange,
		[
			{
				operator: FilterOperator.GreatEqualThan,
				value: options.startDate || ''
			},
			{
				operator: FilterOperator.LessEqualThan,
				value: options.endDate || ''
			}
		]
	);

	if (Object.keys(filterTimeCondition).length > 0) {
		filterConditions.push(filterTimeCondition);
	}

	let result: IBDataQueryConditions = mergetQueryConditionParams([
		generateInQueryParams(inConditions),
		generateEqualParams(equalConditions),
		generateFilterParams(filterConditions),
		attributesConditions
	]);

	return result;
}
