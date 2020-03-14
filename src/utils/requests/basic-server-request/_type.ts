import { DateFormat } from 'stsrc/type-define';
// 后台树结构

export interface IBTreeStruct<T> {
	id: string;
	parentId: string; // 父节点
	name: string;
	hasChild: boolean; // 是否有孩子
	hasNext: boolean; // 是否有下一代
	childList: Array<IBTreeStruct<T>>; // 孩子
	nextList: Array<T>; //
	countLeaf: number; // 叶子数量
	created: typeof DateFormat;
	updated: typeof DateFormat;
	node_type: string; // 节点类型
}
