// import { ETargetType, ESourceType } from 'sttypedefine';
// import { TypeValidate } from 'ifvendors/utils/validate-tool';
// import { ProxyTool } from 'stutils/proxy';
// import { IBAnalysisResultInfo } from './types/outer';

// export const AnalysisResultInfoProxy: ProxyHandler<IBAnalysisResultInfo> = {
// 	get: function getAnalysisResultInfoProperty(
// 		target: IBAnalysisResultInfo,
// 		property: string,
// 		receiver?: any
// 	) {
// 		let stringProperties = ['targetImage', 'backgroundImage', 'json'];
// 		let stringOrNumberProperties = ['id', 'sourceId', 'orignialImageId'];

// 		if (stringProperties.indexOf(property) !== -1) {
// 			return ProxyTool.getStringProperty(target, property, receiver);
// 		}

// 		if (stringOrNumberProperties.indexOf(property) !== -1) {
// 			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
// 		}

// 		if (property === 'targetType') {
// 			return ProxyTool.getValidPropertyValue(
// 				target,
// 				property,
// 				(value: any) => {
// 					if (TypeValidate.isString(value)) {
// 						if (value === ETargetType.Face || value === ETargetType.Body) {
// 							return true;
// 						} else {
// 							return false;
// 						}
// 					} else {
// 						return false;
// 					}
// 				},
// 				'ETargetType',
// 				ETargetType.Unknown,
// 				receiver
// 			);
// 		}

// 		// 枚举类型的值
// 		if (property === 'sourceType') {
// 			return ProxyTool.getValidPropertyValue(
// 				target,
// 				property,
// 				(value: any) => {
// 					if (
// 						value === ESourceType.Camera ||
// 						value === ESourceType.Video ||
// 						value === ESourceType.Pictural ||
// 						value === ESourceType.Zip
// 					) {
// 						return true;
// 					} else {
// 						return false;
// 					}
// 				},
// 				'SourceTypeEnum',
// 				ESourceType.Unknown,
// 				receiver
// 			);
// 		}

// 		return ProxyTool.getUnknownProperty(target, property, receiver);
// 	},
// 	getPrototypeOf: function getAnalysisResultInfoPrototypeOf(
// 		target: IBAnalysisResultInfo
// 	) {
// 		return target;
// 	}
// };
