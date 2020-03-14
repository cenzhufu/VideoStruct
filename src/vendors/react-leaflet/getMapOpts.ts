import 'proj4leaflet';
import Config from 'stconfig';
import { TileLayerProps } from 'react-leaflet';
import * as L from 'leaflet';

export default (): L.MapOptions => {
	const mapServer = Config.getMapConfig();
	const type = mapServer.mapType;
	let opts;
	if (type.includes('baidu')) {
		// url = http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20150518;
		const url = mapServer.serverUrl[type].origin;
		const crs = new L.Proj.CRS(
			'EPSG:900913',
			'+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
			{
				resolutions: (() => {
					const level = 19;
					const res = [];
					res[0] = Math.pow(2, 18);
					for (let i = 1; i < level; i++) {
						res[i] = Math.pow(2, 18 - i);
					}
					return res;
				})(),
				origin: [0, 0],
				bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244])
			}
		);
		const tilemap = L.tileLayer(url, {
			subdomains: ['0', '1', '2'],
			tms: true
		});

		opts = { crs, layers: [tilemap] };
	} else {
		opts = {
			layers: [L.tileLayer(mapServer.serverUrl[type].origin)]
		};
	}

	return opts;
};

export function getTileLayerConfig(): TileLayerProps {
	const mapServer = Config.getMapConfig();
	const type = mapServer.mapType;

	const url = mapServer.serverUrl[type].origin;
	if (type.includes('baidu')) {
		return {
			url: url,
			subdomains: ['0', '1', '2'],
			tms: true
		};
	} else {
		return {
			url: url
		};
	}
}

export function getMapConfigOptions(): L.MapOptions {
	const mapServer = Config.getMapConfig();
	const type = mapServer.mapType;
	if (type.includes('baidu')) {
		const crs = new L.Proj.CRS(
			'EPSG:900913',
			'+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
			{
				resolutions: (() => {
					const level = 19;
					const res = [];
					res[0] = Math.pow(2, 18);
					for (let i = 1; i < level; i++) {
						res[i] = Math.pow(2, 18 - i);
					}
					return res;
				})(),
				origin: [0, 0],
				bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244])
			}
		);
		return {
			crs: crs
		};
	} else {
		return {};
	}
}
