import IFComponent, { IFPureComponent } from 'ifvendors/if-component';

export interface HandleErrorOptions {
	toConsole: boolean; // 是否输入到console中
	showMessage: boolean; // 是否显示message提示
	clearMessage: boolean; // 是否清空之前的提示
}

class STComponent<P = {}, S = {}, SS = any> extends IFComponent<P, S, SS> {
	handleError(
		error: Error,
		options: HandleErrorOptions = {
			toConsole: true,
			showMessage: true,
			clearMessage: true
		}
	) {
		// TODO: 统一处理错误
		if (options.toConsole) {
			console.error(error);
		}
	}
}

export class STPureComponent<P = {}, S = {}, SS = any> extends IFPureComponent<
	P,
	S,
	SS
> {}

export default STComponent;
