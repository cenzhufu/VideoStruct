import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import VideoPlayer, { VideoPlayerProps } from 'ifvendors/video-player';
import { ESourceType } from 'stsrc/type-define';
import Language from 'stutils/locales';
interface PropsType extends Partial<VideoPlayerProps> {
	url: string;
	className: string;

	sourceType: ESourceType;
}

type StateType = {};

class SourceVideoPlayer extends STComponent<PropsType, StateType> {
	render() {
		return (
			<div className={this.props.className}>
				<VideoPlayer
					url={this.props.url}
					isStream={this.props.sourceType === ESourceType.Camera}
					options={{
						controls: true,
						autoplay: false,
						language: Language.getLocale()
					}}
				/>
			</div>
		);
	}
}

export default SourceVideoPlayer;
