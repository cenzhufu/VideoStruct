export function throttle(func: Function, wait: number = 300) {
	let handle: number | undefined;
	let called: boolean = true;

	return function throttled(...args: Array<any>) {
		// @ts-ignore
		let self = this;

		if (!handle) {
			func.call(self, args);
			called = false;

			// 启动定时器
			handle = window.setTimeout(() => {
				// 在时间窗口内是否有调用
				if (called) {
					func.call(self, args);
					called = false;
				}

				window.clearTimeout(handle);
				handle = undefined;
			}, wait);
		} else {
			called = true;
			return;
		}
	};
}
