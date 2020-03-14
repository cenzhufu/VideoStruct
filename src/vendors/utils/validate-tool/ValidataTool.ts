// @ts-check

import {
	isString,
	isExactArray,
	isExactObject,
	isNumber
} from './TypeValidate';

/**
 * 获得一个验证的字符串数据
 * @param {*} data 待验证的数据
 * @param {string} [defaultValue=''] 验证没通过时，返回的默认值
 * @returns {string} 通过验证的数据
 */
export function getValidString(data: any, defaultValue: string = ''): string {
	if (isString(data)) {
		return data;
	} else {
		console.warn(`${data} is not string`);
		if (isString(defaultValue)) {
			return defaultValue;
		} else {
			console.warn(`${defaultValue} is not string`);
			return '';
		}
	}
}

/**
 * 获取一个验证的number
 * @export
 * @param {*} data 待验证的数据
 * @param {number} [defaultValue=0] 默认值
 * @returns {number} 通过验证的number
 */
export function getValidNumber(data: any, defaultValue = 0): number {
	if (isNumber(data)) {
		return data;
	} else {
		console.warn(`${data} is not number`);
		if (isNumber(defaultValue)) {
			return defaultValue;
		} else {
			console.warn(`${defaultValue} is not number`);
			return 0;
		}
	}
}

/**
 * 获得一个验证的数组对象
 * @param {*} data 待验证的数据
 * @param {*} [defaultValue=[]] 默认值
 * @returns {Array<any>} 验证后的数据
 */
export function getValidArray(data: any, defaultValue = []): Array<any> {
	if (isExactArray(data)) {
		return data;
	} else {
		console.warn(`${data} is not array`);
		if (isExactArray(defaultValue)) {
			return defaultValue;
		} else {
			console.warn(`${defaultValue} is not array`);
			return [];
		}
	}
}

/**
 * 获得一个验证后的object对象
 * @export
 * @param {*} data 待验证的数据
 * @param {*} [defaultValue={}] 默认的数据
 * @returns {Object} 验证后的object对象
 */
export function getValidObject(data: any, defaultValue = {}): Object {
	if (isExactObject(data)) {
		return data;
	} else {
		console.warn(`${data} is not object`);
		if (isExactObject(defaultValue)) {
			return defaultValue;
		} else {
			console.warn(`${defaultValue} is not object`);
			return {};
		}
	}
}
