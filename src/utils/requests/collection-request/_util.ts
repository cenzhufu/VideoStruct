/* eslint-disable */

import Config from 'stconfig';

// 权限服务端口号(网关), 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
// const collection_port = 8762; // TODO: 测试
// 注册中心服务名， 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
const collection_gatewayName = 'ifaas-collection';

/**
 * 获得auth服务的请求url
 * @param {string} path 相对路径，前面带有/, 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4980867
 * @returns {string} 请求url
 */
export function getCollectionRequestUrl(path: string): string {
	// 这句话不要放在函数外边，因为Config的初始化是异步的
	const hostname = Config.getBaseApiRequestAddress();
	return `${
		window.location.protocol
	}//${hostname}:${Config.getBaseApiRequestPort()}/${collection_gatewayName}${path}`;
}

// 权限服务端口号(网关), 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
// const analysis_port = 8762;
// 注册中心服务名， 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
const analysis_gatewayName = 'ifaas-video-struct-api';
/**
 * 获得auth服务的请求url
 * @param {string} path 相对路径，前面带有/, 可以查看http://192.168.2.150:8090/pages/viewpage.action?pageId=4980867
 * @returns {string} 请求url
 */
export function getAnalysisRequestUrl(path: string): string {
	// 这句话不要放在函数外边，因为Config的初始化是异步的
	const hostname = Config.getBaseApiRequestAddress();
	return `${
		window.location.protocol
	}//${hostname}:${Config.getBaseApiRequestPort()}/${analysis_gatewayName}${path}`;
}
