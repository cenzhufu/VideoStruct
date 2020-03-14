import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import LiveVideo from './LiveVedio';
import { match } from 'react-router-dom';
import * as H from 'history';
import { DeviceRequests } from 'stsrc/utils/requests/basic-server-request';
import { message } from 'antd';
import * as mqtt from 'mqtt';
import {
	IFDeviceInfo,
	ETargetType,
	ESourceType,
	getDefaultDeviceInfo,
	IFStructuralInfo,
	// eslint-disable-next-line
	ListType,
	DateFormat
} from 'stsrc/type-define';
import {
	DataServerRequests,
	DataServerQueryRequests
} from 'stsrc/utils/requests/data-server-requests';
import {
	CollectionCaptureRequests,
	CameraRequestDataType
} from 'stsrc/utils/requests/collection-request';
import STMqtt, { getLiveAnalysisTopicId } from 'stsrc/utils/mqtt';
import { toStructuralInfoFromAnalysisResult } from 'stsrc/utils/requests/collection-request/collection-analyze-result/to-structural-info-adaptor';

import * as moment from 'moment';

interface PropsType {
	// router带过来的属性
	match: match;
	history: H.History;
	location: H.Location;
}

interface StateType {
	deviceInfo: IFDeviceInfo;
	date: string; //
	faceCount: number;
	carCount: number;
	playUrl: string;
	resultList: IFStructuralInfo[];
	isLoading: boolean;
}
class LiveVideoContainer extends STComponent<PropsType, StateType> {
	state = {
		deviceInfo: getDefaultDeviceInfo(),
		date: '',
		faceCount: 0,
		carCount: 0,
		playUrl: '',
		resultList: [],
		isLoading: true
	};
	componentDidMount() {
		this.getDeviceInfo();
		this.getLiveUrl();
		this.getFaceCaputreCount();
		this.getCarCaputreCount();
		this.getAllCaptureResult();

		// mqtt接受
		STMqtt.getInstance().subscribe(getLiveAnalysisTopicId(this.deviceId()));

		// 监听
		STMqtt.getInstance().listen(this.onReceiveLiveAnalysisResult);
	}

	componentWillUnmount() {
		STMqtt.getInstance().unsubscribe(getLiveAnalysisTopicId(this.deviceId()));
	}

	onReceiveLiveAnalysisResult = (
		topic: string,
		message: string,
		packet: mqtt.Packet
	) => {
		try {
			let info = toStructuralInfoFromAnalysisResult(JSON.parse(message));
			console.log(info);
			// eslint-disable-next-line
			if (info.sourceId != this.deviceId()) {
				return;
			}
			//
			//
			this.setState((prevState: StateType) => {
				return {
					faceCount:
						info.targetType === ETargetType.Face ||
						info.targetType === ETargetType.Body
							? prevState.faceCount + 1
							: prevState.faceCount,
					carCount:
						info.targetType === ETargetType.Vehicle
							? prevState.carCount + 1
							: prevState.carCount,
					resultList: [info, ...prevState.resultList]
				};
			});
		} catch (error) {
			console.error(error);
			console.log('解析mqtt消息错误');
		}
	};

	deviceId() {
		// NOTE: 确保router带了这个param
		let params: { deviceId: string } = this.props.match.params as {
			deviceId: string;
		};
		return params.deviceId;
	}

	/******************** 请求 start ************************/

	getDeviceInfo() {
		DeviceRequests.getDeviceInfo(this.deviceId())
			.then((deviceInfo: IFDeviceInfo) => {
				this.setState({
					deviceInfo: deviceInfo
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	}

	getFaceCaputreCount() {
		DataServerRequests.getTodaySourceStaticResult(
			this.deviceId(),
			[ETargetType.Face, ETargetType.Body],
			ESourceType.Camera
		)
			.then((count: number) => {
				this.setState({
					faceCount: count
				});
			})
			.catch((error: Error) => {
				console.error(error);
			});
	}

	getCarCaputreCount() {
		DataServerRequests.getTodaySourceStaticResult(
			this.deviceId(),
			[ETargetType.Vehicle],
			ESourceType.Camera
		)
			.then((count: number) => {
				this.setState({
					carCount: count
				});
			})
			.catch((error: Error) => {
				console.error(error);
			});
	}

	getLiveUrl() {
		CollectionCaptureRequests.getCameraAddress(this.deviceId())
			.then((result: CameraRequestDataType) => {
				this.setState({
					playUrl: result.url
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	}

	getAllCaptureResult(loadMore: boolean = false) {
		Promise.all([
			// CollectionAnalysisResultRequest.getAnalysisResult({
			// 	sources: [
			// 		{
			// 			sourceId: this.deviceId(),
			// 			sourceType: ESourceType.Camera
			// 		}
			// 	],
			// 	page: 1,
			// 	pageSize: 200,
			// 	targetTypes: [ETargetType.Face],
			// 	startDate: moment()
			// 		.startOf('day')
			// 		.set('hour', 0)
			// 		.format(DateFormat)
			// }),
			// CollectionAnalysisResultRequest.getAnalysisResult({
			// 	sources: [
			// 		{
			// 			sourceId: this.deviceId(),
			// 			sourceType: ESourceType.Camera
			// 		}
			// 	],
			// 	page: 1,
			// 	pageSize: 200,
			// 	targetTypes: [ETargetType.Body],
			// 	startDate: moment()
			// 		.startOf('day')
			// 		.set('hour', 0)
			// 		.format(DateFormat)
			// }),
			// CollectionAnalysisResultRequest.getAnalysisResult({
			// 	sources: [
			// 		{
			// 			sourceId: this.deviceId(),
			// 			sourceType: ESourceType.Camera
			// 		}
			// 	],
			// 	page: 1,
			// 	pageSize: 200,
			// 	targetTypes: [ETargetType.Vehicle],
			// 	startDate: moment()
			// 		.startOf('day')
			// 		.set('hour', 0)
			// 		.format(DateFormat)
			// })
			DataServerQueryRequests.getCameraCaptureImageList(
				[this.deviceId()],
				ETargetType.Face,
				{
					page: 1,
					pageSize: 200,
					sourceType: ESourceType.Camera,
					currentTargetType: ETargetType.Face,
					startDate: moment()
						.startOf('day')
						.set('hour', 0)
						.format(DateFormat)
				}
			),
			DataServerQueryRequests.getCameraCaptureImageList(
				[this.deviceId()],
				ETargetType.Body,
				{
					page: 1,
					pageSize: 200,
					sourceType: ESourceType.Camera,
					currentTargetType: ETargetType.Body,
					startDate: moment()
						.startOf('day')
						.set('hour', 0)
						.format(DateFormat)
				}
			),
			DataServerQueryRequests.getCameraCaptureImageList(
				[this.deviceId()],
				ETargetType.Vehicle,
				{
					page: 1,
					pageSize: 200,
					sourceType: ESourceType.Camera,
					currentTargetType: ETargetType.Vehicle,
					startDate: moment()
						.startOf('day')
						.set('hour', 0)
						.format(DateFormat)
				}
			)
		])
			.then(
				(
					list: [
						ListType<IFStructuralInfo>,
						ListType<IFStructuralInfo>,
						ListType<IFStructuralInfo>
					]
				) => {
					// 按时间排序
					let total = [...list[0].list, ...list[1].list, ...list[2].list];
					this.setState({
						isLoading: false,
						resultList: total.sort(
							(first: IFStructuralInfo, second: IFStructuralInfo) => {
								return first.time < second.time ? 1 : -1;
							}
						)
					});
				}
			)
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
				this.setState({
					isLoading: false
				});
			});
	}

	/******************** 请求 end ************************/

	render() {
		return (
			<LiveVideo
				deviceInfo={this.state.deviceInfo}
				faceCount={this.state.faceCount}
				carCount={this.state.carCount}
				playUrl={this.state.playUrl}
				list={this.state.resultList}
				isLoading={this.state.isLoading}
			/>
		);
	}
}

export default LiveVideoContainer;
