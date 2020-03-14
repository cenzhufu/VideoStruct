import { TypeValidate } from 'ifutils/validate-tool';
import axios, {
	AxiosResponse,
	AxiosRequestConfig,
	AxiosInstance,
	CancelTokenSource
} from 'axios';

// 重新包装一下类型
export interface IFReqestInstance extends AxiosInstance {}
export interface IFCancelTokenSource extends CancelTokenSource {}
export interface IFRequestConfig extends AxiosRequestConfig {}
export interface IFResponse<T = any> extends AxiosResponse<T> {}

/**
 * 配置请求
 * @param  {string} baseUrl base url, 可以为空
 * @param {AxiosStatic} configAxios 需要配置的axios
 * @return {void}         [description]
 */
function configRequest(
	baseUrl: string = '',
	configAxios: IFReqestInstance
): void {}

class RequestClass {
	isCancel: (error: Error) => boolean;
	private _axios: IFReqestInstance;

	constructor(axiosInstance: IFReqestInstance) {
		this._axios = axiosInstance;

		this.isCancel = axios.isCancel;
	}

	/**
	 * 创建一个axios实例
	 * @returns {RequestClass} axios实例
	 */
	static createInstance(): RequestClass {
		let newAxios = axios.create({});
		return new RequestClass(newAxios);
	}

	/**
	 * 通用请求接口
	 * @param {IFRequestConfig} config 配置项
	 * @returns {Promise<IFResponse<any>>} response
	 * @memberof RequestClass
	 */
	request(config: IFRequestConfig): Promise<IFResponse<any>> {
		return this._axios(config);
	}

	/**
	 * 发送get请求
	 * @param  {string} url    url地址
	 * @param {?Object} query 查询
	 * @param  {Partial<IFRequestConfig>} [options={}] axios额外选项
	 * @return {Promise<IFResponse<any>>}        promise对象
	 */
	get(
		url: string,
		query?: Object,
		options: Partial<IFRequestConfig> = {}
	): Promise<IFResponse<any>> {
		let realUrl = url;
		// 添加querystring
		if (query && TypeValidate.isExactObject(query)) {
			let keys = Object.keys(query);
			let queryItems = [];
			for (let key of keys) {
				let value = query[key];
				// 过滤value的类型
				if (
					TypeValidate.isBoolean(value) ||
					TypeValidate.isString(value) ||
					TypeValidate.isNumber(value)
				) {
					let itemstring = `${encodeURIComponent(key)}=${encodeURIComponent(
						value
					)}`;
					queryItems.push(itemstring);
				}
			}
			if (queryItems.length > 0) {
				let querystring = queryItems.join('&');
				realUrl = `${realUrl}?${querystring}`;
			}
		}
		configRequest('', this._axios);

		let promise: Promise<IFResponse<any>> = this._axios.get(realUrl, {
			...options
		});

		return promise;
	}

	/**
	 * 发送post请求
	 * @param  {string} url        url地址
	 * @param  {any} [data={}]    数据
	 * @param  {Partial<IFRequestConfig>} [options={}] 额外选项
	 * @return {Promise<IFResponse<any>>}              [description]
	 */
	post(
		url: string,
		data: any = {},
		options: Partial<IFRequestConfig> = {}
	): Promise<IFResponse<any>> {
		let realUrl = url;

		configRequest('', this._axios);

		let promise: Promise<IFResponse<any>> = this._axios.post(realUrl, data, {
			...options
		});

		return promise;
	}

	/**
	 * 发送delete请求
	 * @param  {string} url     [description]
	 * @param  {IFRequestConfig} [options={}] [description]
	 * @return {Promise<IFResponse<any>>}         [description]
	 */
	delete(
		url: string,
		options: Partial<IFRequestConfig> = {}
	): Promise<IFResponse<any>> {
		let realUrl = url;

		configRequest('', this._axios);

		let promise: Promise<IFResponse<any>> = this._axios.delete(realUrl, {
			...options
		});

		return promise;
	}

	/**
	 * 发送put请求
	 * @param  {string} url        [description]
	 * @param  {any} data       [description]
	 * @param  {IFRequestConfig} options    [description]
	 * @return {Promise<IFResponse<any>>}            [description]
	 */
	put(
		url: string,
		data: any = {},
		options: Partial<IFRequestConfig> = {}
	): Promise<IFResponse<any>> {
		let realUrl = url;

		let promise: Promise<IFResponse<any>> = this._axios.put(realUrl, data, {
			...options
		});

		return promise;
	}

	/**
	 * 给request添加拦截器
	 * @NOTE: 所添加的拦截器按照添加的顺序反向进行调用，底层也是会将这些返回值封装Promise，从而形成链式调用的形式
	 * @param {Function} fullfil (Object) => Object, 接收一个配置，返回另一个配置
	 * @param {Function} reject  [description]
	 * @return {number}  handle， 用来用取消
	 */
	addRequestInterceptor(
		fullfil?: (
			value: IFRequestConfig
		) => IFRequestConfig | Promise<IFRequestConfig>,
		reject?: (err: any) => any
	): number {
		return this._axios.interceptors.request.use(fullfil, reject);
	}

	/**
	 * 移除handle对应的request拦截器
	 * @param  {number} handle 可通过addRequestInterceptor返回值获得
	 * @return {void}        [description]
	 */
	removeRequestInterceptor(handle: number): void {
		this._axios.interceptors.request.eject(handle);
	}

	/**
	 * 添加responese拦截器
	 * @NOTE: 所添加的拦截器按照添加的顺序进行调用，底层也是会将这些返回值封装Promise，从而形成链式调用的形式
	 * @param {[type]} fullfil [description]
	 * @param {Promise<Error>} reject  [description]
	 * @return {number} handle， 用来用取消
	 */
	addResponeseInterceptor(
		fullfil: (obj: IFResponse) => IFResponse | Promise<IFResponse>,
		reject?: (err: any) => any
	): number {
		return this._axios.interceptors.response.use(fullfil, reject);
	}

	/**
	 * 移除handle对应的responese拦截器
	 * @param  {number} handle 可通过addResponeseInterceptor返回值获得
	 * @return {void}         [description]
	 */
	removeResponeseInterceptor(handle: number): void {
		this._axios.interceptors.response.eject(handle);
	}

	/**
	 * 获得可取消的handle
	 * @returns {IFCancelTokenSource} IFCancelTokenSource
	 * @memberof RequestClass
	 */
	getCancelSource(): IFCancelTokenSource {
		const CancelToken = axios.CancelToken;
		return CancelToken.source();
	}
}

let defaultAxios = axios.create({});
const IFRequest = new RequestClass(defaultAxios);

export { IFRequest, RequestClass };
