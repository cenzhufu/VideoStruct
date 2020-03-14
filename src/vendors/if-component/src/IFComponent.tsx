import * as React from 'react';

export interface HandleErrorOptions {
	toConsole: boolean; // 是否输入到console中
	showMessage: boolean; // 是否显示message提示
	clearMessage: boolean; // 是否清空之前的提示
}

class IFComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
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

export default IFComponent;

class IFPureComponent<P = {}, S = {}, SS = any> extends React.PureComponent<
	P,
	S,
	SS
> {}

export { IFPureComponent };
