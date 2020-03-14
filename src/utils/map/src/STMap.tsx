import * as React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngExpression, MapOptions } from 'leaflet';
import {
	getTileLayerConfig,
	getMapConfigOptions
} from 'ifvendors/react-leaflet/getMapOpts';
import ModuleStyle from './index.module.scss';

interface PropsType {
	mapOptions: MapOptions;
}

export default class STMap extends React.Component<PropsType> {
	static defaultProps = {
		mapOptions: {
			minZoom: 6,
			maxZoom: 18,
			zoom: 9,
			center: { lat: 22.648365, lng: 114.102316 },
			zoomControl: false,
			attributionControl: false,
			doubleClickZoom: false
		}
	};
	render() {
		let position: LatLngExpression = { lat: 22.648365, lng: 114.102316 };
		// const position: [number, number] = [51.505, -0.09];
		return (
			<div className={ModuleStyle['map-container']}>
				<Map
					{...this.props.mapOptions}
					{...getMapConfigOptions()}
					center={position}
					className={ModuleStyle['leaflet-map']}
				>
					<TileLayer {...getTileLayerConfig()} attribution="ddd" />
					<Marker position={position}>
						<Popup>
							A pretty CSS3 popup. <br /> Easily customizable.
						</Popup>
					</Marker>
				</Map>
			</div>
		);
	}
}
