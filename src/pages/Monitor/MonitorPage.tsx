import * as React from 'react';
import { Button, Checkbox, message } from 'antd';
import * as intl from 'react-intl-universal';
import CameraSelectModal from 'stcontainers/camera-select-modal'; //摄像头选择模块
import AccessCameraPanel from './submodules/access-camera-panel'; //摄像头选择模块
import { IFDeviceInfo, IFAreaInfo, ListType } from 'sttypedefine'; //类型定义
import MonitorVideoPlayer from './submodules/monitor-video-player';
import { DeviceRequests } from 'stutils/requests/basic-server-request';
import ModuleStyles from './assets/styles/monitor-page.module.scss';
import { IFActionMonitorInfo } from 'stutils/requests/monitor-request';
import STComponent from 'stcomponents/st-component';

import ThrottlePool from 'ifutils/throttle-pool';

import {
	CollectionCaptureRequests,
	CameraRequestDataType
} from 'stsrc/utils/requests/collection-request';
import { EActionMonitorType } from 'stsrc/utils/requests/monitor-request/src/action-monitor/types';
import { isActionMonitorTopic, IFActionAlarmInfo } from 'stsrc/utils/mqtt';
import { withUserInfo, UserInfoContextType } from 'stsrc/contexts';
import ActionMonitorRequests from 'stsrc/utils/requests/monitor-request/src/action-monitor/action-monitor-requests';

import STMqtt from 'stutils/mqtt';
import { Packet } from 'mqtt';
import { toActionAlarmInfoFromObject } from 'stsrc/utils/mqtt/src/adaptor';
import MonitorInfoPanel from './submodules/monitor-info';
import { guid } from 'ifvendors/utils/guid';

import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { TypeValidate } from 'ifvendors/utils/validate-tool';
const CheckboxGroup = Checkbox.Group;

interface MonitorPropsType extends UserInfoContextType {}

interface MonitorStateType {
	selectedCameraList: Array<IFDeviceInfo>; // 选择的摄像头列表
	maxSelectedCameraCount: number; // 最大选择的摄像头数量
	accessedCameraList: Array<IFDeviceInfo>; // 接入的摄像头列表

	monitorInfoList: IFActionAlarmInfo[];

	monitorTypes: Array<EActionMonitorType>;
	monitorTypeVisible: string;
	monitorIndex: number;

	maxAccessCount: number;
	streamList: Array<string>;
	keys: Array<string>;
}

type ActionAlarmOption = {
	label: string;
	value: EActionMonitorType;
	disabled?: boolean;
};

const SelectTypesKey = 'selected-types__';
class Monitor extends STComponent<MonitorPropsType, MonitorStateType> {
	static defaultProps = {
		time: 0
	};

	idToCameraInfoMap: { [id: string]: IFDeviceInfo }; // id -> cameraInfo
	actionAlarmOptions: Array<ActionAlarmOption>;

	_throttlePool: ThrottlePool; // 节流池

	constructor(props: MonitorPropsType) {
		super(props);

		let maxCount = 4;
		let keys = [];
		for (let i = 0; i < maxCount; i++) {
			keys.push(guid());
		}

		this.idToCameraInfoMap = {};
		this.state = {
			maxAccessCount: maxCount,
			maxSelectedCameraCount: 12,
			keys: keys,
			streamList: [],
			selectedCameraList: [],
			accessedCameraList: [],
			monitorInfoList: [], //告警信息
			monitorTypes: [EActionMonitorType.Ride], //告警类型
			monitorTypeVisible: 'none',
			monitorIndex: 0 //告警列表选中项
		};

		this.actionAlarmOptions = [
			{
				label: intl.get('MONITOR_MESSAGE_TYPE1').d('骑行'),
				value: EActionMonitorType.Ride,
				disabled:
					// eslint-disable-next-line
					this.props.userInfo != undefined &&
					this.props.userInfo.hasAlarmSettingAuthority
			},
			{
				label: intl.get('MONITOR_MESSAGE_TYPE2').d('跌倒'),
				value: EActionMonitorType.FallOver,
				disabled: true
			},
			{
				label: intl.get('MONITOR_MESSAGE_TYPE3').d('人群密集'),
				value: EActionMonitorType.ManyPeople,
				disabled: true
			},
			{
				label: intl.get('MONITOR_MESSAGE_TYPE4').d('人群骚乱'),
				value: EActionMonitorType.Disorder,
				disabled: true
			}
		];
	}

	componentDidMount() {
		// before load的回调
		window.addEventListener('beforeunload', (event) => {
			// 记录到session token中
			sessionStorage.setItem(
				SelectTypesKey,
				JSON.stringify(this.state.monitorTypes)
			);

			STMqtt.getInstance().disconnect();
			// event.returnValue = false;
			// NOTE: important in Chrome
			return '';
		});

		// 开启节流(每秒最多10条)
		this._throttlePool = new ThrottlePool(3, 1, []); // 1
		this._throttlePool.adjustCapability(1000); // 池子的容量1000
		this._throttlePool.outflow((infoList: Array<IFActionAlarmInfo>) => {
			this.handleActionMonitorMessage(infoList);
		});
		this._throttlePool.startFlowManage();

		this.check();

		this.getPrevSelectedCameraList()
			.then((prevSelectCameraList: Array<IFDeviceInfo>) => {
				// 获得接入的摄像头信息
				let accessCameraList: Array<IFDeviceInfo> = [];
				for (
					let i = 0;
					i < prevSelectCameraList.length &&
					accessCameraList.length < this.state.maxAccessCount;
					i++
				) {
					let item: IFDeviceInfo = prevSelectCameraList[i];
					accessCameraList.push(item);
				}

				// 修改接入视频的摄像头信息
				this.onChangeAccessCameraList(accessCameraList);
				// 修改id -> cameraInfo
				this._monitorIdCameraMapInfo(prevSelectCameraList);

				// 在摄像头信息获取之后再获取历史
				this.getHistoryList(1, 300)
					.then((result: ListType<IFActionMonitorInfo>) => {
						// 不加载更多了（临时方案显示100个）
						let list = result.list;

						let resultList: Array<IFActionAlarmInfo> = [];
						for (let info of list) {
							let alarmInfo: IFActionAlarmInfo | null = toActionAlarmInfoFromObject(
								// @ts-ignore
								info
							);

							if (alarmInfo) {
								// 找到对应的cameraInfo
								let cameraInfo: IFDeviceInfo = this.idToCameraInfoMap[
									alarmInfo.cameraId
								];
								// 设置cameraInfo信息
								alarmInfo.cameraInfo = cameraInfo;

								resultList.push(alarmInfo);
							}
						}

						this.setState((prevState: MonitorStateType) => {
							let all = [...prevState.monitorInfoList, ...resultList];
							return {
								monitorInfoList: this.getLimitMonitorList(all)
							};
						});

						// this._throttlePool.inflow(this.getLimitMonitorList(all));
					})
					.catch((error: Error) => {
						console.error(error);
						message.error(error.message);
					});

				// 监听
				this.subscribe(prevSelectCameraList);
				// 直接设置
				this.setState({
					selectedCameraList: prevSelectCameraList
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});

		// 监听
		STMqtt.getInstance().listen(this.handleMessage);
	}

	componentWillUnmount() {
		// 停止节流池的流入
		if (this._throttlePool) {
			this._throttlePool.stopFlowManage();
		}
		// 布控移除
		// this._deleteMonitor(this.state.selectedCameraList, this.state.monitorTypes)
		// 	.then(() => {
		// 		console.log('退出时布控移除成功');
		// 	})
		// 	.catch((error: Error) => {
		// 		console.error(error);
		// 	});
		// 断开mqtt
		this.unsubscribe(this.state.accessedCameraList);

		sessionStorage.removeItem(SelectTypesKey);
	}

	componentDidUpdate(prevProps: MonitorPropsType, prevState: MonitorStateType) {
		if (!prevProps.userInfo && this.props.userInfo) {
			// userInfo第一次有值
			this.getPrevSelectedCameraList()
				.then((prevSelectCameraList: Array<IFDeviceInfo>) => {
					// 获得接入的摄像头信息
					let accessCameraList: Array<IFDeviceInfo> = [];
					for (
						let i = 0;
						i < prevSelectCameraList.length &&
						accessCameraList.length < this.state.maxAccessCount;
						i++
					) {
						let item: IFDeviceInfo = prevSelectCameraList[i];
						accessCameraList.push(item);
					}

					// 修改接入视频的摄像头信息
					this.onChangeAccessCameraList(accessCameraList);
					// 修改id -> cameraInfo
					this._monitorIdCameraMapInfo(prevSelectCameraList);
					// 直接设置
					this.setState({
						selectedCameraList: prevSelectCameraList
					});
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		}
	}

	getHistoryList(
		page: number,
		pageSize: number
	): Promise<ListType<IFActionMonitorInfo>> {
		return ActionMonitorRequests.getHistoryMonitorInfoList(
			(this.props.userInfo && this.props.userInfo.id) || '',
			page,
			pageSize
		);
	}

	/**
	 * 获得上次选择的摄像头信息（外边判断this.props.userInfo)
	 * @returns {Promise<IFDeviceInfo[]>} 上次选中的摄像头列表
	 * @memberof Monitor
	 */
	async getPrevSelectedCameraList() {
		// 获得树结构
		let deviceTrees: Array<
			IFAreaInfo
		> = await DeviceRequests.getAllDevicesWithAreaInfo();

		// @ts-ignore
		const userId = (this.props.userInfo && this.props.userInfo.id) || ''; // 用户id
		// console.log('userInfo', { userInfo });

		return ActionMonitorRequests.queryActionMonitor([], { personId: userId })
			.then((list: IFActionMonitorInfo[]) => {
				let prevSelectedCameraList: Array<IFDeviceInfo> = [];
				for (let info of list) {
					let cameraId = info.cameraId || '';
					let cameraInfo: IFDeviceInfo | null = this.findCameraInfoInTrees(
						cameraId,
						deviceTrees
					);
					if (cameraInfo) {
						prevSelectedCameraList.push(cameraInfo);
					}
				}

				return prevSelectedCameraList;
			})
			.catch((error) => {
				console.error(error);
			});
	}

	/**
	 * 找到对应cameraId的信息
	 * @param {string} cameraId cameraid
	 * @param {Array<IFAreaInfo>} deviceTrees 所有的设备树
	 * @returns {(IFDeviceInfo | null)} 结果
	 * @memberof Monitor
	 */
	findCameraInfoInTrees(
		cameraId: string,
		deviceTrees: Array<IFAreaInfo>
	): IFDeviceInfo | null {
		for (let areaInfo of deviceTrees) {
			let result: IFDeviceInfo | null = this._findCameraInfoInTree(
				cameraId,
				areaInfo
			);
			if (result) {
				return result;
			}
		}

		return null;
	}

	/**
	 * 找到对应cameraId的信息
	 * @param {string} cameraId cameraid
	 * @param {IFAreaInfo} areaInfo 设备树
	 * @returns {(IFDeviceInfo | null)} 结果
	 * @memberof Monitor
	 */
	_findCameraInfoInTree(
		cameraId: string,
		areaInfo: IFAreaInfo
	): IFDeviceInfo | null {
		if (!cameraId || !areaInfo) {
			return null;
		}

		if (TypeValidate.isExactArray(areaInfo.cameraList)) {
			// @ts-ignore
			for (let device of areaInfo.cameraList) {
				// eslint-disable-next-line
				if (device.id == cameraId) {
					return device;
				}
			}
		}

		// 递归子树
		let children: Array<IFAreaInfo> = areaInfo.children || [];
		for (let childAreaInfo of children) {
			let result = this._findCameraInfoInTree(cameraId, childAreaInfo);
			if (result) {
				return result;
			}
		}

		return null;
	}

	check() {
		let monitorTypes = this.checkMonitorTypes();

		this.setState(
			{
				monitorTypes: monitorTypes
			},
			() => {
				// this.onChangeSelectedCameraList(selectedCameraList);
			}
		);
	}

	getLimitMonitorList(
		allList: Array<IFActionAlarmInfo>
	): Array<IFActionAlarmInfo> {
		return allList.filter((item: IFActionAlarmInfo, index: number) => {
			return index < 100;
		});
	}

	checkMonitorTypes(): Array<EActionMonitorType> {
		let cachedMonitorTypes = sessionStorage.getItem(SelectTypesKey);
		if (!cachedMonitorTypes) {
			return [EActionMonitorType.Ride];
		} else {
			try {
				let monitorTypes = JSON.parse(cachedMonitorTypes);
				if (TypeValidate.isExactArray(monitorTypes)) {
					return monitorTypes; // TODO: 验证元素是否也是有效的
				} else {
					return [EActionMonitorType.Ride];
				}
			} catch (error) {
				console.error(error);
				return [EActionMonitorType.Ride];
			}
		}
	}

	unsubscribe(cameraIdList: Array<IFDeviceInfo> = []) {
		let cameraIds: string[] = [];
		for (let cameraInfo of cameraIdList) {
			cameraIds.push(cameraInfo.id);
		}
		if (this.props.userInfo) {
			STMqtt.getInstance().unsubscribeActionAlarm(
				cameraIds,
				this.props.userInfo.id
			);
		}
	}

	subscribe(cameraIdList: Array<IFDeviceInfo> = []) {
		let cameraIds: string[] = [];
		for (let cameraInfo of cameraIdList) {
			cameraIds.push(cameraInfo.id);
		}
		if (this.props.userInfo) {
			STMqtt.getInstance().subscribeActionAlarm(
				cameraIds,
				this.props.userInfo.id
			);
		}
	}

	/**
	 * 处理mqtt消息
	 * @param {string} topic topic
	 * @param {string} message message
	 * @param {Packet} packet packet
	 * @returns {void}
	 * @memberof Monitor
	 */
	handleMessage = (topic: string, message: string, packet: Packet) => {
		try {
			let info: Object = JSON.parse(message);

			let alarmInfo: IFActionAlarmInfo | null = toActionAlarmInfoFromObject(
				// @ts-ignore
				info
			);

			console.log('收到mqtt消息', topic, alarmInfo, packet);

			if (alarmInfo && isActionMonitorTopic(topic)) {
				// 找到对应的cameraInfo
				let cameraInfo: IFDeviceInfo = this.idToCameraInfoMap[
					alarmInfo.cameraId
				];
				// 设置cameraInfo信息
				alarmInfo.cameraInfo = cameraInfo;

				// 节流
				this._throttlePool.inflow([alarmInfo]);
			}
			//
		} catch (error) {
			console.error(error);
			console.log('解析mqtt消息错误');
		}
	};

	/**
	 * 处理行为布控
	 * @param {IBActionAlarmInfo[]} alarmInfos 布控的消息
	 * @returns {void}
	 * @memberof Monitor
	 */
	handleActionMonitorMessage(alarmInfos: IFActionAlarmInfo[]) {
		// NOTE: 这儿简单的使用一个节流池对应多个检测类型，因为目前只有一种类型
		// 如果有多种类型的话，并且进行不同的组合时，有可能会出现一些已发送的检测类型数据丢失
		let monitorTypes = this.state.monitorTypes;
		let validInfos = alarmInfos.filter(function alarmInfoFilter(
			info: IFActionAlarmInfo
		) {
			return monitorTypes.indexOf(info.type) !== -1;
		});
		this.setState((prevState: MonitorStateType) => {
			let allResults: IFActionAlarmInfo[] = [
				...validInfos,
				...prevState.monitorInfoList
			];

			return {
				// NOTE: 产品的临时方案，保持最大为100个
				monitorInfoList: this.getLimitMonitorList(allResults)
			};
		});
	}

	refreshVideoPlayerSrcs(streams: Array<string>) {
		// 确保相同的视频地址在同一位置
		// {
		// 	streams.map((item) => {
		// 		return item;
		// 	});
		// }
		this.setState({
			streamList: streams.map((item) => {
				return item;
			})
		});
	}

	refreshVideoPlayerSrc(stream: CameraRequestDataType, order: number) {
		this.setState((prevState: MonitorStateType) => {
			let prevStreamList: Array<string> = [...prevState.streamList];
			prevStreamList[order] = stream.url;

			return {
				streamList: prevStreamList
			};
		});
	}

	onShowMonitorTypeSelectPanel = () => {
		//隐藏告警设置选项
		if (this.state.monitorTypeVisible === 'block') {
			this.setState({
				monitorTypeVisible: 'none'
			});
		}
	};

	onChangeSelectedCameraList(selectedCameraList: Array<IFDeviceInfo>) {
		console.log('选择的摄像头', selectedCameraList);

		this.setState((prevState: MonitorStateType) => {
			//
			let prevSelectedCameraList = [...prevState.selectedCameraList];
			let { left: needToAddList } = this._excludeAFromB(
				prevSelectedCameraList,
				selectedCameraList
			);
			let { left: needToDeleteList } = this._excludeAFromB(
				selectedCameraList,
				prevSelectedCameraList
			);

			// 修改monitor摄像头信息
			this.dealWithMonitorCameraListChanged(needToAddList, needToDeleteList);

			// 最终接入视频的摄像头
			let accessedCameraList = [...prevState.accessedCameraList];
			// 剩下不受影响的摄像头
			let { left: leftAccessCameraList } = this._excludeAFromB(
				needToDeleteList,
				accessedCameraList
			);
			// 填充满
			for (
				let i = 0;
				i < selectedCameraList.length &&
				leftAccessCameraList.length < this.state.maxAccessCount;
				i++
			) {
				let item: IFDeviceInfo = selectedCameraList[i];
				if (!this._existIn(item, leftAccessCameraList)) {
					leftAccessCameraList.push(item);
				}
			}
			// 修改接入视频的摄像头信息
			this.onChangeAccessCameraList(leftAccessCameraList);

			// 修改id -> cameraInfo
			this._monitorIdCameraMapInfo(selectedCameraList);

			return {
				selectedCameraList: selectedCameraList,
				accessedCameraList: leftAccessCameraList
			};
		});
	}

	_monitorIdCameraMapInfo(cameraInfoList: Array<IFDeviceInfo>) {
		for (let cameraInfo of cameraInfoList) {
			this.idToCameraInfoMap[cameraInfo.id] = cameraInfo;
		}
	}

	onSelectCamera = () => {
		//摄像头选择
		let handle = CameraSelectModal.show({
			okEnableInEmptySelectedList: true,
			maxSelectedCount: this.state.maxSelectedCameraCount,
			selectedList: this.state.selectedCameraList,
			onOk: (selectedCameraList: Array<IFDeviceInfo>) => {
				this.onChangeSelectedCameraList(selectedCameraList);
				handle.destory();
			},
			onCancel: () => {
				handle.destory();
			}
		});
	};

	onShowAccessCameraPanel = () => {
		//从已有摄像头列表中，选择展示摄像头
		if (!(this.state.selectedCameraList.length > 0)) {
			message.warning(intl.get('monitor-select-tip').d('请先选择摄像头'));
			return;
		}

		let handle = AccessCameraPanel.show({
			maxAccessCount: this.state.maxAccessCount,
			selectedCameraList: this.state.selectedCameraList,
			accessedCameraList: this.state.accessedCameraList,
			visible: true,
			onOk: (selected: Array<IFDeviceInfo>) => {
				this.onChangeAccessCameraList(selected);
				handle.destory();
			},
			onCancel: () => {
				handle.destory();
			}
		});
	};

	dealWithMonitorCameraListChanged(
		newAddCameraList: Array<IFDeviceInfo> = [],
		needDeletedCameraList: Array<IFDeviceInfo> = []
	) {
		// 删除对应的布控信息
		this._deleteMonitor(needDeletedCameraList, this.state.monitorTypes)
			.then(() => {
				console.log('删除布控成功', needDeletedCameraList);
				// 取消订阅之前的
				this.unsubscribe(needDeletedCameraList);

				// 新增布控
				// 添加需要布控的摄像头
				this._addMonitor(newAddCameraList, this.state.monitorTypes)
					.then(() => {
						console.log('新增布控成功', newAddCameraList);
						// 重新订阅
						this.subscribe(newAddCameraList);
					})
					.catch((error: Error) => {
						console.error(error);
						message.error(error.message);
					});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	}

	/**
	 * 修改需要接入视频的摄像头
	 * @param {Array<IFDeviceInfo>} newCameraList 新接入的摄像头
	 * @returns {void} void
	 * @memberof Monitor
	 */
	onChangeAccessCameraList = (newCameraList: Array<IFDeviceInfo>) => {
		this._playVedioStreams(newCameraList);
		this.setState({
			accessedCameraList: newCameraList
		});
	};

	dealwithAccessCameraListChanged(
		newCameraList: Array<IFDeviceInfo> = [],
		oldCameraList: Array<IFDeviceInfo> = []
	) {
		this._playVedioStreams(newCameraList);
	}

	async _addMonitor(
		addCameraList: Array<IFDeviceInfo>,
		types: EActionMonitorType[]
	) {
		//
		let cameraIds = addCameraList.map((item: IFDeviceInfo) => {
			return item.id;
		});

		if (cameraIds.length <= 0) {
			return Promise.resolve();
		}

		let userId = this.props.userInfo && this.props.userInfo.id;
		if (!userId) {
			console.error('user id is not defined');
			return Promise.reject(new Error(intl.get('param-error').d('参数错误')));
		}
		let allRequests = [];
		for (let type of types) {
			allRequests.push(
				ActionMonitorRequests.addNewActionMonitor(cameraIds, {
					personId: userId,
					type: type
				})
			);
		}

		return Promise.all(allRequests);
	}

	async _deleteMonitor(
		deleteCameraList: Array<IFDeviceInfo>,
		types: EActionMonitorType[]
	) {
		//
		let cameraIds = deleteCameraList.map((item: IFDeviceInfo) => {
			return item.id;
		});

		if (cameraIds.length <= 0) {
			return Promise.resolve();
		}

		let userId = this.props.userInfo && this.props.userInfo.id;
		if (!userId) {
			console.error('user id is not defined');
			return Promise.reject(new Error(intl.get('param-error').d('参数错误')));
		}

		let allRequests = [];
		for (let type of types) {
			allRequests.push(
				ActionMonitorRequests.deleteActionMonitor(cameraIds, {
					personId: userId,
					type: type
				})
			);
		}

		return Promise.all(allRequests);
	}

	_modifyMonitor(cameraList: Array<IFDeviceInfo>, type: EActionMonitorType) {
		//
	}

	_playVedioStreams(newCameraList: Array<IFDeviceInfo>) {
		//
		// for (let i = 0; i < newCameraList.length; i++) {
		// 	this._playVedioStream(newCameraList[i], i);
		// }

		let allRequests: Array<Promise<string>> = [];
		// newCameraList.map((item) => {
		// 	return this._playVedioStream(item);
		// });
		for (let i = 0; i < newCameraList.length; i++) {
			allRequests.push(this._playVedioStream(newCameraList[i]));
		}
		Promise.all(allRequests)
			.then((res: Array<string>) => {
				//更新视频流展示内容
				this.refreshVideoPlayerSrcs(res);
				console.log('获取总视频流地址', res);
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	}

	_playVedioStream(camera: IFDeviceInfo): Promise<string> {
		return this.getSelectedCameraAddress(camera.id)
			.then((result: CameraRequestDataType) => {
				// 刷新视频内容
				return result.url;
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
				return '';
			});
	}

	getSelectedCameraAddress = (id: string) => {
		return CollectionCaptureRequests.getCameraAddress(id);
	};

	setMonitorType = () => {
		//显示告警设置选项
		this.setState({
			monitorTypeVisible: 'block'
		});
	};

	monitorTypeOnChange = (checkedValues: any) => {
		this.setState({
			monitorTypes: checkedValues
		});
	};

	render() {
		const { accessedCameraList } = this.state;
		const cameraTagComponent = accessedCameraList.map((item, index) => {
			return (
				<div
					key={item.id}
					title={item.name}
					className={ModuleStyles['monitor-view-camera-item']}
				>
					{item.name}
				</div>
			);
		});
		// 摄像头信息
		let CameraContentList = [];

		for (let i = 0; i < this.state.maxAccessCount; i++) {
			CameraContentList.push(
				<MonitorVideoPlayer
					key={this.state.keys[i]}
					className={ModuleStyles['camera-container']}
					url={i < this.state.streamList.length ? this.state.streamList[i] : ''}
				/>
			);
		}

		return (
			<div
				key="monitor-page"
				className={ModuleStyles['monitor-container']}
				onClick={this.onShowMonitorTypeSelectPanel}
			>
				<div className={ModuleStyles['monitor-container-left']}>
					<div className={ModuleStyles['monitor-container-left-selectBar']}>
						<div>
							<b>
								{intl.get('MONITOR_CAMERASET_TIP1').d('布控摄像头') +
									'：' +
									intl.get('MONITOR_CAMERASET_TIP2').d('已选择')}
								<span>{this.state.selectedCameraList.length}</span>
								{intl.get('MONITOR_CAMERASET_TIP3').d('路')}
							</b>
							<Button type="primary" onClick={this.onSelectCamera}>
								{intl.get('MONITOR_CAMERASET_BTN').d('选择摄像头')}
							</Button>
						</div>
						<div>
							<span>
								{intl.get('MONITOR_CAMERASHOW_TITLE').d('展示摄像头') + '：'}
							</span>
							<div style={{ display: 'flex', paddingRight: '20px' }}>
								{accessedCameraList.length > 0 ? cameraTagComponent : 0}
							</div>
							<Button
								type="primary"
								ghost
								onClick={this.onShowAccessCameraPanel}
							>
								{intl.get('MONITOR_CAMERASHOW_BTN').d('切换')}
							</Button>
						</div>
					</div>
					<div className={ModuleStyles['monitor-container-left-cameraContent']}>
						{CameraContentList}
					</div>
				</div>
				<div className={ModuleStyles['monitor-container-right']}>
					<div className={ModuleStyles['monitor-container-right-selectBar']}>
						<b>{intl.get('MONITOR_MESSAGE_TITLE').d('告警消息')}</b>
						<Button type="primary" onClick={this.setMonitorType} ghost>
							{intl.get('MONITOR_MESSAGE_BTN').d('告警设置')}
						</Button>
						<div
							style={{ display: this.state.monitorTypeVisible }}
							className={ModuleStyles['monitor-container-right-monitorTypes']}
							onClick={(e) => e.stopPropagation()}
						>
							<CheckboxGroup
								className={ModuleStyles['monitorTypes-checkboxGroup']}
								options={this.actionAlarmOptions}
								value={this.state.monitorTypes}
								onChange={this.monitorTypeOnChange}
							/>
						</div>
					</div>
					<ul className={ModuleStyles['monitor-container-right-monitorList']}>
						{this.state.monitorInfoList ? (
							<ReactCSSTransitionGroup
								transitionName={{
									enter: ModuleStyles['enter'],
									enterActive: ModuleStyles['enter-active'],
									leave: ModuleStyles['leave'],
									leaveActive: ModuleStyles['leave-acive']
								}}
								transitionEnterTimeout={500}
								transitionLeaveTimeout={300}
							>
								{this.state.monitorInfoList.map((item, index) => {
									return (
										<MonitorInfoPanel monitorInfo={item} key={item.uuid} />
									);
								})}
							</ReactCSSTransitionGroup>
						) : (
							<span>{intl.get('data-empty').d('暂无数据')}</span>
						)}
					</ul>
				</div>
			</div>
		);
	}

	/**
	 * 从B中排出A
	 * @param {Array<IFDeviceInfo>} A 需要排出的元素
	 * @param {Array<IFDeviceInfo>} B 待处理的元素
	 * @returns {Array<IFDeviceInfo>} 结果
	 * @memberof Monitor
	 */
	_excludeAFromB(
		A: Array<IFDeviceInfo>,
		B: Array<IFDeviceInfo>
	): { left: Array<IFDeviceInfo>; remove: Array<IFDeviceInfo> } {
		let result: Array<IFDeviceInfo> = [];
		let removed: Array<IFDeviceInfo> = [];

		for (let bItem of B) {
			if (!this._existIn(bItem, A)) {
				result.push(bItem);
			} else {
				removed.push(bItem);
			}
		}
		return {
			left: result,
			remove: removed
		};
	}

	/**
	 * item是否在list里边
	 * @param {IFDeviceInfo} item 待检测的item
	 * @param {Array<IFDeviceInfo>} list list
	 * @returns {boolean} true表明在list里边
	 * @memberof Monitor
	 */
	_existIn(item: IFDeviceInfo, list: Array<IFDeviceInfo>): boolean {
		for (let listItem of list) {
			if (item.id && item.id === listItem.id) {
				return true;
			}
		}
		return false;
	}
}

export default withUserInfo(Monitor);
