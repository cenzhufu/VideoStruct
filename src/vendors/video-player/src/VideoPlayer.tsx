import * as React from 'react';

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import ModuleStyle from './index.module.scss';
import quickPlayer from './player-quick.swf';
import * as ReactSWF from './ReactSWF';
import { guid } from 'ifutils/guid';

// 修改名字
export interface VideoPlayerOptions extends videojs.PlayerOptions {}
export interface Player extends videojs.Player {}
export interface VideoPlayerProps {
	isStream: boolean; // 是否是流媒体形式的
	className: string;
	url: string;
	style: React.CSSProperties;

	options: VideoPlayerOptions;
	onEnd: () => void;
	onLoadStart: () => void;
	onProgress: (percent: number) => void; // 下载进度
	onSuspend: () => void;
	onAbort: () => void;
	onError: (error: Error) => void;
	onEmptied: () => void;
	onStalled: () => void;
	onLoadMetaData: () => void;
	onLoadedData: () => void;
	onCanPlay: () => void;
	onCanPlayThrough: () => void;
	onPlaying: () => void;
	onWaiting: () => void;
	onSeeking: () => void;
	onSeeked: () => void;
	onDrurationChanged: () => void;
	onTimeUpdate: (player: Player) => void;
	onPlay: (player: Player) => void;
	onPause: (player: Player) => void;
	onRateChange: () => void;
	onResize: () => void;
	onVolumeChange: () => void;
}

type StateType = {};

function noop() {}

class VideoPlayer extends React.Component<VideoPlayerProps, StateType> {
	static defaultProps = {
		className: '',
		style: {},
		url: '',
		isStream: false,

		onEnd: noop,
		onLoadStart: noop,
		onProgress: noop, // 下载进度
		onSuspend: noop,
		onAbort: noop,
		onError: noop,
		onEmptied: noop,
		onStalled: noop,
		onLoadMetaData: noop,
		onLoadedData: noop,
		onCanPlay: noop,
		onCanPlayThrough: noop,
		onPlaying: noop,
		onWaiting: noop,
		onSeeking: noop,
		onSeeked: noop,
		onDrurationChanged: noop,
		onTimeUpdate: noop,
		onPlay: noop,
		onPause: noop,
		onRateChange: noop,
		onResize: noop,
		onVolumeChange: noop,

		options: {
			controls: true,
			autoplay: true,
			preload: 'auto'
		}
	};

	videoRef: React.RefObject<HTMLVideoElement>;
	player: Player | undefined;

	constructor(props: VideoPlayerProps) {
		super(props);

		this.state = {};

		this.videoRef = React.createRef<HTMLVideoElement>();
		this.player = undefined;
	}

	componentDidMount() {
		this.setup();
		this.changeSrc(this.props.url);
	}

	componentDidUpdate(
		prevProps: VideoPlayerProps,
		prevState: StateType,
		snapshot: any
	) {
		// if (!this.props.url) {
		// 	this.cleanup();
		// } else {
		if (!this.player) {
			this.setup();
		}
		// }

		if (this.props.url !== prevProps.url) {
			if (this.player) {
				this.changeSrc(this.props.url);
				// this.player.src({
				// 	type: 'rtmp/mp4',
				// 	src: this.props.url
				// });
			}
		}
	}

	componentWillUnmount() {
		this.cleanup();
	}

	setup() {
		if (this.videoRef.current) {
			let self = this;
			this.player = videojs(
				this.videoRef.current,
				this.props.options,
				function playerCallback() {
					// 事件查看: https://www.w3.org/2010/05/video/mediaevents.html

					// @ts-ignore
					let player: Player = this;
					// @ts-ignore
					this.on('loadstart', function videoLoadStart(e) {
						console.log('loadstart', e);
						self.props.onLoadStart();
					});

					// @ts-ignore
					this.on('progress', function videoProgress(e) {
						console.log('progress', e);
						self.props.onProgress(player.bufferedEnd());
					});

					// @ts-ignore
					this.on('suspend', function videoSuspend() {
						console.log('suspend');
						self.props.onSuspend();
					});

					// @ts-ignore
					this.on('abort', function videoAbort() {
						console.log('abort');
						self.props.onAbort();
					});

					// @ts-ignore
					this.on('error', function videoError(e) {
						console.error('error', e);
						self.props.onError(e);
					});

					// @ts-ignore
					this.on('emptied', function videoEmptied() {
						console.log('emptied');
						self.props.onEmptied();
					});

					// @ts-ignore
					this.on('stalled', function videoStalled() {
						console.log('stalled');
						self.props.onStalled();
					});

					// @ts-ignore
					this.on('loadedmetadata', function videoLoadedmetadata() {
						console.log('loadedmetadata');
						self.props.onLoadMetaData();
					});

					// @ts-ignore
					this.on('loadeddata', function videoLoadeddata() {
						console.log('loadeddata');
						self.props.onLoadedData();
					});

					// @ts-ignore
					this.on('canplay', function videoCanplay() {
						console.log('canplay');
						self.props.onCanPlay();
					});

					// @ts-ignore
					this.on('canplaythrough', function videoCanplaythrough() {
						console.log('canplaythrough');
						self.props.onCanPlayThrough();
					});

					// @ts-ignore
					this.on('playing', function videoPlaying() {
						console.log('playing');
						self.props.onPlaying();
					});

					// @ts-ignore
					this.on('waiting', function videoWaiting() {
						console.log('waiting');
						self.props.onWaiting();
					});

					// @ts-ignore
					this.on('seeking', function videoSeeking() {
						console.log('seeking');
						self.props.onSeeking();
					});

					// @ts-ignore
					this.on('seeked', function videoSeeked() {
						console.log('seeked');
						self.props.onSeeked();
					});

					// @ts-ignore
					this.on('ended', function videoEndCallback() {
						console.log('end');
						self.props.onEnd();
					});

					// @ts-ignore
					this.on('durationchange', function videoDurationchange() {
						console.log('durationchange');
						self.props.onDrurationChanged();
					});

					// @ts-ignore
					this.on('timeupdate', function videoTimeupdate(e) {
						console.log('timeupdate', player.currentTime());
						self.props.onTimeUpdate(player);
					});

					// @ts-ignore
					this.on('play', function videoPlay(e) {
						console.log('play', e);
						self.props.onPlay(player);
					});

					// @ts-ignore
					this.on('pause', function videoPause(e) {
						console.log('pause', e);
						self.props.onPause(player);
					});

					// @ts-ignore
					this.on('ratechange', function videoRatechange(e) {
						console.log('ratechange', e);
						self.props.onRateChange();
					});

					// @ts-ignore
					this.on('resize', function videoResize() {
						console.log('resize');
						self.props.onResize();
					});

					// @ts-ignore
					this.on('volumechange', function videoVolumechange() {
						console.log('volumechange');
						self.props.onVolumeChange();
					});
				}
			);

			this.player.language();
		}
	}

	changeSrc(url: string) {
		if (this.player && url) {
			this.player.src(url);
		}
	}

	loadVideo(src: string, mimeType: string) {
		if (this.player) {
			this.player.src({
				src: src,
				type: mimeType
			});
		}
	}

	cleanup() {
		if (this.player) {
			this.player.pause();
			this.player.dispose();
			this.player = undefined;
		}
	}

	render() {
		let id = guid();
		return (
			<div
				className={`${ModuleStyle['video-player-container']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				<div
					className={`video-js ${ModuleStyle['video-player']}`}
					data-vjs-player
				>
					{this.props.isStream ? (
						// @ts-ignore
						<ReactSWF
							// @ts-ignore
							src={quickPlayer}
							id={id}
							width={'100%'}
							height={'100%'}
							wmode="transparent"
							bgcolor="transparent"
							allowFullScreen={true}
							allowScriptAccess="sameDomain"
							flashVars={{
								playerID: id,
								rtmp: this.props.url,
								// rtmp: this.props.rtmpurl,
								autoplay: true,
								showErrorInPlayer: false,
								showMetadata: false,
								showLiveCaption: false,
								livelabelshowbg: false
							}}
						/>
					) : (
						// <object
						// 	type="application/x-shockwave-flash"
						// 	name="video"
						// 	data={player}
						// 	width="100%"
						// 	height="100%"
						// >
						// 	<param name="allowFullScreen" value="true" />
						// 	<param name="allowScriptAccess" value="sameDomain" />
						// 	<param name="bgcolor" value="transparent" />
						// 	<param name="wmode" value="transparent" />
						// 	<param
						// 		name="FlashVars"
						// 		value={`rtmp=${
						// 			this.props.url
						// 		}&amp;autoplay=true&amp;showMetadata=false&amp;showLiveCaption=false&amp;livelabelshowbg=false&amp;showErrorInPlayer=false&amp`}
						// 	/>
						// </object>
						<video ref={this.videoRef}>
							{/* <source src={this.props.url} /> */}
						</video>
					)}
				</div>
			</div>
		);
	}

	/************暴露的接口 *************************/

	/**
	 * 获得player实例
	 * @returns {(Player | undefined)} 实例
	 * @memberof VideoPlayer
	 */
	getPlayer(): Player | undefined {
		return this.player;
	}
}

export default VideoPlayer;
