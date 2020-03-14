import { ProxyTool } from 'stutils/proxy';
import { IFAreaInfo, IFDeviceInfo } from 'sttypedefine';
import { FDeviceInfoProxy } from '../device';

// export const BAreaInfoProxy: ProxyHandler<IBAreaInfo> = {
// 	get: function getAreaInfoProperty(
// 		target: IBAreaInfo,
// 		property: string,
// 		receiver?: any
// 	) {
// 		let stringProperties = ['name', 'created', 'updated', 'node_type'];
// 		let stringOrNumberProperties = ['parentId', 'id'];
// 		let deviceProperty = 'nextList';
// 		let childrenProperty = 'childList';

// 		if (stringProperties.indexOf(property) !== -1) {
// 			return ProxyTool.getStringProperty(target, property, receiver);
// 		}

// 		if (stringOrNumberProperties.indexOf(property) !== -1) {
// 			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
// 		}

// 		if (childrenProperty === property) {
// 			return ProxyTool.getArrayProperty(target, property, receiver, {
// 				valueTypeRight: function(list: Array<IBAreaInfo>) {
// 					let results: Array<IBAreaInfo> = [];
// 					for (let item of list) {
// 						results.push(new Proxy(item, BAreaInfoProxy));
// 					}

// 					return results;
// 				}
// 			});
// 		}

// 		if (deviceProperty === property) {
// 			return ProxyTool.getArrayProperty(target, property, receiver, {
// 				valueTypeRight: function(list: Array<IBDeviceInfo>) {
// 					let results: Array<IBDeviceInfo> = [];
// 					for (let item of list) {
// 						results.push(new Proxy(item, BDeviceInfoProxy));
// 					}

// 					return results;
// 				}
// 			});
// 		}

// 		return ProxyTool.getUnknownProperty(target, property, receiver);
// 	},
// 	getPrototypeOf: function getPrototypeOfBAreaInfo(target: IBAreaInfo) {
// 		return target;
// 	}
// };

export const FAreaInfoProxy: ProxyHandler<IFAreaInfo> = {
	get: function getAreaInfoProperty(
		target: IFAreaInfo,
		property: string,
		receiver?: any
	) {
		let stringProperties = ['title'];
		let stringOrNumberProperties = ['parentId', 'id'];
		let deviceProperty = 'cameraList';
		let childrenProperty = 'children';

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (stringOrNumberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
		}

		if (childrenProperty === property) {
			return ProxyTool.getArrayProperty(target, property, receiver, {
				valueTypeRight: function(list: Array<IFAreaInfo>) {
					let results: Array<IFAreaInfo> = [];
					for (let item of list) {
						results.push(new Proxy(item, FAreaInfoProxy));
					}

					return results;
				}
			});
		}

		if (deviceProperty === property) {
			return ProxyTool.getArrayProperty(target, property, receiver, {
				valueTypeRight: function(list: Array<IFDeviceInfo>) {
					let results: Array<IFDeviceInfo> = [];
					for (let item of list) {
						results.push(new Proxy(item, FDeviceInfoProxy));
					}

					return results;
				}
			});
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	},
	getPrototypeOf: function getPrototypeOfFAreaInfo(target: IFAreaInfo) {
		return target;
	}
};
