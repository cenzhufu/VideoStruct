import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import * as intl from 'react-intl-universal';
import VideoPlayer, { VideoPlayerProps } from 'ifvendors/video-player';
import ModuleStyle from './assets/styles/index.module.scss';

interface PropsType extends Partial<VideoPlayerProps> {
	url: string;
	className: string;
}
type StateType = {};

class MonitorVideoPlayer extends STComponent<PropsType, StateType> {
	static defaultProps = {
		url: '',
		className: ''
	};

	render() {
		return (
			<div className={`${this.props.className} `}>
				<div className={`${ModuleStyle['monitor-video-player']}`}>
					{this.props.url ? (
						<VideoPlayer
							isStream={true}
							url={this.props.url}
							options={{
								controls: true,
								autoplay: true
							}}
						/>
					) : (
						<span>
							{intl
								.get('MONITOR_CAMERAITEM_TIP')
								.d('未布控摄像头，请选择摄像头')}
						</span>
					)}
				</div>
			</div>
		);
	}
}

export default MonitorVideoPlayer;
