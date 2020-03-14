import { EUserAuthorityType, IFUserInfo } from 'stsrc/type-define';
import { IBModuleTreeNode, EModuleGroupType } from '../module/module-type';

/**
 * 给userInfo添加授权模块的属性,
 * 初始化其他的前端添加的数据
 * @export
 * @param {IFUserInfo} userInfo 用户信息
 * @param {Array<IBModuleTreeNode>} [moduleList=[]] 模块信息
 * @returns {void}
 */
export function initUserInfoAdditionProperty(
	userInfo: IFUserInfo,
	moduleList: Array<IBModuleTreeNode> = []
): void {
	if (userInfo) {
		// userInfo['authModuleInfoList'] = moduleList;

		// isSuperUser
		if (userInfo.level === EUserAuthorityType.SuperUser) {
			userInfo['isSuperUser'] = true;

			userInfo['hasDataAceessAuthority'] = true;

			// 针对superuser判断
			userInfo['hasUnitSettingAuthority'] = true;
			userInfo['hasDataManagerAuthority'] = true;
			userInfo['hasRecordManagerAuthority'] = true;
			userInfo['hasAccountSettingAuthority'] = true;
			userInfo['hasCameraSettingAuthority'] = true;

			// 是否拥有设置权限
			userInfo['hasSettingAuthority'] = true;
		}

		// 遍历权限list
		for (let moduleInfo of moduleList) {
			_setAuthorityToUserInfo(userInfo, moduleInfo);
		}
	}
}

/**
 * 设置权限
 * @param {IFUserInfo} userInfo 用户信息
 * @param {IBModuleTreeNode} moduleInfo 模块信息(根节点)
 * @returns {void} void
 */
function _setAuthorityToUserInfo(
	userInfo: IFUserInfo,
	moduleInfo: IBModuleTreeNode
) {
	if (userInfo && moduleInfo) {
		switch (moduleInfo.resourceCode) {
			case EModuleGroupType.AdvancedSetting:
				_setSettingAuthority(userInfo, moduleInfo);
				break;

			case EModuleGroupType.RealTimeAlarm:
				_setAlarmAuthority(userInfo, moduleInfo);
				break;

			case EModuleGroupType.DataView: // 数据接入权限
				_setDataViewAuthority(userInfo, moduleInfo);
				break;

			case EModuleGroupType.TargetSearch: // 搜索
				break;

			default:
				break;
		}
	}
}

/**
 * 设置数据查看权限
 * @param {IFUserInfo} userInfo 用户信息
 * @param {IBModuleTreeNode} moduleInfo 模块信息(根节点)
 * @returns {void} void
 */
function _setDataViewAuthority(
	userInfo: IFUserInfo,
	moduleInfo: IBModuleTreeNode
) {
	if (userInfo && moduleInfo) {
		// NOTE: 只判断一层
		let children: Array<IBModuleTreeNode> = moduleInfo.childList || [];
		for (let childModuleInfo of children) {
			switch (childModuleInfo.resourceCode) {
				case EModuleGroupType.DataView_View:
					// userInfo['hasDataAceessAuthority'] = true;
					break;

				case EModuleGroupType.DataView_Access:
					userInfo['hasDataAceessAuthority'] = true;
					break;

				default:
					break;
			}
		}
	}
}

/**
 * 设置设置的权限
 * @param {IFUserInfo} userInfo 用户信息
 * @param {IBModuleTreeNode} moduleInfo 模块信息(根节点)
 * @returns {void} void
 */
function _setSettingAuthority(
	userInfo: IFUserInfo,
	moduleInfo: IBModuleTreeNode
) {
	if (userInfo && moduleInfo) {
		// NOTE: 只判断一层
		let children: Array<IBModuleTreeNode> = moduleInfo.childList || [];
		for (let childModuleInfo of children) {
			switch (childModuleInfo.resourceCode) {
				case EModuleGroupType.AdvancedSetting_Account:
					userInfo['hasAccountSettingAuthority'] = true;
					break;

				case EModuleGroupType.AdvancedSetting_Camera:
					userInfo['hasCameraSettingAuthority'] = true;
					break;

				case EModuleGroupType.AdvancedSetting_Record:
					userInfo['hasRecordManagerAuthority'] = true;
					break;

				case EModuleGroupType.AdvancedSetting_Data:
					userInfo['hasDataManagerAuthority'] = true;
					break;

				case EModuleGroupType.AdvancedSetting_Unit:
					userInfo['hasUnitSettingAuthority'] = true;
					break;

				default:
					break;
			}
		}

		if (
			userInfo['hasUnitSettingAuthority'] ||
			userInfo['hasDataManagerAuthority'] ||
			userInfo['hasRecordManagerAuthority'] ||
			userInfo['hasAccountSettingAuthority'] ||
			userInfo['hasCameraSettingAuthority']
		) {
			// 是否拥有设置权限
			userInfo['hasSettingAuthority'] = true;
		}
	}
}

/**
 * 设置告警设置的权限
 * @param {IFUserInfo} userInfo 用户信息
 * @param {IBModuleTreeNode} moduleInfo 模块信息(根节点)
 * @returns {void} void
 */
function _setAlarmAuthority(
	userInfo: IFUserInfo,
	moduleInfo: IBModuleTreeNode
) {
	if (userInfo && moduleInfo) {
		// NOTE: 只判断一层
		let children: Array<IBModuleTreeNode> = moduleInfo.childList || [];
		let isSuperUser = userInfo['isSuperUser']; // NOTE: 需要提前设置好这个字段
		for (let childModuleInfo of children) {
			switch (childModuleInfo.resourceCode) {
				case EModuleGroupType.RealTimeAlarm_Setting:
					userInfo['hasAlarmSettingAuthority'] = true;
					break;

				default:
					break;
			}
		}

		if (isSuperUser) {
			userInfo['hasAlarmSettingAuthority'] = true;
		}
	}
}
