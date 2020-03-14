// 后台请求返回的通用结构（登录接口除外）
export interface CommonResponseDataType<T> {
	respCode: number;
	respMessage: string;
	respRemark: string;
	maxPage?: number;
	total?: number;
	data: Array<T> | T;
}

// 通用列表返回的格式
export interface ListType<T> {
	total: number;
	list: Array<T>;
}
