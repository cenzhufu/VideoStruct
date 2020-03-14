import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import ModuleStyle from './assets/styles/live-vedio-style.module.scss';
import {
	IFDeviceInfo,
	ETargetType,
	getDefaultDeviceInfo,
	IFStructuralInfo
} from 'stsrc/type-define';
import Time from './Time';
import VideoPlayer from 'ifvendors/video-player';
import TargetTabs from './TargetTabs';
import StructuralScroll from 'stsrc/components/scroll';
import StructuralItemWithAttributeFace from 'stsrc/components/structural-item/face-with-attribute-item';
import StructuralItemWithAttributeBody from 'stsrc/components/structural-item/body-with-attribute-item';
import StructuralItemWithAttributeCar from 'stsrc/components/structural-item/car-with-attribute-item';

interface PropTypes {
	deviceInfo: IFDeviceInfo;
	faceCount: number;
	carCount: number;
	playUrl: string;
	list: IFStructuralInfo[];
	isLoading: boolean;
}

interface StateType {
	currentTargetType: ETargetType;
}

class LiveVideo extends STComponent<PropTypes, StateType> {
	static defaultProps = {
		deviceInfo: getDefaultDeviceInfo(),
		faceCount: 0,
		carCount: 0,
		playUrl: '',
		list: []
	};

	state = {
		currentTargetType: ETargetType.All
	};

	onChangeTab = (targetType: ETargetType) => {
		this.setState({
			currentTargetType: targetType
		});
	};

	renderItem = (item: IFStructuralInfo, index: number): React.ReactNode => {
		switch (item.targetType) {
			case ETargetType.Face:
				return <StructuralItemWithAttributeFace structuralItemInfo={item} />;

			case ETargetType.Body:
				return <StructuralItemWithAttributeBody structuralItemInfo={item} />;

			case ETargetType.Vehicle:
				return <StructuralItemWithAttributeCar structuralItemInfo={item} />;

			default:
				return null;
		}
	};

	getKey = (item: IFStructuralInfo, index: number) => {
		return item.uuid;
	};

	render() {
		// 过滤数据
		let resultList: IFStructuralInfo[] = this.props.list.filter(
			(item: IFStructuralInfo) => {
				if (this.state.currentTargetType === ETargetType.All) {
					return item;
				}
				return item.targetType === this.state.currentTargetType;
			}
		);

		return (
			<div className={ModuleStyle['live-video-page']}>
				<div className={ModuleStyle['top-content']}>
					<div className={ModuleStyle['tip-info']}>
						<Time className={ModuleStyle['info-item']} time={Date.now()} />
						<div className={ModuleStyle['info-item']}>
							<div className={ModuleStyle['item-title']}>设备信息</div>
							<div
								className={`${ModuleStyle['item-value']} ${
									ModuleStyle['camera']
								}`}
							>
								<div className={`${ModuleStyle['icon']} `} />
								{this.props.deviceInfo.name}
							</div>
						</div>
						<div className={ModuleStyle['info-item']}>
							<div className={ModuleStyle['item-title']}>今日抓拍量</div>
							<div
								className={`${ModuleStyle['item-value']} ${
									ModuleStyle['face']
								}`}
							>
								<div className={`${ModuleStyle['icon']} `} />
								{this.props.faceCount}
							</div>
							<div
								className={`${ModuleStyle['item-value']} ${ModuleStyle['car']}`}
							>
								<div className={`${ModuleStyle['icon']} `} />
								{this.props.carCount}
							</div>
						</div>
					</div>
					<div className={ModuleStyle['video']}>
						{this.props.playUrl && (
							<VideoPlayer
								isStream={true}
								url={this.props.playUrl}
								options={{
									controls: true,
									autoplay: true
								}}
							/>
						)}
					</div>
					<div />
				</div>
				<div className={ModuleStyle['bottom-cotent']}>
					<div className={ModuleStyle['tabs-container']}>
						<TargetTabs
							onChangeTab={this.onChangeTab}
							current={this.state.currentTargetType}
							tabs={[
								{
									displayName: '全部',
									targetType: ETargetType.All
								},
								{
									displayName: '人脸',
									targetType: ETargetType.Face
								},
								{
									displayName: '人体',
									targetType: ETargetType.Body
								},
								{
									displayName: '车辆',
									targetType: ETargetType.Vehicle
								}
							]}
						/>
					</div>
					<div className={ModuleStyle['analysis-results-container']}>
						<StructuralScroll<IFStructuralInfo>
							className={ModuleStyle['results-scroll-container']}
							style={{ height: '144px', backgroundColor: 'unset' }}
							resultInfos={resultList}
							hasMore={false}
							showLoading={this.props.isLoading}
							renderItem={this.renderItem}
							getKey={this.getKey}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default LiveVideo;
