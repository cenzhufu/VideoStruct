import { TypeValidate } from 'ifutils/validate-tool';

// 额外参数
export interface IProxyOptions {
	targetTypeError?: () => any;
	valueTypeRight?: (value: any) => any;
	valueTypeError?: () => any;
}

/**
 * 获得属性有效的值
 * @param {object} target object
 * @param {string} property 属性名
 * @param {Function} checker 检测器，返回true表明类型合格
 * @param {string} targetType 类型提示字符串
 * @param {any} defaultValue 默认的值
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 其他选项
 * @returns {any} valid value
 */
export function getValidPropertyValue(
	target: object,
	property: string,
	checker: (value: any) => boolean,
	targetType: string,
	defaultValue: any,
	receiver?: any,
	options: IProxyOptions = {}
): any {
	if (TypeValidate.isObject(target)) {
		let value = Reflect.get(target, property, receiver);
		if (checker(value)) {
			let returnValue = value;
			if (options && TypeValidate.isFunction(options.valueTypeRight)) {
				// @ts-ignore
				returnValue = options.valueTypeRight(returnValue);

				if (!checker(returnValue)) {
					console.error(
						`valueTypeRight should return a ${targetType}, but received a ${TypeValidate.getTypeOf(
							returnValue
						)}`
					);
					returnValue = value;
				}
			}
			return returnValue;
		} else {
			console.error(
				`type error (property ${property} shuould be ${targetType}, but received a ${TypeValidate.getTypeOf(
					value
				)})`,
				target
			);

			let returnValue = defaultValue;
			if (options && TypeValidate.isFunction(options.valueTypeError)) {
				// @ts-ignore
				returnValue = options.valueTypeError();

				if (!checker(returnValue)) {
					console.error(
						`valueTypeError should return a ${targetType} value, but received a ${TypeValidate.getTypeOf(
							returnValue
						)}`
					);

					returnValue = defaultValue;
				}
			}
			return returnValue;
		}
	} else {
		console.error(
			`target type error, should return object value, but received a ${TypeValidate.getTypeOf(
				target
			)}`
		);
		let returnValue = defaultValue;
		if (options && TypeValidate.isFunction(options.targetTypeError)) {
			// @ts-ignore
			returnValue = options.targetTypeError();
			if (!checker(returnValue)) {
				console.error(
					`targetTypeError should return a ${targetType} value, but received a ${TypeValidate.getTypeOf(
						returnValue
					)}`
				);
				returnValue = defaultValue;
			}
		}
		return returnValue;
	}
}

/**
 * get string property的代理
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {string} 值
 */
export function getStringProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): string {
	return getValidPropertyValue(
		target,
		property,
		TypeValidate.isString,
		'string',
		'',
		receiver,
		options
	);
}

/**
 * get number property的代理
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {number} 值
 */
export function getNumberProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): number {
	return getValidPropertyValue(
		target,
		property,
		TypeValidate.isNumber,
		'number',
		-1,
		receiver,
		options
	);
}

/**
 * get boolean property的代理
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {boolean} 值
 */
export function getBooleanProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): boolean {
	return getValidPropertyValue(
		target,
		property,
		TypeValidate.isBoolean,
		'boolean',
		false,
		receiver,
		options
	);
}

/**
 * get object property的代理
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {boolean} 值
 */
export function getObjectProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): object {
	return getValidPropertyValue(
		target,
		property,
		TypeValidate.isExactObject,
		'object',
		{},
		receiver,
		options
	);
}

/**
 * get array property的代理
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {array<any>} 值
 */
export function getArrayProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): Array<any> {
	return getValidPropertyValue(
		target,
		property,
		TypeValidate.isExactArray,
		'array',
		[],
		receiver,
		options
	);
}

/**
 * get number property的代理
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {number} 值
 */
export function getNumberOrStringProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): number {
	return getValidPropertyValue(
		target,
		property,
		function(value: any) {
			return TypeValidate.isString(value) || TypeValidate.isNumber(value);
		},
		'string or number',
		'',
		receiver,
		options
	);
}

/**
 * 可选的string属性
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {number} 值
 */
export function getOptionalStringProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): string {
	return getValidPropertyValue(
		target,
		property,
		function(value: any) {
			return (
				TypeValidate.isNull(value) ||
				TypeValidate.isUndefined(value) ||
				TypeValidate.isString(value)
			);
		},
		'string',
		'',
		receiver,
		options
	);
}

/**
 * 可选的array属性
 * @export
 * @param {object} target object对象
 * @param {string} property 属性名
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 额外的参数
 * @returns {number} 值
 */
export function getOptionalArrayProperty(
	target: object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): string {
	return getValidPropertyValue(
		target,
		property,
		function(value: any) {
			return (
				TypeValidate.isNull(value) ||
				TypeValidate.isUndefined(value) ||
				TypeValidate.isArray(value)
			);
		},
		'array',
		[],
		receiver,
		options
	);
}

/**
 * 未知的属性
 * @export
 * @param {object} target object
 * @param {string} property 属性
 * @param {*} [receiver] proxy
 * @param {IProxyOptions} [options={}] 选项
 * @returns {any} any
 */
export function getUnknownProperty(
	target: Object,
	property: string,
	receiver?: any,
	options: IProxyOptions = {}
): any {
	// 过滤掉React查询的属性
	let reactProperties = [
		'_reactFragment',
		Symbol.iterator,
		Symbol.toStringTag,
		'constructor',
		'@@toStringTag',
		'then',
		'children' // antd table有可能需要的字段
	];
	if (reactProperties.indexOf(property) !== -1) {
		return Reflect.get(target, property, receiver);
	} else {
		let value = Reflect.get(target, property, receiver);
		console.error(`unknown property`, property, target);
		return value;
	}
}
