import * as L from 'leaflet';
import * as _ from 'lodash';
import { MapChildComponent } from './@types';

interface PolylineProps {
	map?: Readonly<L.Map>;
	options?: L.PolylineOptions;
	data: L.LatLngExpression[];
}

const defOpts: L.PolylineOptions = {
	fill: false,
	weight: 2,
	opacity: 0.8,
	color: '#1890ff',
	dashArray: '5'
};

class Polyline extends MapChildComponent<PolylineProps> {
	private polyline = L.polyline([], { ...defOpts, ...this.props.options });

	componentDidMount() {
		if (!_.isEmpty(this.props.data)) {
			this.polyline.setLatLngs(this.props.data);
		}

		if (this.props.map) {
			this.polyline.addTo(this.props.map);
		}
	}

	componentDidUpdate(prevProps: PolylineProps) {
		// 首次异步加载
		if (!prevProps.map && this.props.map) {
			this.props.map.addLayer(this.polyline);
		}

		if (!_.isEqual(this.props.data, prevProps.data)) {
			this.polyline.setLatLngs(this.props.data);
		}
	}

	componentWillUnmount() {
		if (this.props.map) {
			this.props.map.removeLayer(this.polyline);
		}
	}

	render() {
		return null;
	}
}

export default Polyline;
