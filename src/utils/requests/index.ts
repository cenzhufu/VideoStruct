import IFRequest from 'ifutils/requests';

import UrlMapInterceptor from './interceptors/responeses/urlmap-interceptor';
import UriPrefixInterceptor from './interceptors/responeses/uriprefix-interceptor';
// import UriThumbInterceptor from './interceptors/responeses/url-thumb-interceptor';

import {
	ErrorCodeInterceptorForNormal,
	ErrorCodeInterceptorForUnnormal
} from './interceptors/responeses/err-code-interceptor';

import AuthTokenInterceptor from './interceptors/requests/authtoken-interceptor';
import UrlRequestMapInterceptor from './interceptors/requests/url-map-interceptor';

IFRequest.addRequestInterceptor(AuthTokenInterceptor);
IFRequest.addRequestInterceptor(UrlRequestMapInterceptor);

// 统一的判断errCode的处理
IFRequest.addResponeseInterceptor(
	ErrorCodeInterceptorForNormal,
	ErrorCodeInterceptorForUnnormal
);

// uri地址前缀
IFRequest.addResponeseInterceptor(UriPrefixInterceptor);
// 缩略图链接
// IFRequest.addResponeseInterceptor(UriThumbInterceptor);
// 添加url映射
IFRequest.addResponeseInterceptor(UrlMapInterceptor);
