import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import { IFOriginalImageInfo } from 'stsrc/utils/requests/collection-request';
import LazyLoadImageView from 'ifvendors/lazyload-imageview';
import Config from 'stsrc/utils/config';
import { EThumbFlag, validateImageUrlField } from 'stsrc/utils/requests/tools';

interface PropsType {
	style: React.CSSProperties;
	structuralItemInfo: IFOriginalImageInfo;
	className: string;
	onClick: (event: React.SyntheticEvent<HTMLDivElement>) => void;
}

function noop() {}
export enum EBodySize {
	Normal = 'normal',
	Big = 'big'
}

class StructuralScrollItem extends STComponent<PropsType> {
	static defaultProps = {
		onClick: noop,
		className: '',
		style: {}
	};
	render() {
		return (
			<div
				className={`${ModuleStyle['scroll-item-container']} ${
					this.props.className
				}`}
			>
				<LazyLoadImageView
					className={ModuleStyle['scroll-img']}
					imageUrl={validateImageUrlField(
						this.props.structuralItemInfo.url,
						Config.isThumbnailEnabled(),
						EThumbFlag.Thumb200x160
					)}
					onClick={this.props.onClick}
					style={{ height: '100%' }}
				>
					{this.props.children}
				</LazyLoadImageView>
			</div>
		);
	}
}

export default StructuralScrollItem;
