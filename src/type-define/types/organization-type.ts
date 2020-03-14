import { IFTreeNode } from './areainfo-datatype';
import { ExcludeKeyFrom } from './type-tools';

export interface IFOrganizationTree  // 下边Pick, Exclude只是为了删除IFTreeNode的children属性
	extends ExcludeKeyFrom<IFTreeNode<string>, 'children' | 'parent'> {
	level: number; // 层级
	children: IFOrganizationTree[];
	parent: IFOrganizationTree | null;
	description: string; // 描述信息
}
