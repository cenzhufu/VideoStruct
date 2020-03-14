import Config from 'stconfig';

// 权限服务端口号(网关), 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
// const monitor_port = 8762; //
// 注册中心服务名， 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
const monitor_gatewayName = 'ifaas-monitor';

/**
 * 获得布控服务的请求url
 * @param {string} path 相对路径，前面带有/, 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4980867
 * @returns {string} 请求url
 */
export function getMonitorRequestUrl(path: string): string {
	// 这句话不要放在函数外边，因为Config的初始化是异步的
	const hostname = Config.getBaseApiRequestAddress();
	return `${
		window.location.protocol
	}//${hostname}:${Config.getBaseApiRequestPort()}/${monitor_gatewayName}${path}`;
}
