import * as React from 'react';
import L from 'leaflet';
import './leaflet-animated-marker';
import * as _ from 'lodash';
import Config from 'stconfig';
import { isBoolean } from 'util';

interface MarkerProps {
	map?: L.Map;
	data?: [{ lag: number; lng: number }];
	traceImg?: string;
	isTracePlay?: boolean;
}
const mapLocusSpeed = Config.getMapLocusSpeed();

class Trace extends React.Component<MarkerProps> {
	trace = null;
	state = {
		isPlay: true
	};

	componentDidMount() {
		this.trace = L.animatedMarker([], {
			speed: mapLocusSpeed || 6000, // 速度：m/s
			dtime: 0.5,
			onStart: () => {
				this.trace.setIcon(
					L.divIcon({
						className: 'leaflet-marker-wrap leaflet-trace',
						iconAnchor: [48, 90],
						html: `<div class="leaflet-marker-bg1"><img src="${
							this.props.traceImg
						}"></div><span class="leaflet-marker-title">正在前往目的地</span>`
					})
				);
			},
			onEnd: () =>
				this.setState({ isPlay: !this.state.isPlay }, () => {
					this.trace.setIcon(
						L.divIcon({
							className: 'leaflet-marker-wrap leaflet-trace',
							iconAnchor: [48, 90],
							html: `<div class="leaflet-marker-bg1"><img src="${
								this.props.traceImg
							}"></div><span class="leaflet-marker-title">到达目的地</span>`
						})
					);
					if (this.state.isPlay !== this.props.isTracePlay) {
						this.setState({
							isPlay: this.props.isTracePlay
						});
					} else {
						this.props.changeTracePlayStatus();
					}
				})
		});

		if (this.trace) {
			if (!this.props.map) return;
			const myMap = document.querySelector('#leaflet-map');
			myMap.setAttribute('style', 'pointer-events:none');
			let _this = this;
			setTimeout(function() {
				myMap.setAttribute('style', 'pointer-events:auto');
				_this.playOrPause();
			}, 500);
		}

		if (!_.isEmpty(this.props.data)) {
			this.reload();
		}

		if (this.props.map) {
			this.props.map.addLayer(this.trace);
		}
	}

	componentDidUpdate(prevProps: MarkerProps) {
		// 首次异步加载
		if (!prevProps.map) {
			this.props.map.addLayer(this.trace);
		}

		if (!_.isEqual(this.props.data, prevProps.data)) {
			this.reload();
		}

		if (
			isBoolean(this.props.isTracePlay) &&
			prevProps.isTracePlay !== this.props.isTracePlay
		) {
			this.setState(
				{
					isPlay: this.props.isTracePlay
				},
				() => {
					this.playOrPause();
				}
			);
		}
	}

	componentWillUnmount() {
		if (!this.props.map) return;
		this.trace && this.props.map.removeLayer(this.trace);
	}

	reload() {
		// 如果正在播放
		if (this.state.isPlay) {
			this.trace.stop();
		}
		this.trace.setLine(this.props.data);
		this.trace.setLatLng([0, 0]);
	}

	// 播放或暂停动画
	playOrPause = () => {
		// console.log('zml playorpause',this.state.isPlay)
		if (!this.state.isPlay) {
			this.trace.pause();
			this.setState({ isPlay: !this.state.isPlay });
		} else {
			this.trace.start();
			this.setState({ isPlay: !this.state.isPlay });
		}
	};

	render() {
		return null;
	}
}

export default Trace;
