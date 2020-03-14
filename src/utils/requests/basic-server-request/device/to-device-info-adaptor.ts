import Config from 'stconfig';
import { IFDeviceInfo, IFGeoPoint, IFAreaInfo } from 'sttypedefine';
import { IBDeviceInfo, getValidDeviceWorkType } from './device-type';
import * as is from 'is';
import * as L from 'leaflet';
import * as _ from 'lodash';

export function convertToLngAndLat(
	geoString?: string /** POINT(a b) */,
	applyOffset?: boolean
): IFGeoPoint {
	if (!is.string(geoString)) {
		return {
			lat: undefined, // 纬度
			lng: undefined
		};
	}
	// TODO: 类型添加
	const mapServer = Config.getMapConfig();
	const flag =
		mapServer &&
		// @ts-ignore
		mapServer.serverUrl &&
		// @ts-ignore
		mapServer.serverUrl[mapServer.mapType] &&
		// @ts-ignore
		mapServer.serverUrl[mapServer.mapType].transforCoordinate;
	let transfLng = 0;
	if (flag) {
		// @ts-ignore
		transfLng = mapServer.serverUrl[mapServer.mapType].transforCoordinate.lng;
	}

	let transfLat = 0;
	if (flag) {
		// @ts-ignore
		transfLat = mapServer.serverUrl[mapServer.mapType].transforCoordinate.lat;
	}

	const reg = /point\((-?[\d.]+)\s(-?[\d.]+)\)/i;

	let lat_lng = geoString ? geoString.match(reg) : null;
	if (!lat_lng) {
		return {
			lat: undefined,
			lng: undefined
		};
	}
	if (!applyOffset) {
		return {
			lat: lat_lng ? Number(lat_lng[2]) : undefined,
			lng: lat_lng ? Number(lat_lng[1]) : undefined
		};
	} else {
		return {
			lat: lat_lng ? Number(lat_lng[2]) + Number(transfLat) : undefined,
			lng: lat_lng ? Number(lat_lng[1]) + Number(transfLng) : undefined
		};
	}
}

/**
 * 转换成业务使用的类型
 * @export
 * @param {IBDeviceInfo} bDeviceInfo 后台接口返回的类型
 * @param {IFAreaInfo} parent 父节点
 * @param {boolean} applyOffset 是否对坐标点应用偏移
 * @returns {IFDeviceInfo} 前端业务使用的类型
 */
export function toFDviceInfoFromBDeviceInfo(
	bDeviceInfo: IBDeviceInfo,
	parent: IFAreaInfo | null,
	applyOffset: boolean = true
): IFDeviceInfo {
	let point = convertToLngAndLat(bDeviceInfo.geoString, applyOffset);
	return {
		id: (bDeviceInfo && bDeviceInfo['id']) || '',
		name: (bDeviceInfo && bDeviceInfo['name']) || '',
		areaId: (bDeviceInfo && bDeviceInfo['areaId']) || '',
		areaName: (bDeviceInfo && bDeviceInfo['areaName']) || '',
		count: 0,
		lat: point.lat,
		lng: point.lng,
		state: 1,
		uuid: 'device_' + (bDeviceInfo && bDeviceInfo['id']) || '',
		loginUser: (bDeviceInfo && bDeviceInfo['loginUser']) || '',
		password: (bDeviceInfo && bDeviceInfo['password']) || '',
		channel: (bDeviceInfo && bDeviceInfo['channel']) || '',

		ip: bDeviceInfo.ip || '',
		port: bDeviceInfo.port || '',

		rtsp: (bDeviceInfo && bDeviceInfo.rtsp) || '',
		captureType: getValidDeviceWorkType(bDeviceInfo && bDeviceInfo.captureType),

		parent: parent
	};
}

// 获取中心点
const maxRadius = 500;
const map = L.map(document.createElement('div'));
function computeCircle(latlngs: Array<[number, number]>) {
	if (latlngs.length === 1) {
		return latlngs[0];
	}
	const bounds = L.latLngBounds(latlngs);
	const center = bounds.getCenter();
	return center;
}
function pick(latlngs: Array<[number, number]>) {
	const a = latlngs.map((origin) => {
		return latlngs.filter(
			(latlng) => map.distance(origin, latlng) <= maxRadius
		);
	});
	return _.maxBy(a, (val) => val.length);
}

export function getCirclePoint(data: IFDeviceInfo[]) {
	if (data.length === 0) {
		const mapServer = Config.getMapConfig();
		return mapServer['mapCenter'];
	}
	const latlngs = data.map((m) => [m.lat, m.lng]);
	const x = pick(latlngs);
	return computeCircle(x as Array<[number, number]>);
}
