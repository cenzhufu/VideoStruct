import IFError from 'ifvendors/utils/error';
import NoNeedTipError from 'stsrc/utils/errors/no-need-tip-error';
import TimeOutError from 'stsrc/utils/errors/time-out-error';
import { NoDetectResultError, EngineOfflineError } from 'stsrc/utils/errors';
import { ETargetType } from 'stsrc/type-define';

const noNeedTipErrorCode: Array<number> = [12000003];

//19000041 : 上传图片简写超时
const timeOutTimeTipErrorCode: Array<number> = [19000041];

// 强制人脸人体检测
const noDetectResultErrorCode: number[] = [19000005];

// 引擎不在线错误
const engineErrorCode: number[] = [19000114];

// code 对应的提示（考虑国际化）
// const errTipMap: {
// 	[code: number]: string;
// } = {};

// 定义后台返回的所有code

/**
 * 获得错误
 * @param {number} code 后台返回的code
 * @param {string} [defaultTip='未知错误'] 默认提示
 * @param {string} [message=''] 接口返回的提示
 * @param {string} [detailMessage=''] 接口返回的详细提示
 * @returns {IFError} 错误
 */
export function getValidError(
	code: number,
	defaultTip: string = '未知错误',
	message: string = '',
	detailMessage: string = ''
): IFError {
	if (noNeedTipErrorCode.indexOf(code) !== -1) {
		return new NoNeedTipError();
	}

	if (timeOutTimeTipErrorCode.indexOf(code) !== -1) {
		return new TimeOutError();
	}

	if (noDetectResultErrorCode.indexOf(code) !== -1) {
		return new NoDetectResultError();
	}

	if (engineErrorCode.indexOf(code) !== -1) {
		let targets: ETargetType[] = detailMessage.split(',') as ETargetType[];
		return new EngineOfflineError(targets);
	}
	return new Error(defaultTip);
}
