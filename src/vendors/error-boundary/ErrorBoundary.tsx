import * as React from 'react';
import { Button } from 'antd';
import * as intl from 'react-intl-universal';

import './assets/styles/ErrorBoundary.less';

type StateType = {
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
};
export default class ErrorBoundary extends React.Component<any, StateType> {
	constructor(props: any) {
		super(props);
		this.state = {
			error: null,
			errorInfo: null
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Catch errors in any components below and re-render with error message
		this.setState({
			error: error,
			errorInfo: errorInfo
		});
		// You can also log error messages to an error reporting service here
	}

	onGoBack = () => {
		window.location.reload();
	};

	render() {
		if (this.state.errorInfo) {
			// Error path
			return (
				<div className="error-boundary">
					<div className="error-content">
						<div className="error-content-title">
							<span> {intl.get('ERROR').d('出错了')} </span>{' '}
						</div>{' '}
						<p
							style={{
								marginBottom: 15
							}}
						>
							{' '}
							{intl.get('PLEASE_INFORM_ADMINISTRATOR').d('请联系管理员')}{' '}
						</p>{' '}
						<details
							style={{
								whiteSpace: 'pre-wrap',
								overflow: 'hidden'
							}}
						>
							{' '}
							{this.state.error && this.state.error.toString()} <br />{' '}
							{this.state.errorInfo.componentStack}{' '}
						</details>{' '}
					</div>{' '}
					<div className="error-handle">
						<Button
							size="large"
							className="error-handle-button"
							onClick={this.onGoBack}
						>
							{' '}
							{intl.get('RETURN_HOME').d('返回')}{' '}
						</Button>{' '}
					</div>{' '}
					<footer className="error-copyright">
						<p> {intl.get('COPYRIGHT').d('版权')} </p>{' '}
					</footer>{' '}
				</div>
			);
		}
		// Normally, just render children
		return this.props.children;
	}
}

/**
 * 封装ErrorBoundary的高阶组件
 * @exports
 * @param {React.ComponentClass} Component 组件
 * @returns {React.SFC} element
 */
export function withErrorBoundary(Component: React.ComponentClass): React.SFC {
	return function withErrorBoundaryComponent(
		props: React.Props<any>
	): React.ReactElement<any> {
		return (
			<ErrorBoundary>
				<Component {...props} />
			</ErrorBoundary>
		);
	};
}
