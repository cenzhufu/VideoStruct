import { combineReducers } from 'redux';
import * as is from 'is';

let allreduces = {};

// 加载src下所有的***.rerduce.ts
// 需要export default
let reduceFiles = require.context('../../../src', true, /\.reduces\.ts/);
reduceFiles.keys().forEach((key) => {
	// 需要是reducer函数
	if (is.function(reduceFiles(key).default)) {
		// 扩展
		allreduces = {
			...allreduces,
			[reduceFiles(key).default.toString()]: reduceFiles(key).default
		};
	}
});

// 获取所有的reducer
export default combineReducers(allreduces);
