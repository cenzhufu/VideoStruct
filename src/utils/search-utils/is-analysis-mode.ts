import { ETargetType, IFStructuralInfo } from 'stsrc/type-define';
import { getSearchMainType } from './get-main-search-type';

/**
 * 是否是采集模式
 * 1. 没有搜索目标时
 * 2. 搜索的主目标不等于人脸 && 当前查询的是车辆
 * @export
 * @param {ETargetType} currentTargetType  当前查询的类型
 * @param {IFStructuralInfo[]} targetInfoList 搜索目标列表
 * @returns {boolean} true表示是采集模式
 */
export function isAnalysisMode(
	currentTargetType: ETargetType,
	targetInfoList: IFStructuralInfo[]
): boolean {
	let mainType: ETargetType = getSearchMainType(targetInfoList);

	return (
		targetInfoList.length === 0 ||
		(mainType !== ETargetType.Face && currentTargetType === ETargetType.Vehicle)
	);
}
