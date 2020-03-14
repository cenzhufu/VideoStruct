import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import {
	StructuralItemPropsType,
	DeleteButtonShowMode
} from '../../base/StructuralItem';
import ModuleStyle from './index.module.scss';
import StructuralItemCar from '../../car';
import { ImageDisplayMode } from 'ifvendors/image-view';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import {
	IFAttributeProperty,
	EVehicleAttributeType,
	ETargetType
} from 'stsrc/type-define';
import { Icon } from 'antd';
import * as moment from 'moment';
import * as intl from 'react-intl-universal';
import CarLicenseNumber from 'stsrc/components/car-license';

function noop() {}
class StructuralItemWithAttributeCar extends STComponent<
	StructuralItemPropsType
> {
	static defaultProps = {
		className: '',
		contentClassName: ModuleStyle['structrual-item-content'],
		style: {},

		children: [],
		imageChildren: [],

		clickable: false,
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
		thumbFlag: EThumbFlag.Thumb200x160,

		onMouseEnter: noop,
		onMouseLeave: noop
	};
	render() {
		let allProperties: Array<IFAttributeProperty> = this.props
			.structuralItemInfo.attributeProperties;

		let carLicenseColor: IFAttributeProperty | undefined;
		let carLicenseNumber: IFAttributeProperty | undefined;
		let otherProperies: Array<IFAttributeProperty> = [];
		for (let property of allProperties) {
			if (property.attributeType === EVehicleAttributeType.CarLicenseColor) {
				carLicenseColor = property;
				continue;
			}

			if (property.attributeType === EVehicleAttributeType.CarLicenseNumber) {
				carLicenseNumber = property;
				continue;
			}

			if (property.targetType === ETargetType.Vehicle) {
				otherProperies.push(property);
			}
		}

		return (
			<div className={ModuleStyle['car-item']}>
				<StructuralItemCar
					className={ModuleStyle['car-attribute-item']}
					structuralItemInfo={this.props.structuralItemInfo}
				/>
				<div className={ModuleStyle['other-info']}>
					<div>
						<CarLicenseNumber
							licenseColor={carLicenseColor}
							licenseNumber={carLicenseNumber}
							className={ModuleStyle['structural-car-license-plate']}
						/>
						{otherProperies.map((item: IFAttributeProperty, index: number) => {
							if (index < 3) {
								return (
									<div
										key={index}
										className={ModuleStyle['structural-car-attribute-item']}
										title={
											item.tipLabelKey
												? `${intl.get(item.tipLabelKey).d(item.defaultTip)}`
												: ''
										}
									>
										<div
											className={
												ModuleStyle['structural-car-attribute-item-title']
											}
										>
											{intl.get(item.keyTipLabelKey).d(item.keyDefaultTip)}:
										</div>
										<div
											className={
												ModuleStyle['structural-car-attribute-item-value']
											}
										>
											{intl.get(item.tipLabelKey).d(item.defaultTip)}
										</div>
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

export default StructuralItemWithAttributeCar;
