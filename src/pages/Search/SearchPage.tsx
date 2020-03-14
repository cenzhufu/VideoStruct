import * as React from 'react';
// import SearchSelectDatasourcePage from './views/search-select-datasource-page';
import SearchResultPage from './views/search-result-page';
import { Redirect, Route, Switch, match } from 'react-router-dom';
import AuthVerifyRoute from 'stcomponents/auth-verify-route';
import STComponent from 'stcomponents/st-component';
interface Propstype {
	match: match;
}
class Search extends STComponent<Propstype> {
	render() {
		return (
			<Switch>
				{/* <AuthVerifyRoute
					path={`${this.props.match.url}/datasource`}
					component={SearchSelectDatasourcePage}
				/> */}
				<AuthVerifyRoute
					path={`${this.props.match.url}/result`}
					component={SearchResultPage}
				/>
				<Route
					render={(props) => {
						return (
							<Redirect
								to={{
									pathname: `${this.props.match.url}/result`
								}}
							/>
						);
					}}
				/>
			</Switch>
		);
	}
}

export default Search;
