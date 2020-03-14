import IFError from 'ifvendors/utils/error';

class TimeOutError extends IFError {
	constructor(message: string = '任务繁忙，解析超时') {
		super(message);
	}
}

export default TimeOutError;
