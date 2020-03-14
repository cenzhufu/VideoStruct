import { IFUserRoleInfo } from 'stsrc/type-define';
import { IBUserRoleInfo } from './types';

export function toFUserRoleInfoFromB(
	bUserRoleInfo: IBUserRoleInfo
): IFUserRoleInfo {
	return {
		id: bUserRoleInfo.roleId,
		name: bUserRoleInfo.roleName
	};
}
