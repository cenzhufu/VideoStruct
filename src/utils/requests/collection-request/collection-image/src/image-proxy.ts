import { IFDetectedStructualInfo, FeatureInfo } from './image-type';
import { ProxyTool } from 'stutils/proxy';

// 特征属性代理
let FeatureInfoProxy: ProxyHandler<FeatureInfo> = {
	get: function getFeatureInfoProperty(
		target: FeatureInfo,
		property: string,
		receiver?: any
	) {
		let stringProperties = ['rect'];
		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	}
};

// 所有特征属性代理
const DetectStructualInfoProxy: ProxyHandler<IFDetectedStructualInfo> = {
	get: function getDetectStructualInfoProperty(
		target: IFDetectedStructualInfo,
		property: string,
		receiver?: any
	) {
		let stringOrNumberProperties = ['id'];
		let stringProperties = ['time', 'uri'];
		let numberProperties = ['faces', 'bodys'];
		let arrayProperties = ['faceList', 'bodyList'];

		if (stringOrNumberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberOrStringProperty(target, property, receiver);
		}

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (numberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberProperty(target, property, receiver);
		}

		if (arrayProperties.indexOf(property) !== -1) {
			return ProxyTool.getArrayProperty(target, property, receiver, {
				valueTypeRight: function valueTypeRight(list: Array<FeatureInfo>) {
					// 添加proxy
					let result: Array<FeatureInfo> = [];

					for (let item of list) {
						result.push(Object.create(new Proxy(item, FeatureInfoProxy)));
					}

					return result;
				}
			});
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	}
};

export { FeatureInfoProxy, DetectStructualInfoProxy };
