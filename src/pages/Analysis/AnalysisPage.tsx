import * as React from 'react';
import { match, Switch, Redirect, Route } from 'react-router-dom';
import AuthVerifyRoute from 'stcomponents/auth-verify-route';

import AnalysisProfilePage from './subpages/AnalysisProfilePage';
import AnalysisDetailPage from './subpages/AnalysisDetailPage';
import STComponent from 'stcomponents/st-component';
type PropsType = {
	match: match;
};

class Analysis extends STComponent<PropsType> {
	render() {
		return (
			<Switch>
				<AuthVerifyRoute
					path={`${this.props.match.url}/profile`}
					component={AnalysisProfilePage}
				/>
				<AuthVerifyRoute
					path={`${this.props.match.url}/detail`}
					component={AnalysisDetailPage}
				/>
				<Route
					render={(props) => {
						return (
							<Redirect
								to={{
									pathname: `${this.props.match.url}/profile`
								}}
							/>
						);
					}}
				/>
			</Switch>
		);
	}
}

export default Analysis;
