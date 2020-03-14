import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import {
	StructuralItemPropsType,
	DeleteButtonShowMode
} from '../../base/StructuralItem';
import StructuralItemFace from '../../face';
import ModuleStyle from './index.module.scss';
import { ImageDisplayMode } from 'ifvendors/image-view';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import { IFAttributeProperty, ETargetType } from 'stsrc/type-define';
import * as intl from 'react-intl-universal';
import { Icon } from 'antd';
import * as moment from 'moment';

function noop() {}

class StructuralItemWithAttributeFace extends STComponent<
	StructuralItemPropsType
> {
	static defaultProps = {
		className: '',
		contentClassName: ModuleStyle['structrual-item-content'],
		style: {},

		children: [],
		imageChildren: [],

		clickable: true,
		onClick: noop,
		deletable: false,
		onDelete: noop,
		deleteButtonShowMode: DeleteButtonShowMode.Hover,
		deleteButtonClass: '',

		draggable: true,
		draggableData: {},
		onDragStart: noop,
		onDragEnd: noop,
		displayMode: ImageDisplayMode.ScaleAspectFit,
		thumbFlag: EThumbFlag.Thumb100x100,

		onMouseEnter: noop,
		onMouseLeave: noop
	};
	render() {
		let allProperties: Array<IFAttributeProperty> = this.props
			.structuralItemInfo.attributeProperties;
		let otherProperies: Array<IFAttributeProperty> = [];
		for (let property of allProperties) {
			if (property.targetType === ETargetType.Face) {
				otherProperies.push(property);
			}
		}

		return (
			<div className={ModuleStyle['face-item']}>
				<StructuralItemFace
					className={ModuleStyle['face-attribute-item']}
					structuralItemInfo={this.props.structuralItemInfo}
				/>
				<div className={ModuleStyle['other-info']}>
					<div>
						{otherProperies.map((item: IFAttributeProperty, index: number) => {
							if (index < 3) {
								return (
									<div
										key={index}
										className={ModuleStyle['structural-face-attribute-item']}
										title={
											item.tipLabelKey
												? `${intl.get(item.tipLabelKey).d(item.defaultTip)}`
												: ''
										}
									>
										<span
											className={
												ModuleStyle['structural-face-attribute-item-title']
											}
										>
											{intl.get(item.keyTipLabelKey).d(item.keyDefaultTip)}:
										</span>
										{intl.get(item.tipLabelKey).d(item.defaultTip)}
									</div>
								);
							} else {
								return null;
							}
						})}
					</div>
					<div>
						<Icon type="clock-circle" />
						<span style={{ marginLeft: '8px' }}>
							{moment(this.props.structuralItemInfo.time).format('HH:mm:ss')}
						</span>
					</div>
				</div>
			</div>
		);
	}
}

export default StructuralItemWithAttributeFace;
