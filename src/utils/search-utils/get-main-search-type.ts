import { ETargetType, IFStructuralInfo } from 'stsrc/type-define';

/**
 * 获取搜索的主类型
 * 以第一个有效的类型为准
 * @export
 * @param {IFStructuralInfo[]} targetInfoList 搜索目标列表
 * @returns {ETargetType} 搜索的主类型
 */
export function getSearchMainType(
	targetInfoList: IFStructuralInfo[]
): ETargetType {
	let mainType: ETargetType = ETargetType.Unknown;
	for (let target of targetInfoList) {
		if (target.targetType !== ETargetType.Unknown) {
			mainType = target.targetType;
		}
	}

	return mainType;
}
