import {
	EAttributeType,
	EAttributeValue,
	IFAttributeProperty
} from './attribute-type';
import { ETargetType } from './../target-type';

// eslint-disable-next-line
export function _generateProperty(
	targetType: ETargetType,
	attributeType: EAttributeType,
	value: EAttributeValue,
	defaultTip: string,
	tipLabelKey: string,
	keyDefaultTip: string,
	keyTipLabelKey: string,
	againstAttributeType: Array<EAttributeType> = [],
	enalbedAttributeType: Array<EAttributeType> = [],
	weight = 1,
	order = 'A'
): IFAttributeProperty {
	return {
		targetType: targetType,
		attributeType: attributeType,
		attributeValue: value,
		uuid: `${attributeType}_${value}`,
		tipLabelKey: tipLabelKey,
		defaultTip: defaultTip,
		againstAttributeType: againstAttributeType,
		enalbedAttributeType: enalbedAttributeType,
		keyTipLabelKey: keyTipLabelKey,
		keyDefaultTip: keyDefaultTip,
		weight: weight,
		order: order,
		subAttributeProperties: []
	};
}
