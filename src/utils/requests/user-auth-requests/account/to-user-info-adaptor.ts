import { ValidateTool } from 'ifutils/validate-tool';
import { IFUserInfo } from 'sttypedefine';
import { IBUserInfo, IBUserRoleInfo } from './types';
import { toFUserRoleInfoFromB } from './to-user-role-info-adaptor';

export function toFUserInfoFromB(bUserInfo: IBUserInfo): IFUserInfo {
	return {
		id: bUserInfo.id,
		name: bUserInfo.name,
		account: bUserInfo.account,
		password: bUserInfo.password,
		organization: bUserInfo.organization,
		orgId: bUserInfo.orgId,
		avatarUrl: bUserInfo.imageUrl || '',
		level: bUserInfo.level,

		roleList: ValidateTool.getValidArray(bUserInfo.roleList).map(
			(bUserRoleInfo: IBUserRoleInfo) => {
				return toFUserRoleInfoFromB(bUserRoleInfo);
			}
		),

		isSuperUser: false,
		hasDataAceessAuthority: false,
		hasSettingAuthority: false,
		hasAccountSettingAuthority: false,
		hasUnitSettingAuthority: false,
		hasCameraSettingAuthority: false,
		hasDataManagerAuthority: false,
		hasRecordManagerAuthority: false,

		hasAlarmSettingAuthority: false
	};
}
