import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { IBOrganizationTree } from './organization-request';
import { IFOrganizationTree } from 'sttypedefine';

export function toFOrganizationFromB(
	item: IBOrganizationTree,
	parent: IFOrganizationTree | null = null,
	level: number = 1
): IFOrganizationTree {
	let obj: IFOrganizationTree = {
		name: item.orgName,
		id: item.id,
		parentId: item.parentId,
		value: '',
		children: [],
		uuid: item.id,
		description: item.description || '',
		level: level,
		parent: parent
	};

	let children: IBOrganizationTree[] = ValidateTool.getValidArray(
		item.childList
	);
	obj['children'] = children.map((childItem: IBOrganizationTree) => {
		return toFOrganizationFromB(childItem, obj, level + 1);
	});

	return obj;
}
