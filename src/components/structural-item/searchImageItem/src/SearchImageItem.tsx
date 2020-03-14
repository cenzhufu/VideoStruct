import * as React from 'react';
import {
	StructuralItem,
	DeleteButtonShowMode
} from 'stcomponents/structural-item';
import { IFStructuralInfo } from 'sttypedefine';
import { Icon } from 'antd';
import { ReactComponent as SelectedIcon } from './assets/imgs/selected.svg';
import ModuleStyle from './assets/styles/index.module.scss';
import STComponent from 'stcomponents/st-component';

interface PropsType {
	structuralItemInfo: IFStructuralInfo; //圖片信息
	selected: boolean;

	/** 可选项 */
	clickable: boolean;
	onClick: (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 点击事件,查看大图

	deletable: boolean; // 是否可删除
	onDelete: (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 删除事件
	deleteButtonShowMode: DeleteButtonShowMode; // 删除按钮显示的模式
	className: string;
	contentClassName: string;
	style: Object; //

	draggableData?: Object; // 拖动的数据
}

interface StateType {
	imageInfo: IFStructuralInfo;
}

function nooe() {}

class SearchImageItem extends STComponent<PropsType, StateType> {
	static defaultProps = {
		className: '',
		contentClassName: '',
		style: {},
		onClick: nooe,
		onDelete: nooe,
		clickable: false,
		deletable: true,
		selected: true
	};
	onClick = (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => {
		if (this.props.onClick) {
			this.props.onClick(structuralItemInfo, event);
		}
	};
	render() {
		return (
			<StructuralItem
				className={this.props.className}
				style={this.props.style}
				contentClassName={
					this.props.contentClassName || ModuleStyle['result-image-item']
				}
				structuralItemInfo={this.props.structuralItemInfo}
				draggableData={this.props.structuralItemInfo}
				deletable={this.props.deletable}
				deleteButtonShowMode={this.props.deleteButtonShowMode}
				clickable={this.props.clickable}
				onDelete={this.props.onDelete}
				onClick={this.onClick}
				imageChildren={
					this.props.selected ? (
						<div className={ModuleStyle['select-icon-container']}>
							<Icon
								className={ModuleStyle['select-icon']}
								component={SelectedIcon}
							/>
						</div>
					) : (
						''
					)
				}
			/>
		);
	}
}

export default SearchImageItem;
