import * as React from 'react';
import * as L from 'leaflet';
import getMapOpts from './getMapOpts';
import DeviceMarkerCluster from './DeviceMarkerCluster';
import Polyline from './Polyline';
import Trace from './Trace';
import 'leaflet/dist/leaflet.css';
import './style/index.scss';
const isEqual = require('lodash/isEqual');
interface MapProps {
	options: L.MapOptions;
	children: React.ReactNode;
	popCloseCallBack: (event: L.LeafletEvent) => void;
	popOpenCallBack: (event: L.LeafletEvent) => void;
}

function noop() {}

interface MapState {
	map: L.Map;
}

class IFMap extends React.Component<MapProps, MapState> {
	static defaultProps = {
		options: {
			minZoom: 6,
			maxZoom: 18,
			zoom: 9,
			center: [22.648365, 114.102316],
			zoomControl: false,
			attributionControl: false,
			doubleClickZoom: false
		},
		children: null,
		popCloseCallBack: noop,
		popOpenCallBack: noop
	};

	static DeviceMarkerCluster = DeviceMarkerCluster;
	static Polyline = Polyline;
	static Trace = Trace;
	private $map: HTMLElement | any = null;
	componentDidMount() {
		// 实例化map
		let map: L.Map = L.map(
			this.$map,
			Object.assign({}, getMapOpts(), this.props.options)
		);
		setTimeout(function() {
			map.invalidateSize();
		}, 100);

		this.setState({ map });
		const { popCloseCallBack, popOpenCallBack } = this.props;
		map.on('popupclose', function(popEvent: L.LeafletEvent) {
			popCloseCallBack(popEvent);
		});
		map.on('popupopen', function(popEvent: L.LeafletEvent) {
			popOpenCallBack(popEvent);
		});
	}

	componentDidUpdate(prevProps: MapProps) {
		const { center } = prevProps.options;
		if (
			this.props.options.center &&
			!isEqual(center, this.props.options.center)
		) {
			this.state.map.flyTo(this.props.options.center);
		}
	}

	componentWillUnmount() {
		if (this.state.map) {
			this.state.map.remove();
		}
	}

	render() {
		return (
			<div
				className="leaflet-map"
				id="leaflet-map"
				ref={(map) => {
					this.$map = map;
				}}
			>
				{React.Children.map(this.props.children, (child) => {
					if (React.isValidElement(child)) {
						return React.cloneElement(child, this.state);
					} else {
						return child;
					}
				})}
			</div>
		);
	}
}

export default IFMap;
