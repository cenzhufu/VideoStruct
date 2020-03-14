import { createAction } from 'redux-actions';

// 创建一些action creator函数

export const globalCreateActionHello = createAction(
	'Global_Create_Action',
	() => ({
		inited: true
	}),
	() => ({ admin: true })
);
