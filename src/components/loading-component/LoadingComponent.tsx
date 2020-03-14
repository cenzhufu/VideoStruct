import * as React from 'react';
import * as Loadable from 'react-loadable';
import ModuleStyle from './index.module.scss';
import STComponent from 'stcomponents/st-component';

class LoadingComponent extends STComponent<Loadable.LoadingComponentProps> {
	state = {};

	static getDerivedStateFromProps(
		props: Loadable.LoadingComponentProps,
		state: {}
	) {
		if (props.error) {
			console.error(props.error);
		}
		return null;
	}

	render() {
		return <div className={ModuleStyle['component-loading']}>加载中...</div>;
	}
}

export default LoadingComponent;
