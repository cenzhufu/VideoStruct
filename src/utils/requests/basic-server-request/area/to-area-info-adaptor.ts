import { TypeValidate, ValidateTool } from 'ifutils/validate-tool';
import { IFAreaInfo, IFDeviceInfo } from 'sttypedefine';
import { IBAreaInfo } from './area-type';
import { toFDviceInfoFromBDeviceInfo } from '../device/to-device-info-adaptor';
/**
 * 将BAreaInfo转换成FAreaInfo
 * @export
 * @param {IBAreaInfo} bAreaInfo 后台的数据结构
 * @param {IFAreaInfo | null} [parent=null] 父节点
 * @param {number} level 当前的层级
 * @returns {IFAreaInfo} 前端业务使用的数据结构
 */
export function toFAreaInfoFromBAreaInfo(
	bAreaInfo: IBAreaInfo,
	parent: IFAreaInfo | null = null,
	level: number = 1
): IFAreaInfo {
	let result: IFAreaInfo = {
		name: (bAreaInfo && bAreaInfo['name']) || '',
		id: (bAreaInfo && bAreaInfo['id']) || '',
		parentId: (bAreaInfo && bAreaInfo['parentId']) || '',
		count: null,
		uuid: 'area_' + (bAreaInfo && bAreaInfo['id']) || '',
		children: [],
		value: [],
		cameraList: [],
		level: level,
		description: ValidateTool.getValidString(bAreaInfo.description),
		parent: parent
	};

	let cameraList: Array<IFDeviceInfo> = [];
	if (bAreaInfo && TypeValidate.isExactArray(bAreaInfo.nextList)) {
		for (let item of bAreaInfo.nextList) {
			cameraList.push(toFDviceInfoFromBDeviceInfo(item, result));
		}
	}
	result['cameraList'] = cameraList;

	let children: Array<IFAreaInfo> = [];
	if (bAreaInfo && TypeValidate.isExactArray(bAreaInfo.childList)) {
		for (let item of bAreaInfo.childList) {
			children.push(toFAreaInfoFromBAreaInfo(item, result, level + 1));
		}
	}
	result['children'] = children;

	return result;
}
