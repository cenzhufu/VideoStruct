// 没有权限的error
import IFError from 'ifvendors/utils/error';

class NoAuthorityError extends IFError {
	constructor(message: string = '权限不足') {
		super(message);
	}
}

export default NoAuthorityError;
