import { ProxyTool } from 'stutils/proxy';
import { ETargetType } from 'sttypedefine';
import { TypeValidate } from 'ifutils/validate-tool';
import { IFAnalysisTaskInfo } from './task-type';
import {
	EAnalysisSourceStatus,
	AnalysisSourceProfileInfoProxyHandler
} from '../collection-analyze-source';
/**
 * 来接AnalysisTaskInfoType类型的hander
 */
const AnalysisTaskInfoProxyHandler: ProxyHandler<IFAnalysisTaskInfo> = {
	get: function getAnalysisTaskInfoProperty(
		target: IFAnalysisTaskInfo,
		property: string,
		receiver?: any
	) {
		let value: any = Reflect.get(target, property);
		let stringProperties = [''];
		let stringOrNumberProperties = ['id', 'userId', 'userId'];
		let numberProperties = ['createTime', 'updateTime', 'analyzeProgress'];

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (numberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberProperty(target, property, receiver);
		}

		if (stringOrNumberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
		}
		// 枚举类型

		if (property === 'analyzeType') {
			return ProxyTool.getValidPropertyValue(
				target,
				property,
				(value: any) => {
					if (TypeValidate.isString(value)) {
						if (value === ETargetType.Face || value === ETargetType.Body) {
							return true;
						} else {
							return false;
						}
					} else {
						return false;
					}
				},
				'ETargetType',
				ETargetType.Unknown,
				receiver
			);
		}

		if (property === 'status') {
			return ProxyTool.getValidPropertyValue(
				target,
				property,
				(value: any) => {
					// 再次判断是否在enum取值之中
					if (
						value === EAnalysisSourceStatus.Waiting ||
						value === EAnalysisSourceStatus.Analysising ||
						value === EAnalysisSourceStatus.RealTimeAnalysis ||
						value === EAnalysisSourceStatus.Finished
					) {
						return true;
					} else {
						return false;
					}
				},
				'EAnalysisSourceStatus',
				EAnalysisSourceStatus.Unknown,
				receiver
			);
		}

		// object类型
		if (property === 'analyzeResource') {
			if (value === undefined || value === null) {
				return value;
			}

			// 对于子对象结构，继续代理
			let proxy = Object.create(
				new Proxy(value, AnalysisSourceProfileInfoProxyHandler)
			);
			return proxy;
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	},
	getPrototypeOf: function getAnalysisTaskInfoTypePrototypeOf(
		target: IFAnalysisTaskInfo
	) {
		return target;
	}
};

export { AnalysisTaskInfoProxyHandler };
