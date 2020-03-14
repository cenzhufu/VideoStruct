import * as L from 'leaflet';

L.AnimatedMarker = L.Marker.extend({
	options: {
		speed: 15000,
		dtime: 0.5, // 单位s，每段所需时间，用于切段
		autoStart: false,
		onEnd() {
			// dd
		},
		onStart() {
			// dd
		}
	},

	initialize(routes, options) {
		this.isPause = false;
		this._i = 0;
		this.polyline = L.polygon([], {
			fill: false,
			weight: 2,
			opacity: 0.8,
			color: '#576574',
			dashArray: [5]
		});

		L.Marker.prototype.initialize.call(this, [0, 0], options);

		this.setLine(routes);
	},

	onAdd(map) {
		L.Marker.prototype.onAdd.call(this, map);

		map.addLayer(this.polyline);
		if (this.options.autoStart) {
			this.start();
		}
	},

	onRemove(map) {
		L.Marker.prototype.onRemove.call(this, map);

		map.removeLayer(this.polyline);
	},

	animate() {
		if (!this._map) return;
		let len = this._routes.length;
		let time = 0;

		if (len === 0) {
			this.options.onEnd();
			return;
		}

		if (this._i === 0) {
			this.options.onStart();
		}

		if (this._i < len && this._i > 0) {
			time =
				(this._routes[this._i - 1].distanceTo(this._routes[this._i]) /
					this.options.speed) *
				1000;
		}

		if (this._icon) {
			this._icon.style[L.DomUtil.TRANSITION] = 'all ' + time + 'ms linear';
		}
		if (this._shadow) {
			this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + time + 'ms linear';
		}

		this.setLatLng(this._routes[this._i]);
		this._i++;

		this._tid = setTimeout(() => {
			if (this._i === len) {
				this._i = 0;
				this.options.onEnd();
			} else if (!this.isPause) {
				this.animate();
			}
		}, time);
	},

	start() {
		this.isPause = false;
		this.animate();
	},

	stop() {
		this._tid && clearTimeout(this._tid);
		if (this._icon) {
			this._icon.style[L.DomUtil.TRANSITION] = '';
		}

		this._i = 0;
		this.options.onEnd();
	},

	pause() {
		this.isPause = true;
	},

	setLine(routes) {
		if (L.DomUtil.TRANSITION) {
			let routesAssign = routes.map((point) => L.latLng(point));

			this._routes = this._chunk(routesAssign);
			this.polyline.setLatLngs(this._routes);
		} else {
			throw new Error('浏览器版本不支持transition动画');
		}
	},

	_chunk(latlngs) {
		if (latlngs.length === 0) return [];

		let i;
		let len = latlngs.length;
		let distance = this.options.speed * this.options.dtime;
		let chunkedLatLngs = [];

		for (i = 1; i < len; i++) {
			let cur = latlngs[i - 1];
			let next = latlngs[i];
			let dist = cur.distanceTo(next);
			let factor = distance / dist;
			let dLat = factor * (next.lat - cur.lat);
			let dLng = factor * (next.lng - cur.lng);

			chunkedLatLngs.push(cur);

			while (dist > distance) {
				cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
				dist = cur.distanceTo(next);
				chunkedLatLngs.push(cur);
			}
		}
		chunkedLatLngs.push(latlngs[len - 1]);

		return chunkedLatLngs;
	}
});

L.animatedMarker = function(routes, options) {
	return new L.AnimatedMarker(routes, options);
};
