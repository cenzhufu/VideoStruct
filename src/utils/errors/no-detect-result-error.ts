// 不需要提醒的的error
import IFError from 'ifvendors/utils/error';

class NoDetectResultError extends IFError {
	constructor(message: string = '') {
		super(message);
	}
}

export default NoDetectResultError;
