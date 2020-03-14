import * as React from 'react';
// import LazyloadPlaceHolder from 'ifvendors/lazyload-placeholder';
import LazyLoad from 'ifvendors/lazy-load';
import ImageView, {
	ImageDisplayMode,
	ImageViewPropsType
} from 'ifvendors/image-view';

// export interface LazyLoadImageViewPropsType {
// 	className: string;
// 	style: Object;

// 	imageUrl: Required<string>;
// 	displayMode: ImageDisplayMode;
// }

export interface LazyloadImageProps extends ImageViewPropsType {
	lazyLoadPlaceholder: React.ReactNode;
}

type StateType = {
	visible: boolean;
};

function noop() {}
class LazyLoadImageView extends React.Component<LazyloadImageProps, StateType> {
	static defaultProps = {
		className: '',
		style: {},
		displayMode: ImageDisplayMode.Original,
		images: [],
		children: [],
		placeholder: null,
		lazyLoadPlaceholder: null,
		onMouseEnter: noop,
		onMouseLeave: noop,
		onClick: noop,

		isCropperState: false,
		isAutoCrop: false,
		isCropShow: false
	};
	imageViewRef: React.RefObject<ImageView>;

	constructor(props: LazyloadImageProps) {
		super(props);

		this.imageViewRef = React.createRef<ImageView>();

		this.state = {
			visible: false
		};
	}

	getImageElement(): HTMLImageElement | null {
		if (this.imageViewRef.current) {
			return this.imageViewRef.current.getImageElement();
		} else {
			return null;
		}
	}

	render() {
		let ContentComponent = (
			<LazyLoad
				className={this.props.className}
				// once={true}
				// offset={100}
				// overflow={true}
				// resize={true}
				// debounce={300}
				placeholder={this.props.lazyLoadPlaceholder}
			>
				<ImageView
					ref={this.imageViewRef}
					onClick={this.props.onClick}
					onMouseEnter={this.props.onMouseEnter}
					onMouseLeave={this.props.onMouseLeave}
					className={this.props.className}
					style={this.props.style}
					isCropperState={this.props.isCropperState}
					imageWidth={this.props.imageWidth}
					imageHeight={this.props.imageHeight}
					displayMode={this.props.displayMode}
					imageUrl={this.props.imageUrl}
					// placeholder={<LazyloadPlaceHolder className={this.props.className} />}
				>
					{this.props.children}
				</ImageView>
			</LazyLoad>
		);

		return ContentComponent;
	}
}

export default LazyLoadImageView;
