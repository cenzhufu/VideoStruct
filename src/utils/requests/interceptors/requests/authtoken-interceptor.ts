import { IFRequestConfig } from 'ifvendors/utils/requests';
import LoginStateManager from 'stutils/login-state';

/**
 * 请求拦截器----授权信息
 * @param {IFRequestConfig} value 请求配置
 * @returns {IFRequestConfig} 请求配置
 */
function AuthTokenInterceptor(value: IFRequestConfig): IFRequestConfig {
	// 添加 授权信息
	if (value.url) {
		// 登录接口除外
		if (value.url.search(/oauth\/token/) === -1) {
			value['headers'] = {
				...(value['headers'] || {}),
				...{
					token: LoginStateManager.getRequestToken()
				}
			};
		}
	}

	return value;
}

export default AuthTokenInterceptor;
