/**
 * 返回一个函数A，此函数触发的时机为两次调用的间隔大于wait，如果小于wait,则重新等待wait毫秒
 * @export
 * @param {Function} func 需要被包装的函数
 * @param {number} [wait=300] 等待的毫秒数
 * @returns {Function} 函数
 */
export function debounce(func: Function, wait = 300): Function {
	let handle: number | undefined;

	return function debounced(...args: Array<any>) {
		// @ts-ignores
		let self = this;

		if (handle) {
			window.clearTimeout(handle);
			handle = undefined;
		}

		handle = window.setTimeout(() => {
			func.call(self, args);
		}, wait);
	};
}
