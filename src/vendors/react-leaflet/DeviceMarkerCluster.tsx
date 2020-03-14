import * as React from 'react';
import * as L from 'leaflet';
// import './leaflet-state-marker';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import Config from 'stconfig';
import * as _ from 'lodash';
import { IFDeviceInfo, ETargetType } from 'stsrc/type-define';
import { DeviceRequests } from 'stsrc/utils/requests/basic-server-request';
import { DataServerRequests } from 'stsrc/utils/requests/data-server-requests';
import { message } from 'antd';
// import * as Immutable from 'immutable';
const isEqual = require('lodash/isEqual');
const mapServer = Config.getMapConfig();

export interface MarkerIconOptions {
	lat: number;
	lng: number;
	name: string;
	id: string;
	state: number;
	count: number;
}

interface ExtendMarkerIconOptions extends L.DivIconOptions {
	point: IFDeviceInfo;
}

interface DeviceMarkerProps {
	map?: L.Map;
	devices: IFDeviceInfo[];
	selectedId?: string; // 选择的摄像头的id
	onViewLive: (deviceId: string) => void;

	currentTargetType: ETargetType;
	maxCount: number;
	autoPan: boolean;
	clusterClickId: string;

	collapseId: string;
	popCloseFlag: boolean; // 是否关闭popup
	// onSelect: (id: string | number) => void; // 选择重合点位摄像头列表的回调
	popCloseCallBack: () => void;

	onClickMarker: (device: IFDeviceInfo, marker: L.Marker) => void; //
	onClickCameraInCluster: (device: IFDeviceInfo) => void; //
	onClickCluster: () => void;

	hasCollapsed: () => void;
	setActiveIcon: (icon: HTMLElement) => void; // TODO: 入参类型确定
	isInPreviewer: boolean;

	// @deprecated
	clickMarkerCallBack: (a, point) => void; // 点击摄像头marker的回调
	clickType: (type: string) => void; //用于判断点击的是单个还是集合
	popAddInfo?: {
		thelayer: object;
		infoHtml: HTMLElement;
	} | null;
}

interface DeviceMarkerState {
	canInsertHtml: boolean;
	collapseId: string;

	prevSelectedId?: string;
}

// NOTE: leaflet.markercluster的事件类型没有定义，暂且帮它补上
interface MarkerClickEvent extends L.LeafletMouseEvent {
	layer: L.Marker;
	// 下边这几个实在是不晓得什么类型
	target: any;
	sourceTarget: any;
	progagatedFrom: any;
}

// NOTE: leaflet.markercluster的事件类型没有定义，暂且帮它补上
interface MarkerClusterClickEvent extends L.LeafletMouseEvent {
	layer: L.MarkerCluster;
	// 下边这几个实在是不晓得什么类型
	target: any;
	sourceTarget: any;
	progagatedFrom: any;
}

function noop() {}
class DeviceMarkerCluster extends React.Component<
	DeviceMarkerProps,
	DeviceMarkerState
> {
	static defaultProps = {
		autoPan: false,
		setActiveIcon: noop,
		clickType: noop,
		clusterClickId: '',
		isInPreviewer: false,
		maxCount: 99,
		devices: [],
		// data: [],
		// onSelect: noop,
		popCloseCallBack: noop,
		clickMarkerCallBack: noop,
		onClickMarker: noop,
		hasCollapsed: noop,
		currentTargetType: ETargetType.Face,
		selectedId: undefined,
		onClickCluster: noop,
		onViewLive: noop,
		onClickCameraInCluster: noop
	};

	private markerClusterGroup: L.MarkerClusterGroup;

	constructor(props: DeviceMarkerProps) {
		super(props);
		this.state = {
			canInsertHtml: true, // 控制cluster点击后是否插入数据
			collapseId: this.props.collapseId,
			prevSelectedId: undefined
		};
	}

	static getDerivedStateFromProps(
		nextProps: DeviceMarkerProps,
		prevState: DeviceMarkerState
	) {
		if (nextProps.selectedId !== prevState.prevSelectedId) {
			return {
				prevSelectedId: nextProps.selectedId
			};
		}

		return null;
	}

	componentDidMount() {
		// let _this = this;
		this.createMarkerCluster();

		if (!_.isEmpty(this.props.devices)) {
			this.loadMarker();
			if (this.props.selectedId) {
				this.toggleMarker(this.props.selectedId);
			}
		}
	}

	limitCount(count: number): string {
		if (count <= 0) {
			return '';
		}
		if (count < this.props.maxCount) {
			return String(count);
		}

		return `${this.props.maxCount}+`;
	}

	componentDidUpdate(
		prevProps: DeviceMarkerProps,
		prevState: DeviceMarkerState
	) {
		// 首次异步加载
		if (!prevProps.map && this.props.map) {
			this.props.map.addLayer(this.markerClusterGroup);
		}

		if (!isEqual(this.props.devices, prevProps.devices)) {
			this.markerClusterGroup.clearLayers();
			this.loadMarker();
			if (this.props.selectedId) {
				this.toggleMarker(this.props.selectedId);
			}
		}

		if (prevProps.collapseId !== this.props.collapseId) {
			this.handleCollapse(this.props.collapseId);
		}

		// 选择的摄像头有修改
		if (
			// eslint-disable-next-line
			this.state.prevSelectedId != undefined &&
			this.state.prevSelectedId !== prevState.prevSelectedId
		) {
			this.toggleMarker(this.state.prevSelectedId);
		}
	}

	//UNSAFE_componentWillReceiveProps(nextProps: DeviceMarkerProps) {
	// if (
	// 	nextProps.popAddInfo &&
	// 	nextProps.popAddInfo.thelayer &&
	// 	!isEqual(this.props.popAddInfo, nextProps.popAddInfo)
	// ) {
	// 	if (nextProps.clusterClickId) {
	// 		const divs = document.getElementsByClassName('collapse-block');
	// 		for (let i = 0, length = divs.length; i < length; i++) {
	// 			if (divs[i].getAttribute('data-id') === nextProps.clusterClickId) {
	// 				divs[i].appendChild(nextProps.popAddInfo.infoHtml);
	// 			}
	// 		}
	// 	} else {
	// 		nextProps.popAddInfo.thelayer.layer
	// 			.bindPopup(nextProps.popAddInfo.infoHtml, {
	// 				closeOnClick: true,
	// 				className: 'leaflet-popup-camera',
	// 				closeButton: false
	// 			})
	// 			.openPopup();
	// 	}
	// }
	// if (this.props.popCloseFlag && !nextProps.popCloseFlag) {
	// 	if (this.props.map) {
	// 		this.props.map.closePopup();
	// 	}
	// }
	// if (this.props.collapseId !== nextProps.collapseId) {
	// 	this.setState({
	// 		collapseId: nextProps.collapseId
	// 	});
	// }
	//}

	componentWillUnmount() {
		if (this.props.map) {
			this.props.map.removeLayer(this.markerClusterGroup);
		}
	}

	toggleMarker(deviceId: string) {
		this.markerClusterGroup.getPopup();
		let layers: L.Marker[] = this.markerClusterGroup.getLayers() as L.Marker[];
		// 找到点击那个marker
		for (let layer of layers) {
			console.log(layer);
			layer.unbindPopup();
			let icon = layer.options.icon as L.DivIcon;
			let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
			let layId = options.point.id;

			if (layId === deviceId) {
				this.props.onClickMarker(options.point, layer);
				this.showCameraInfoPopup(deviceId, layer);
			}
		}
	}

	/**
	 * 创建marker cluster
	 * @return {void}
	 * @memberof MarkerCluster
	 */
	createMarkerCluster() {
		this.markerClusterGroup = L.markerClusterGroup({
			showCoverageOnHover: false, // 悬停集群是否显示集群边界
			zoomToBoundsOnClick: false, // 点击集群是否放大
			maxClusterRadius: 30, // 集群的边界
			// 自定义marker
			iconCreateFunction: (cluster: L.MarkerCluster) => {
				const layers: L.Marker<any>[] = cluster.getAllChildMarkers();
				const count = cluster.getChildCount();
				// const frist: L.Marker = layers[0];
				const selectedG = layers.some((layer) => {
					let icon = layer.options.icon as L.DivIcon;
					let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
					return options.point.state === 2;
				});
				const selectedB = layers.some((layer) => {
					let icon = layer.options.icon as L.DivIcon;
					let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
					return options.point.state === 3;
				});
				const selectedS = layers.some((layer) => {
					let icon = layer.options.icon as L.DivIcon;
					let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
					return options.point.state === 4;
				});

				let cName = '';
				if (selectedG) {
					cName = 'selected_green';
				} else if (selectedB) {
					cName = 'selected_blue';
				} else if (selectedS) {
					cName = 'selected_same';
				}

				let points: IFDeviceInfo[] = [];
				let clusterCount = layers.reduce(function(prev: number, cur: L.Marker) {
					let icon = cur.options.icon as L.DivIcon;
					let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
					points.push(options.point);
					return prev + (options.point.count || 0);
				}, 0);

				return L.divIcon({
					html: `<i class="leaflet-marker-camera multi" title="当前点位包含${count}个重叠的摄像头"></i><span class="leaflet-marker-count ${
						clusterCount ? '' : 'dn'
					}">${this.limitCount(clusterCount)}</span>`,
					className: `leaflet-marker-wrap ${cName}`,
					iconAnchor: [14, 14],
					points: points
				});
			}
		});

		// 点击单个的marker
		this.markerClusterGroup.on('click', (a: MarkerClickEvent) => {
			const targetIcon = a.sourceTarget._icon.childNodes[0];
			this.props.setActiveIcon(targetIcon);
			targetIcon.classList.add('icon-active');

			let icon = a.layer.options.icon as L.DivIcon;
			let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;

			let device: IFDeviceInfo = options.point;

			// 告诉外边
			this.props.onClickMarker(device, a.layer);

			// this.showCameraInfoPopup(device, a.layer);
			// this.props.clickMarkerCallBack(a);

			// if (this.props.map) {
			// 	this.props.map.setView(a.latlng, mapServer.mapZoom.maxZoom); // 放大居中
			// }
		});

		// 点击marker group
		this.markerClusterGroup.on('clusterclick', (a: MarkerClusterClickEvent) => {
			const targetIcon: HTMLElement = a.sourceTarget._icon.childNodes[0];
			this.props.setActiveIcon(targetIcon);
			targetIcon.classList.add('icon-active');

			let layerArr = a.layer.getAllChildMarkers();

			this.showClusterInfoPopup(layerArr, this.props.devices, a.layer);
			this.props.onClickCluster();

			// const html = layerArr.map((layer: L.Marker) => {
			// 	let icon = layer.options.icon as L.DivIcon;
			// 	let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
			// 	const point = options.point;

			// 	let cName = '';

			// 	const str = `<li data-id="${
			// 		point.id
			// 	}" class="${cName}"><div style="height: 40px"  data-id="${
			// 		point.id
			// 	}" class="collapse-title">${point.name}</div><div data-id="${
			// 		point.id
			// 	}" class="collapse-block"></div></li>`;
			// 	return str;
			// });

			// const div = document.createElement('div');
			// const ul = document.createElement('ul');
			// div.className = 'leaflet-camera-wrap';
			// div.innerHTML = `<h5>设备列表 (${layerArr.length})</h5>`;
			// ul.innerHTML = html.join('');

			// ul.onclick = (e: MouseEvent) => {
			// 	const { devices, clickType } = this.props;
			// 	// clickType('single');
			// 	let target: HTMLUListElement = e.target as HTMLUListElement;
			// 	const id = target.getAttribute('data-id');
			// 	// this.handleCollapse(id);

			// 	const point = devices.filter((v) => {
			// 		return v.id === id;
			// 	});

			// 	if (point && point.length) {
			// 		if (this.props.clickMarkerCallBack) {
			// 			if (this.state.canInsertHtml) {
			// 				this.props.clickMarkerCallBack(a, point);
			// 			}
			// 		}
			// 	}
			// };
			// div.appendChild(ul);

			// a.layer
			// 	.bindPopup(div, {
			// 		closeOnClick: true,
			// 		className: 'leaflet-popup-camera',
			// 		closeButton: false
			// 	})
			// 	.openPopup();
		});
	}

	// state 1,红色(单点) 2,绿色 3，紫色 4，黄色 5，红色(终点) 6，绿色(初始点)
	loadMarker() {
		const { devices, isInPreviewer, map } = this.props;
		if (!devices) {
			return;
		}
		let markerLayer: L.Marker[] = [];
		this.props.devices.forEach((deviceInfo: IFDeviceInfo) => {
			if (
				// eslint-disable-next-line
				deviceInfo.lat == undefined ||
				// eslint-disable-next-line
				deviceInfo.lng == undefined ||
				!deviceInfo.state
			) {
				return;
			}

			const pointSelectedState = deviceInfo.state;
			let cName = '';
			switch (pointSelectedState) {
				case 1:
					cName = 'selected_a';
					break;
				case 2:
					cName = 'selected_green';
					break;
				case 3:
					cName = 'selected_blue';
					break;
				case 4:
					cName = 'selected_same';
					break;
				case 5:
					cName = 'selected_red'; // 终点
					break;
				case 6:
					cName = 'selected_green';
					break;
				default:
					break;
			}

			let options: ExtendMarkerIconOptions = {
				html: `<i class="leaflet-marker-camera single" title="${
					deviceInfo.name
				}" data-id="${deviceInfo.id}"></i><span class="leaflet-marker-count ${
					deviceInfo.count ? '' : 'dn'
				}">${this.limitCount(deviceInfo.count || 0)}</span>`,
				className: `leaflet-marker-wrap ${cName}`,
				iconAnchor: [14, 14],
				point: deviceInfo // 记录device info
			};
			let marker = L.marker([deviceInfo.lat, deviceInfo.lng], {
				// @NOTE: 创建时我们使用自定义扩展的对象， 多增加了point属性
				icon: L.divIcon(options)
			});
			this.markerClusterGroup.addLayer(marker);
			markerLayer.push(marker);
		});

		if (isInPreviewer && map) {
			// 解决查看大图左右切换点位消失问题
			map.setView(
				L.latLng(devices[0].lat, devices[0].lng),
				mapServer.mapZoom.maxZoom
			);
		}
		// if (centerPopUpInfo && markerLayer.length > 0) {
		// 	let centerId = centerPopUpInfo.id;
		// 	markerLayer.forEach((layer: L.Marker) => {
		// 		let icon = layer.options.icon as L.DivIcon;
		// 		let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
		// 		let layId = options.point.id;
		// 		if (centerId === layId) {
		// 			let obj = {
		// 				sourceTarget: layer,
		// 				layer: layer
		// 			};
		// 			this.props.clickMarkerCallBack(obj);
		// 		}
		// 	});
		// }
	}
	// 控制收起 换写法 let ele = document.querySelectorAll("div[data-id='"+`${nextProps.collapseId}`+"']");
	handleCollapse = (deviceId: string) => {
		const divs = document.getElementsByClassName('collapse-title');
		for (let i = 0, length = divs.length; i < length; i++) {
			if (divs[i].getAttribute('data-id') === deviceId) {
				// 控制列表展开收起
				const targetClickItemNext = divs[i].nextSibling;

				if (targetClickItemNext) {
					if (targetClickItemNext.classList.contains('block-open')) {
						targetClickItemNext.classList.remove('block-open');
						divs[i].classList.remove('title-open');
						targetClickItemNext.innerHTML = '';
						// this.setState({
						// 	canInsertHtml: false
						// });
						this.props.hasCollapsed();
					} else {
						// 获取信息
						Promise.all([
							DeviceRequests.getDeviceInfo(deviceId),
							DataServerRequests.getTodaySourceStaticResult(deviceId, [
								this.props.currentTargetType
							])
						])
							.then((result: [IFDeviceInfo, number]) => {
								let html = this.createCameraInfoPanel(
									result[0],
									result[1],
									false,
									true
								);
								targetClickItemNext.classList.add('block-open');
								divs[i].classList.add('title-open');
								targetClickItemNext.appendChild(html);

								this.props.onClickCameraInCluster(result[0]);
							})
							.catch((error: Error) => {
								console.error(error);
								message.error(error.message);
							});

						// this.setState({
						// 	canInsertHtml: true
						// });
					}
				}
			} else {
				// 不是目标点击，收起
				const targetClickItemNext = divs[i].nextSibling;
				if (targetClickItemNext) {
					targetClickItemNext.classList.remove('block-open');
					divs[i].classList.remove('title-open');
					targetClickItemNext.innerHTML = '';
				}
			}
		}
	};

	render() {
		return null;
	}

	createClusterInfoPanel(
		layers: L.Marker[],
		devices: IFDeviceInfo[],
		layer: L.Marker
	) {
		const html = layers.map((layer: L.Marker) => {
			let icon = layer.options.icon as L.DivIcon;
			let options: ExtendMarkerIconOptions = icon.options as ExtendMarkerIconOptions;
			const point = options.point;

			let cName = '';

			const str = `<li data-id="${
				point.id
			}" class="${cName}"><div style="height: 40px"  data-id="${
				point.id
			}" class="collapse-title">${point.name}</div><div data-id="${
				point.id
			}" class="collapse-block"></div></li>`;
			return str;
		});

		const div = document.createElement('div');
		const ul = document.createElement('ul');
		div.className = 'leaflet-camera-wrap';
		div.innerHTML = `<h5>设备列表 (${layers.length})</h5>`;
		ul.innerHTML = html.join('');

		ul.addEventListener('click', (e: MouseEvent) => {
			const { devices } = this.props;

			let target: HTMLElement = e.target as HTMLElement;
			const id = target.getAttribute('data-id');

			const point = devices.filter((v) => {
				return v.id === id;
			});

			if (point && point.length) {
				// this.props.onClickMarker(point[0], layer);
				this.handleCollapse(id || '');

				//  this.showCameraInfoPopup(point[0].id, layer);

				// if (this.props.clickMarkerCallBack) {
				// 	if (this.state.canInsertHtml) {
				// 		this.props.clickMarkerCallBack(a, point);
				// 	}
				// }
			}
		});
		div.appendChild(ul);

		return div;
	}

	showClusterInfoPopup(
		children: L.Marker[],
		devices: IFDeviceInfo[],
		layer: L.Marker
	) {
		layer
			.bindPopup(this.createClusterInfoPanel(children, devices, layer), {
				closeOnClick: true,
				className: 'leaflet-popup-camera',
				closeButton: false
			})
			.openPopup();
	}

	createCameraInfoPanel(
		deviceInfo: IFDeviceInfo,
		count: number,
		showTitle: boolean = true,
		showCollapse: boolean = false
	) {
		const container = document.createElement('div');
		container.className = 'single-info';
		const div = document.createElement('div');
		const divSingle = document.createElement('div');
		divSingle.className = 'camera-content-container';

		const checkSpan = document.createElement('span'); //查看视频流
		checkSpan.className = 'view-video';

		const spanWrap = document.createElement('div');
		spanWrap.className = 'span-wrapper';

		div.className = 'leaflet-camera-wrap';
		div.innerHTML = `<h5 class="sgH5">${deviceInfo.name}</h5>`;
		if (showTitle) {
			container.appendChild(div);
		}
		checkSpan.innerHTML = '查看视频流 →';

		divSingle.innerHTML = `<div class='camera-item-info'>
						<p>
							<span class='info-title-span'>所属区域：</span>
							<span class='info-area'>${deviceInfo.areaName}</span>
						</p>
						<p>
							<span class='info-title-span'>今日抓拍：</span>
							<span class='info-capture'>${count}</span>
						</p>
					</div>`;

		checkSpan.addEventListener(
			'click',
			(e) => {
				e.stopPropagation();
				if (deviceInfo.id) {
					this.props.onViewLive(deviceInfo.id);
				}
			},
			false
		);

		const btnSpan = document.createElement('span'); //收起
		btnSpan.className = 'collapse-btn';
		btnSpan.setAttribute('data-id', deviceInfo.id);
		btnSpan.innerText = `收起`;
		btnSpan.addEventListener('click', (e) => {
			e.stopPropagation();
			// TODO:
			this.handleCollapse(deviceInfo.id);
		});

		spanWrap.appendChild(checkSpan);
		if (showCollapse) {
			spanWrap.appendChild(btnSpan);
		}
		divSingle.appendChild(spanWrap);
		container.appendChild(divSingle);

		return container;
	}

	showCameraInfoPopup(deviceId: string, layer: L.Marker) {
		let resqId = deviceId;
		Promise.all([
			DeviceRequests.getDeviceInfo(resqId),
			DataServerRequests.getTodaySourceStaticResult(resqId, [
				this.props.currentTargetType
			])
		])
			.then((res: [IFDeviceInfo, number]) => {
				layer
					.bindPopup(this.createCameraInfoPanel(res[0], res[1]), {
						closeOnClick: true,
						className: 'leaflet-popup-camera',
						closeButton: false
					})
					.openPopup();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	}
}

export default DeviceMarkerCluster;
