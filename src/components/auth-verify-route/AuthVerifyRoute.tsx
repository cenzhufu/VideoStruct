import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
import LoginStateManager from 'stutils/login-state';
import { RouteProps } from 'react-router';

const isLogin = true;
const AuthVerifyRoute = (props: RouteProps) => {
	let { component: Component, ...rest } = props;

	return (
		<Route
			{...rest}
			render={(props) =>
				// LoginStateManager.isLoginIn() ? (
				isLogin ? (
					// @ts-ignore
					<Component {...props} />
				) : (
						<Redirect
							to={{
								pathname: '/login',
								state: { from: props.location }
							}}
						/>
					)
			}
		/>
	);
};

export default AuthVerifyRoute;
