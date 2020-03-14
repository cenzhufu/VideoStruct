// 用来提供自定义错误的父类
function IFErrorFunction(message: string = '错误(暂无提示)') {
	// @ts-ignore
	this.message = message;
	// @ts-ignore
	this.name = 'IFError';
}

IFErrorFunction.prototype = new Error();
IFErrorFunction.prototype.constructor = IFErrorFunction;

// 添加这个主要是为了外边不要重复的报错
// @ts-ignore
class IFError extends IFErrorFunction {
	name: string;

	constructor(message: string) {
		super(message);
		this.name = 'IFError';
	}
}

export default IFError;
