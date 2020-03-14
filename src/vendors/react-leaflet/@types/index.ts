import * as React from 'react';
import * as L from 'leaflet';

export interface MapChildComponentProps {
	map?: L.Map;
}

/* 地图子组件基类，接收 map prop */
export class MapChildComponent<
	P extends MapChildComponentProps
> extends React.Component<P> {}

/** Marker data type */
export interface DivIconOptions extends L.DivIconOptions {
	lat: number;
	lng: number;
	args?: any;
}
