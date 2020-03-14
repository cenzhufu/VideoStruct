import * as React from 'react';
import ModuleStyle from './index.module.scss';
import LazyLoadImageView from 'ifvendors/lazyload-imageview';
type PropsType = {
	className: string;
	style: Object;
	imgs: Array<string>;
};

class MultiPictureImageView extends React.Component<PropsType> {
	static defaultProps = {
		className: '',
		style: {},
		imgs: []
	};

	render() {
		return (
			<div
				className={`${ModuleStyle['multi-pictures-image-view']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				{this.props.imgs.length
					? this.props.imgs.map((url: string) => {
							return <LazyLoadImageView imageUrl={url} />;
					  })
					: '暂无图片'}
			</div>
		);
	}
}

export default MultiPictureImageView;
