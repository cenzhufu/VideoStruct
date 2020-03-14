import { ValidateTool } from 'ifutils/validate-tool';
import * as Cookie from 'js-cookie';

export interface LoginStateMemo {
	token: string;
	tokenType: string;
	userId: string;
	expires: number;
	isRemember: boolean;
}

class LoginStateManager {
	/**
	 * 请求header头戴上的token字段的值
	 * @static
	 * @returns {string} token
	 * @memberof LoginStateManager
	 */
	static getRequestToken(): string {
		// 傻逼后台，传入的type又没写对
		// 只能这么写了
		if (this.isKeepLoagin()) {
			return `${'Bearer'} ${Cookie.get('auth-value')}`;
		} else {
			return `${'Bearer'} ${sessionStorage.getItem('auth-value') || ''}`;
		}
	}

	/**
	 * 纯token
	 * @static
	 * @returns {string} token
	 * @memberof LoginStateManager
	 */
	static getToken(): string {
		if (this.isKeepLoagin()) {
			return `${Cookie.get('auth-value')}`;
		} else {
			return sessionStorage.getItem('auth-value') || '';
		}
	}

	/**
	 * 是否已登录(本地判断)
	 * @static
	 * @memberof LoginState
	 * @returns {boolean} true表明已登录
	 */
	static isLoginIn(): boolean {
		let authValue = Cookie.get('auth-value');
		let authType = Cookie.get('auth-type');

		if (!this.isKeepLoagin()) {
			authValue = sessionStorage.getItem('auth-value') || '';
			authType = sessionStorage.getItem('auth-type') || '';
		}

		if (authValue && authType) {
			return true;
		} else {
			return false;
		}
	}

	static getLoginUserId(): string {
		if (this.isKeepLoagin()) {
			return Cookie.get('user-id') || '';
		} else {
			return sessionStorage.getItem('user-id') || '';
		}
	}

	/**
	 * 设置登录态
	 * @static
	 * @param {string} value  cookie的值
	 * @param {string} type 类型
	 * @param {string} userId 用户id
	 * @param {number} [expires=7] 过期时间(单位天)
	 * @param {boolean} [isRemember=true] 是否记住
	 * @memberof LoginState
	 * @returns {void}
	 */
	static setLoginState(
		value: string,
		type: string,
		userId: string,
		expires: number = 7,
		isRemember: boolean = true
	): void {
		// 存放在localoStorage中
		localStorage.setItem('keep-login', JSON.stringify(isRemember));
		let validValid = ValidateTool.getValidString(value);
		let validType = ValidateTool.getValidString(type);
		let validUserId = ValidateTool.getValidString(String(userId));

		if (isRemember) {
			// 存放在cookie里边

			let validExpires = 0;
			let options = {
				path: '/',
				domain: window.location.hostname
			};

			validExpires = ValidateTool.getValidNumber(expires);
			options['expires'] = validExpires;

			Cookie.set('auth-value', validValid, options);
			Cookie.set('user-id', validUserId, options);
			Cookie.set('auth-type', validType, options);
		} else {
			// 不保持登录则则放在session Storage里边
			sessionStorage.setItem('auth-value', validValid);
			sessionStorage.setItem('user-id', validUserId);
			sessionStorage.setItem('auth-type', validType);
		}
	}

	/**
	 * 是否保持登录
	 * @static
	 * @returns {boolean} true则表示保持登录
	 * @memberof LoginStateManager
	 */
	static isKeepLoagin(): boolean {
		let isRemember = localStorage.getItem('keep-login');
		if (!isRemember) {
			return false;
		} else {
			try {
				// @ts-ignore
				let result = JSON.parse(isRemember);
				return !!result;
			} catch (error) {
				console.error(error);
				return false;
			}
		}
	}

	/**
	 * 清空登录态
	 * @static
	 * @memberof LoginState
	 * @param {boolean} [keepLogin=false] 是否不移除keepLogin状态
	 * @returns {void}
	 */
	static clearLoginState(): void {
		//
		let option = {
			path: '/'
		};
		Cookie.remove('auth-value', option);
		Cookie.remove('auth-type', option);
		Cookie.remove('user-id', option);

		localStorage.removeItem('keep-login');

		sessionStorage.removeItem('auth-value');
		sessionStorage.removeItem('auth-type');
		sessionStorage.removeItem('user-id');
	}

	static getLoginStateMemo(): LoginStateMemo | null {
		let token = this.getToken();
		let userId = this.getLoginUserId();
		let tokenType = Cookie.get('auth-type');
		let isRemember = this.isKeepLoagin();

		if (token && userId && tokenType) {
			return {
				token: token,
				tokenType: tokenType,
				userId: userId,
				expires: 7, // TODO: 具体的数值怎么获取
				isRemember: isRemember
			};
		} else {
			return null;
		}
	}
}

export default LoginStateManager;
