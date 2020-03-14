import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import ModuleStyle from './assets/styles/device-info-style.module.scss';
import * as intl from 'react-intl-universal';
import { Icon, Button } from 'antd';
import { DataServerRequests } from 'stsrc/utils/requests/data-server-requests';
import { ETargetType, ESourceType } from 'stsrc/type-define';

interface PropsTypes {
	deviceId: string;
	deviceName: string;
	areaName: string;
	onViewVideo: (cameraId: string) => void;
	targetTypes: ETargetType[];
}

function noop() {}
interface StateTpye {
	isLoading: boolean;
	isLoadingFailed: boolean;
	count: number;
}

class DeviceInfoPanel extends STComponent<PropsTypes, StateTpye> {
	static defaultProps = {
		deviceId: '',
		deviceName: '',
		areaName: '',
		onViewVideo: noop,
		targetTypes: [ETargetType.Unknown]
	};

	state = {
		isLoading: true,
		isLoadingFailed: false,
		count: 0
	};

	onClick = () => {
		this.props.onViewVideo(this.props.deviceId);
	};

	onClickPanel = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
	};

	componentDidMount() {
		this.getCaptureCount();
	}

	getCaptureCount() {
		DataServerRequests.getTodaySourceStaticResult(
			this.props.deviceId,
			this.props.targetTypes,
			ESourceType.Camera
		)
			.then((count: number) => {
				this.setState({
					count: count,
					isLoading: false,
					isLoadingFailed: false
				});
			})
			.catch((error: Error) => {
				console.error(error);
				this.setState({
					isLoading: false,
					isLoadingFailed: true
				});
			});
	}

	renderCount() {
		if (this.state.isLoading) {
			return intl.get('----------------dddddd').d('加载中...');
		}

		if (this.state.isLoadingFailed) {
			return intl.get('----------------dddddd').d('加载失败...');
		}

		return this.state.count;
	}

	render() {
		return (
			<div
				className={ModuleStyle['device-info-panel']}
				onClick={this.onClickPanel}
			>
				<div className={ModuleStyle['title']}>{this.props.deviceName}</div>
				<div className={ModuleStyle['content']}>
					<div className={ModuleStyle['content-item']}>
						<div>{intl.get('-----------22222').d('所属区域：')}</div>
						<div>{this.props.areaName}</div>
					</div>
					<div className={ModuleStyle['content-item']}>
						<div>{intl.get('-----------22222').d('今日采集：')}</div>
						<div className={ModuleStyle['count']}>{this.renderCount()}</div>
					</div>
				</div>
				<div className={ModuleStyle['view-video']}>
					<div className={ModuleStyle['view-video-button']}>
						<Button onClick={this.onClick}>
							{intl.get('-----------------------dddd').d('查看视频流')}
							<Icon type="arrow-right" />
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

export default DeviceInfoPanel;
