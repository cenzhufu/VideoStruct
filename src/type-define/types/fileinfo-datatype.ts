// 文件类型
// 在后台还没有定义的时候，前端用来表示一个数据源类型或文件类型的结构（后面要改）
export interface IFFileInfo {
	id: string;
	name: string;
	sourceSize: string;
	count: number | null; // 搜素结果数量（放在这儿不好，可我不想改了）
}
