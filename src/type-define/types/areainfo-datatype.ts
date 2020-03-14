import { ExcludeKeyFrom } from './type-tools';
import { IFDeviceInfo } from './deviceinfo-datatype';

// 区域类型定义

// 区域节点类型(业务逻辑使用)
// export interface IFAreaInfo {
// 	title: string;
// 	id: string;
// 	parentId?: string;
// 	cameraList?: Array<IFDeviceInfo>;
// 	children?: Array<IFAreaInfo>;
// 	count: number | null; // 搜索数量(NOTE: 放在这儿不太好，但是又不想改)

// 	uuid: string; // 充当key
// }

// 基础的树状数据结构
export interface IFTreeNode<ValueType = any> {
	id: string; // id
	parentId: string; // 父节点id
	name: string;
	value: ValueType; // 值
	children: IFTreeNode<ValueType>[];

	parent: IFTreeNode<ValueType> | null; // 指向父节点

	uuid: string;
}

export function getDefaultIFTreeNode<T = any>(value: T): IFTreeNode<T> {
	return {
		id: '',
		parentId: '',
		name: '',
		value: value,
		children: [],
		parent: null,
		uuid: ''
	};
}

export interface IFAreaInfo  // 下边Pick, Exclude只是为了删除IFTreeNode的children, parent属性
	extends ExcludeKeyFrom<IFTreeNode<IFDeviceInfo[]>, 'children' | 'parent'> {
	count: number | null; // 搜索数量(NOTE: 放在这儿不太好，但是又不想改)
	cameraList: IFDeviceInfo[]; // 为了减少代码修改量，我们不是用value，而是继续保持之前使用的cameraList
	level: number; // 层级
	children: IFAreaInfo[];
	parent: IFAreaInfo | null;
	description: string; // 描述信息
}
