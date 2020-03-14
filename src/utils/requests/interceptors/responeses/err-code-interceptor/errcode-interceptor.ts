import { CommonResponseDataType } from 'sttypedefine';
import LoginStateManager from 'stutils/login-state';
// @ts-check
import IFRequest, { IFResponse } from 'ifvendors/utils/requests';
import { ValidateTool, TypeValidate } from 'ifutils/validate-tool';
import { getValidError } from './_errcode-utils';
import * as intl from 'react-intl-universal';
import { UnAuthorizedError } from 'stutils/errors';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
/**
 * 判断请求是否成功（后台约定，code为8位数字，后六位表示状态，前两位表示业务代号
 * @param {number} code 后台返回的状态码
 * @returns {boolean} true表示请求成功
 */
function isRequestSucess(code: number): boolean {
	let strCode = String(code);
	let status = Number.parseInt(strCode.substring(2), 10);
	return status === 0;
}

/**
 * 拦截器---errCode
 * @template T
 * @param {IFResponse<T>} response 响应数据
 * @returns {IFResponse<T>} 响应数据
 */
function ErrorCodeInterceptorForNormal<T = any>(
	response: IFResponse<CommonResponseDataType<T>>
):
	| IFResponse<CommonResponseDataType<T>>
	| Promise<IFResponse<CommonResponseDataType<T>>> {
	let status = response['status']; // Http 状态码
	let responseData: CommonResponseDataType<T> = response['data'];
	if (TypeValidate.isExactObject(responseData)) {
		// data是object对象的
		let errCode: number = responseData['respCode'];

		// eslint-disable-next-line
		if (status == 200 && isRequestSucess(errCode)) {
			// 框架返回/系统定义
			// 成功
			return response;
		} else {
			// eslint-disable-next-line
			if (errCode == 14000002) {
				// TODO: 权限不足
				// 权限不足
			}

			let tip: string = intl.get(`${errCode}`).d(''); // 国际化

			if (!tip) {
				tip = ValidateTool.getValidString(
					responseData['respMessage'] || responseData['respRemark'],
					intl.get('COMMON_UNKNOWN_ERROR').d('未知错误')
				);
			}

			let errMsg = `${tip}`;
			return Promise.reject(
				getValidError(
					errCode,
					errMsg,
					responseData['respMessage'],
					responseData['respRemark']
				)
			);
		}
	} else {
		// eslint-disable-next-line
		if (status == 200) {
			return response;
		} else {
			return Promise.reject(new Error('请求失败(1)'));
		}
	}
}

let timeHandle = 0;
//
function ErrorCodeInterceptorForUnnormal(error: any): any {
	// @ts-ignore
	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		console.error('responese error', error);

		let status = error.response['status']; // Http 状态码
		if (status === 401) {
			// 转跳登录页面

			eventEmiiter.emit(EventType.logout);

			// session也清空
			sessionStorage.clear();

			// TODO: App中的userInfo怎么清空

			if (window.location.href.match(/\/login/)) {
				// do nothing
			} else {
				if (!timeHandle) {
					timeHandle = window.setTimeout(function() {
						// 清空登录态
						LoginStateManager.clearLoginState(); // NOTE: 延迟清空，防止之后页面的重定向直接到了登录页面
						timeHandle = 0;
						window.location.href = '/login';
					}, 1000);
				}

				// 单独处理err
				return Promise.reject(
					new UnAuthorizedError(
						intl
							.get('AUTH_EXPIRED')
							.d('您的账号因长时间未操作或在其他地方登陆，即将退出')
					)
				);
			}
		}
	} else if (error.request) {
		// The request was made but no response was received
		// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
		// http.ClientRequest in node.js
		console.log(error.request);
		return Promise.reject(new Error('网络错误'));
	} else if (IFRequest.isCancel(error)) {
		console.error('请求取消');
	} else {
		// Something happened in setting up the request that triggered an Error
		// @ts-ignore
		console.error('other Error', error.message | '未知错误');
	}

	return Promise.reject(error);
}

export { ErrorCodeInterceptorForNormal, ErrorCodeInterceptorForUnnormal };
