// 不需要提醒的的error
import IFError from 'ifvendors/utils/error';

class NoNeedTipError extends IFError {
	constructor(message: string = '') {
		super(message);
	}
}

export default NoNeedTipError;
