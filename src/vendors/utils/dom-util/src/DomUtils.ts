import { TypeValidate } from 'ifvendors/utils/validate-tool';

export type DomHeightCallBack = (height: number) => void;
export interface GetDomHeightOptions {
	callback?: DomHeightCallBack;
	ignoreSelfStyle?: boolean; // 是否忽略自身的样式，如果为true,则表示计算的高度为子元素的高度和
}
class DomUtils {
	/**
	 * 获得节点的高度
	 * @static
	 * @param {HTMLElement} dom dom节点
	 * @param {GetDomHeightOptions} [options={}] 选项
	 * @memberof DomUtils
	 * @returns {void}
	 */
	static getDomTotalHeight(
		dom: HTMLElement,
		options: GetDomHeightOptions = {}
	): void {
		if (!(dom instanceof Node)) {
			throw new Error('参数不是dom节点');
		}

		if (options.ignoreSelfStyle) {
			let fakeNode: HTMLElement = dom.cloneNode(true) as HTMLElement;
			fakeNode.style.position = 'absolute';
			// 先插入再改样式，以防元素属性在createdCallback中被添加覆盖
			if (dom.parentNode) {
				dom.parentNode.insertBefore(fakeNode, dom);
			} else {
				document.body.appendChild(fakeNode);
			}

			fakeNode.style.height = 'auto';
			fakeNode.style.visibility = 'hidden';

			window.requestAnimationFrame(() => {
				let height = fakeNode.getBoundingClientRect().height;
				fakeNode.remove();
				if (TypeValidate.isFunction(options.callback)) {
					// @ts-ignore
					options.callback(height);
				}
			});
		} else {
			window.requestAnimationFrame(() => {
				if (TypeValidate.isFunction(options.callback)) {
					// @ts-ignore
					options.callback(dom.clientHeight);
				}
			});
		}
	}
}

export default DomUtils;
