import Config from 'stconfig';

// 权限服务端口号(网关), 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
// const port = 8762;
// 注册中心服务名， 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
const gatewayName = 'ifaas-search';

/**
 * 获得auth服务的请求url
 * @param {string} path 相对路径，前面带有/, 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4980867
 * @returns {string} 请求url
 */
export function getSearchInfoRequestUrl(path: string): string {
	// 这句话不要放在函数外边，因为Config的初始化是异步的
	const hostname = Config.getBaseApiRequestAddress();
	// const hostname = '192.168.31.150';
	return `${
		window.location.protocol
	}//${hostname}:${Config.getBaseApiRequestPort()}/${gatewayName}${path}`;
}
