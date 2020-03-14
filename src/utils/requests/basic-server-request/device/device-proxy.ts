import { ProxyTool } from 'stutils/proxy';
import { IFDeviceInfo } from 'sttypedefine';

// export const BDeviceInfoProxy: ProxyHandler<IBDeviceInfo> = {
// 	get: function getDeviceInfoProperty(
// 		target: IBDeviceInfo,
// 		property: string,
// 		receiver?: any
// 	) {
// 		let stringProperties = ['created', 'updated', 'ip', 'name', 'port'];
// 		let stringOrNumberProperties = ['id', 'areaId'];

// 		if (stringProperties.indexOf(property) !== -1) {
// 			return ProxyTool.getStringProperty(target, property, receiver);
// 		}

// 		if (stringOrNumberProperties.indexOf(property) !== -1) {
// 			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
// 		}

// 		return ProxyTool.getUnknownProperty(target, property, receiver);
// 	},
// 	getPrototypeOf: function getPrototypeOfBDeviceInfo(target: IBDeviceInfo) {
// 		return target;
// 	}
// };

export const FDeviceInfoProxy: ProxyHandler<IFDeviceInfo> = {
	get: function getDeviceInfoProperty(
		target: IFDeviceInfo,
		property: string,
		receiver?: any
	) {
		let stringProperties = ['name'];
		let stringOrNumberProperties = ['id', 'areaId'];

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (stringOrNumberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	},
	getPrototypeOf: function getPrototypeOfFDeviceInfo(target: IFDeviceInfo) {
		return target;
	}
};
