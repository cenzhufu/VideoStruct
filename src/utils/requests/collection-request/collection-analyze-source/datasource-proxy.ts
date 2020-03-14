import {
	EAnalysisSourceStatus,
	isValidAnalysisStatus,
	getAnalysisStatusTip
} from './analysis-source-status-type';
import { TypeValidate } from 'ifutils/validate-tool';
import {
	IFAnalysisSourceProfileInfo,
	IFAnalysisSourceDetailInfo,
	TaskUserType
} from './datasource-type';
import { ESourceType } from 'sttypedefine';
import { AnalysisTaskInfoProxyHandler } from '../collection-analyze-task/';
import { IFAnalysisTaskInfo } from '../collection-analyze-task';
import { ProxyTool } from 'stutils/proxy';
import StringTool from 'stutils/foundations/string';

import * as intl from 'react-intl-universal';

const TaskUserProxyHander: ProxyHandler<TaskUserType> = {
	get: function getTaskUserProperty(
		target: TaskUserType,
		property: string,
		receiver?: any
	) {
		let stringProperties = [
			'name',
			'account',
			'organization',
			'imageUrl',
			'createTime',
			'updateTime',
			'startTime',
			'endTime'
		];

		let stringOrNumberProperties = ['id', 'orgId'];

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (stringOrNumberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	},
	getPrototypeOf: function getTaskUserPrototypeOf(target: TaskUserType) {
		return target;
	}
};

// 简略信息代理
const AnalysisSourceProfileInfoProxyHandler: ProxyHandler<
	IFAnalysisSourceProfileInfo
> = {
	get: function getAnalysisSourceProfileInfoProperty(
		target: IFAnalysisSourceProfileInfo,
		property: string,
		receiver?: any
	) {
		let stringProperties = ['sourceUrl', 'sourceName'];

		let stringOrNumberProperties = ['id', 'sourceId', 'userId'];

		let numberProperties = ['sourceSize', 'createTime', 'updateTime'];

		if (stringOrNumberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
		}

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (numberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberProperty(target, property, receiver);
		}

		// 枚举类型的值
		if (property === 'sourceType') {
			return ProxyTool.getValidPropertyValue(
				target,
				property,
				(value: any) => {
					if (
						value === ESourceType.Camera ||
						value === ESourceType.Video ||
						value === ESourceType.Zip
					) {
						return true;
					} else {
						return false;
					}
				},
				'SourceTypeEnum',
				ESourceType.Unknown,
				receiver
			);
		}

		/***********前端添加字段 *******************/

		if (property === 'sourceSizeTip') {
			let sourceSize = ProxyTool.getNumberProperty(
				target,
				'sourceSize',
				receiver
			);
			return StringTool.getFileSizeTip(sourceSize);
		}

		if (property === 'createTimeTip') {
			let createTime = ProxyTool.getNumberProperty(target, 'createTime');
			let now = Date.now();

			let past = (now - createTime) / 1000;
			// 转换成对应的字符串
			if (past < 60) {
				return (
					Math.max(1, Number.parseInt(String(past), 10)) +
					intl.get('DATA_SOURCE_DATA_TIP_SECOND').d('秒前')
				);
			} else if (past < 60 * 60) {
				return (
					Math.max(1, Number.parseInt(String(past / 60), 10)) +
					intl.get('DATA_SOURCE_DATA_TIP_MINUTE').d('分钟前')
				);
			} else if (past < 60 * 60 * 24) {
				return (
					Number.parseInt(String(past / (60 * 60)), 10) +
					intl.get('DATA_SOURCE_DATA_TIP_HOUR').d('小时前')
				);
			} else if (past < 60 * 60 * 24 * 7) {
				return intl
					.get('DATA_SOURCE_DATA_TIP_DAY', {
						day: Number.parseInt(String(past / (60 * 60 * 24)), 10)
					})
					.d('天前');
			} else {
				return intl.get('DATA_SOURCE_DATA_TIP_DAY', { day: 7 }).d('7天以前');
			}
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	},
	getPrototypeOf: function getAnalysisSourceProfileInfoPrototypeOf(
		target: IFAnalysisSourceProfileInfo
	) {
		return target;
	}
};

// 详细信息代理
const AnalysisResourceDetailProxyHandler: ProxyHandler<
	IFAnalysisSourceDetailInfo
> = {
	set: function(
		target: IFAnalysisSourceDetailInfo,
		property: string,
		value: any
	) {
		// NOTE: 不让修改
		return false;
	},
	get: function getAnalysisSourceDetailInfoProperty(
		target: IFAnalysisSourceDetailInfo,
		property: string,
		receiver?: any
	) {
		// 只处理详情相对于profile新增的字段信息
		if (property === 'status') {
			return ProxyTool.getValidPropertyValue(
				target,
				property,
				(value: any) => {
					if (TypeValidate.isNumber(value)) {
						// 再次判断是否在enum取值之中
						if (isValidAnalysisStatus(value)) {
							return true;
						} else {
							return false;
						}
					}
					return false;
				},
				'EAnalysisSourceStatus',
				EAnalysisSourceStatus.Unknown,
				receiver
			);
		}

		if (property === 'taskUsers' || property === 'operateUsers') {
			return ProxyTool.getValidPropertyValue(
				target,
				property,
				(value: any) => {
					if (TypeValidate.isExactArray(value)) {
						return true;
					} else {
						return false;
					}
				},
				'Array',
				[],
				receiver,
				{
					valueTypeRight: (arrayValue: Array<TaskUserType>) => {
						// 循环构建proxy
						let result = [];

						for (let item of arrayValue) {
							result.push(Object.create(new Proxy(item, TaskUserProxyHander)));
						}
						return result;
					}
				}
			);
		}

		if (property === 'analyzeTasks') {
			return ProxyTool.getValidPropertyValue(
				target,
				property,
				(value: any) => {
					if (TypeValidate.isExactArray(value)) {
						return true;
					} else {
						return false;
					}
				},
				'Array',
				[],
				receiver,
				{
					valueTypeRight: (arrayValue: Array<IFAnalysisTaskInfo>) => {
						// 循环构建proxy
						let result = [];

						for (let item of arrayValue) {
							result.push(
								Object.create(new Proxy(item, AnalysisTaskInfoProxyHandler))
							);
						}
						return result;
					}
				}
			);
		}

		/*************** 前端添加的字段 ***********************/

		if (property === 'statusTip') {
			let status = ProxyTool.getNumberProperty(target, 'status', receiver);
			return getAnalysisStatusTip(status);
		}

		// @ts-ignore
		return AnalysisSourceProfileInfoProxyHandler.get(target, property, {});
	},
	getPrototypeOf: function getAnalysisSourceDetailInfoPrototypeOf(
		target: IFAnalysisSourceDetailInfo
	) {
		return target;
	}
};

export {
	TaskUserProxyHander,
	AnalysisSourceProfileInfoProxyHandler,
	AnalysisResourceDetailProxyHandler
};
