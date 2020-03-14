import { IFStructuralInfo } from './../../type-define/types/structural-info-type';
import { ETargetType } from 'stsrc/type-define';
import { isAnalysisMode } from './is-analysis-mode';

/**
 * 是否搜索模式
 * @param {ETargetType} currentTargetType  当前查询的类型
 * @param {IFStructuralInfo[]} targetInfoList 搜索目标列表
 * @returns {boolean} true表示搜索模式，false表示采集模式
 */
export function isSearchMode(
	currentTargetType: ETargetType,
	targetInfoList: IFStructuralInfo[]
): boolean {
	return !isAnalysisMode(currentTargetType, targetInfoList);
}
