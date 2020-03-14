export enum HttpMethod {
	POST = 'POST',
	GET = 'GET',
	DELETE = 'DELETE',
	PUT = 'PUT'
}

// 操作的权限
export enum EAuthorityOperator {
	Add = 0, // 新增
	Query = 1, // 查询
	Modify = 2, // 修改
	Delete = 3 // 删除
}

// 操作的信息结构
export interface IFOperationInfo {
	id: string;
	name: string;
	url: string; // 接口url
	method: HttpMethod; // 接口的请求方法， GET, POST等
	rightType: EAuthorityOperator;
}
