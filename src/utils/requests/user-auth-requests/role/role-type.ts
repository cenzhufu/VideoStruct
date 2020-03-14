import { IModuleInfo, IBModuleTreeNode } from './../module/module-type';

export interface IRoleInfo {
	id: string;
	name: string;
	cnName: string;
	description: string;
	orgId: string; // 机构id
	moduleNames: Array<IBModuleTreeNode>; // 角色包含的模块
}

export interface IRoleAndModuleInfo extends IRoleInfo {
	moduleInfoList: Array<IModuleInfo>;
	create_by: string;
}

/**
 *
 *参数说明：
		1:根据组织机构进行查询角色列表  默认是这个
		2:根据权限大小查出角色比当前用户权限小的角色列表，小于等于关系
		3:根据权限大小查出角色比当前用户权限小的角色列表，小于关系
 * @export
 * @enum {number}
 */
export enum RoleSearchType {
	SearchByOrg = 1,
	SearchBySameAuthority = 2,
	SearchByLowAuthority = 3
}

export interface RoleSearchPayload {
	id?: string;
	name?: string;
	cnName?: string;
	createTimeStart?: string;
	createTimeEnd?: string;
	description?: string;
	createName?: string;
	orgIdList?: Array<{ orgId: string }>;
	currentPage?: string;
	pageSize?: string;
	type?: string;
	needPage?: boolean;
	config?: RoleSearchType;
}

export interface BUserRoleSearch {
	accountQuantity: number;
	cnName: string;
	createName: string;
	createTime: string;
	description: string;
	id: number;
	name: string;
	orgId: number;
	orgName: string;
	type: number;
}
