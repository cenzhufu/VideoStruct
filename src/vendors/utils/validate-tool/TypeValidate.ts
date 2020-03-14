/**
 * 是否字符串类型
 * @param {*} data 待检验的数据
 * @returns {boolean} true表示string类型,false则不是
 */
export function isString(data: any): boolean {
	return typeof data === 'string';
}

/**
 * 是否数字类型
 * @param {*} data 待检验的数据
 * @returns {boolean} true表示是number类型
 */
export function isNumber(data: any): boolean {
	return typeof data === 'number';
}

/**
 * 是否boolean类型
 * @param {*} data 待检测的数据
 * @returns {boolean} true表示是boolean类型
 */
export function isBoolean(data: any): boolean {
	return typeof data === 'boolean';
}

/**
 * 是不是null
 * @param {*} data 待检测的数据
 * @returns {boolean} true表示null
 */
export function isNull(data: any): boolean {
	return data === null;
}

/**
 * 是否undefined
 * @param {*} data 待检测的数据
 * @returns {boolean} true表明是undefined
 */
export function isUndefined(data: any): boolean {
	return typeof data === 'undefined';
}

/**
 * 是不是函数
 * @export
 * @param {*} data 待检测的数据
 * @returns {boolean} true表明是函数
 */
export function isFunction(data: any): boolean {
	return typeof data === 'function';
}

/**
 * 是不是数组
 * @param {*} data 待检测的数据
 * @returns {boolean} true表示array
 */
export function isArray(data: any): boolean {
	return data instanceof Array;
}

/**
 * 是不是数组（严格意义）
 * @param {*} data 待检测的数据
 * @returns {boolean} true表示是Array
 */
export function isExactArray(data: any): boolean {
	return Array.isArray(data);
}

/**
 * 是不是object
 * @param {*} data 待检测的数据
 * @returns {boolean} true表明是object对象
 */
export function isObject(data: any): boolean {
	return data instanceof Object;
}

/**
 * 是不是对象(严格模式)
 * @param {*} data 待检测的数据
 * @returns {boolean} true表示Object
 */
export function isExactObject(data: any): boolean {
	return Object.prototype.toString.call(data) === '[object Object]';
}

/**
 * 判断data的类型
 * @export
 * @param {*} data 待检测的数据
 * @returns {string} 类型的描述字符串
 */
export function getTypeOf(data: any): string {
	let type: string = Object.prototype.toString.call(data);
	let realType = type.substring(8, type.length - 1);
	return realType;
}
