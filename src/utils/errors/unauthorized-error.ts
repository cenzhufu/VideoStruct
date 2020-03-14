// 没有权限的error
import IFError from 'ifvendors/utils/error';

class UnAuthorizedError extends IFError {
	constructor(message: string = '401') {
		super(message);
	}
}

export default UnAuthorizedError;
