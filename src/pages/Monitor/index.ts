import * as Loadable from 'react-loadable';
import LoadingComponent from 'stcomponents/loading-component';

let config: Loadable.OptionsWithoutRender<any> = {
	loader: async function loader() {
		let result = await import(/* webpackChunkName: "monitor-page" */
		'./MonitorPage');
		return result;
	},
	loading: LoadingComponent
};

export default Loadable(config);

// export * from './MonitorPage';
