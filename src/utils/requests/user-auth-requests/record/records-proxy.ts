import { IFRecordInfo } from './records-type';
import { ProxyTool } from 'stsrc/utils/proxy';

//记录查询代理信息
const FRecordInfoProxy: ProxyHandler<IFRecordInfo> = {
	get: function getRecordInfoProperty(
		target: IFRecordInfo,
		property: string,
		receiver?: any
	) {
		let stringProperties = [
			'account',
			'name',
			'operateTime',
			'organization',
			'description'
		];
		let numberProperties = ['logType'];
		let arrayProperties = 'roleList';

		if (stringProperties.indexOf(property) !== -1) {
			return ProxyTool.getStringProperty(target, property, receiver);
		}

		if (numberProperties.indexOf(property) !== -1) {
			return ProxyTool.getNumberProperty(target, property, receiver);
		}
		// typeof检测类型
		// if (typeof numberProperties === 'number') {
		// 	return ProxyTool.getNumberProperty(target, property, receiver);
		// }

		if (arrayProperties === property) {
			return ProxyTool.getArrayProperty(target, property, receiver, {
				valueTypeRight: function(data: Array<IFRecordInfo>) {
					let results: Array<IFRecordInfo> = [];
					for (let item of data) {
						results.push(new Proxy(item, FRecordInfoProxy));
					}
				}
			});
		}

		return ProxyTool.getUnknownProperty(target, property, receiver);
	}
};

export { FRecordInfoProxy };
