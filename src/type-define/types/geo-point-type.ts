import * as is from 'is';

export interface IFGeoPoint {
	lat: number | undefined; // 维度
	lng: number | undefined; // 经度
}

function valid(value?: string | number) {
	return is.string(value) || is.number(value);
}

export function generateGeoPoint(
	lat?: number | string,
	lng?: number | string
): string | null {
	if (valid(lat) && valid(lng)) {
		return `POINT(${lng} ${lat})`;
	} else {
		return null;
	}
}
