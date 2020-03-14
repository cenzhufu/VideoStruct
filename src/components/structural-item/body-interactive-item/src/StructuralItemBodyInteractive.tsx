import STComponent from 'stsrc/components/st-component';
import StructuralItemBodyWithTip from 'stsrc/components/structural-item/body-with-tip';
import {
	DeleteButtonShowMode,
	StructuralItemPropsType
} from '../../base/StructuralItem';
import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import * as intl from 'react-intl-universal';
import { Icon } from 'antd';
import { ReactComponent as SelectedIcon } from './assets/imgs/selected.svg';
import { IFStructuralInfo } from 'stsrc/type-define';
import { ImageDisplayMode } from 'ifvendors/image-view';
import { EThumbFlag } from 'stsrc/utils/requests/tools';

export enum EBodySize {
	Normal = 'normal',
	Big = 'big'
}

interface PropsType extends StructuralItemPropsType {
	size: EBodySize;
	structuralItemInfo: IPathType;
	showBigPic: () => void;
	onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
	onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
	onImgSelect: (id: string) => void;
}

interface IPathType extends IFStructuralInfo {
	isSelected?: boolean;
}

interface StateType {
	isHover: boolean;
}

function noop() {}
class StructuralItemBodyInteractive extends STComponent<PropsType, StateType> {
	static defaultProps = {
		structuralItemInfo: {},
		size: EBodySize.Big,
		onImgSelect: noop,
		showBigPic: noop,
		onMouseEnter: noop,
		onMouseLeave: noop,
		clickable: true,
		deletable: false,
		draggable: true,
		onClick: noop,
		onDragEnd: noop,
		onDragStart: noop,
		onDelete: noop,
		className: '',
		contentClassName: '',
		style: {},
		children: [],
		imageChildren: [],
		deleteButtonShowMode: DeleteButtonShowMode.Hover,
		deleteButtonClass: '',
		displayMode: ImageDisplayMode.ScaleAspectFit,
		thumbFlag: EThumbFlag.Thumb100x100
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			isHover: false
		};
	}
	onShowBigPic = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		this.props.showBigPic();
	};
	handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
		this.setState({
			isHover: true
		});
	};
	handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
		this.setState({
			isHover: false
		});
	};
	onImgSelect = (id: string) => {
		this.props.onImgSelect(id);
	};
	render() {
		const isSelected = this.props.structuralItemInfo
			? this.props.structuralItemInfo.isSelected
			: false;
		return (
			<StructuralItemBodyWithTip
				className={`${this.props.className}`}
				size={this.props.size}
				style={this.props.style}
				structuralItemInfo={this.props.structuralItemInfo}
				draggableData={this.props.structuralItemInfo}
				imageChildren={[
					<div
						key="body-interactive"
						className={`${ModuleStyle['structural-body-interactive']} ${
							isSelected ? ModuleStyle['isSelected'] : ModuleStyle['noSelected']
						}`}
						onMouseEnter={this.handleMouseEnter}
						onMouseLeave={this.handleMouseLeave}
						onClick={this.onImgSelect.bind(
							this,
							this.props.structuralItemInfo.id
						)}
					>
						<div
							className={`${ModuleStyle['select-icon-container']} ${
								isSelected
									? ModuleStyle['isSelected-icon']
									: ModuleStyle['noSelected-icon']
							}`}
						>
							{isSelected && (
								<Icon
									className={ModuleStyle['select-icon']}
									component={SelectedIcon}
								/>
							)}
						</div>
						{this.state.isHover && (
							<div className={ModuleStyle['mask']}>
								<div
									className={ModuleStyle['show-big-pic-btn']}
									onClick={this.onShowBigPic}
								>
									{intl.get('BODY_INTERACTIVE_ITEM_VIEW_BIG_PIC').d('查看大图')}
								</div>
							</div>
						)}
					</div>
				]}
				onClick={this.props.onClick}
			/>
		);
	}
}

export default StructuralItemBodyInteractive;
