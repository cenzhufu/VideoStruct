import STPureComponent from 'stsrc/components/st-component';
// import { ETaskType } from 'stsrc/type-define';
import StructuralInfoTipSegements from 'stsrc/components/structural-info-segements';
// import Segments from 'ifvendors/segments';
import * as React from 'react';
import * as intl from 'react-intl-universal';
import ModuleStyle from './index.module.scss';
import StructuralItemCar from '../../car';
import {
	StructuralItemPropsType,
	DeleteButtonShowMode
} from '../../base/StructuralItem';
import { ImageDisplayMode } from 'ifvendors/image-view';
import { IFAttributeProperty, EVehicleAttributeType } from 'stsrc/type-define';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import CarLicenseNumber from 'stsrc/components/car-license';
export enum carAttr {
	carType = 'ATTRIBUTE_VEHICLE_BRAND_SERIALS'
}
interface PropsType extends StructuralItemPropsType {
	// className: string;
	// style: React.CSSProperties;
	// taskType: ETaskType; // 任务类型
	// taskTime: number; // 任务的时间戳
	// threshold: number; // 相似度
}

function noop() {}
class StructuralItemCarWithTip extends STPureComponent<PropsType> {
	static defaultProps = {
		className: '',
		style: {},
		threshold: 0,

		children: [],
		imageChildren: [],

		contentClassName: '',

		clickable: false,
		onClick: noop,
		deletable: false,
		onDelete: noop,
		deleteButtonShowMode: DeleteButtonShowMode.Hover,
		deleteButtonClass: '',

		draggable: false,
		draggableData: {},
		onDragStart: noop,
		onDragEnd: noop,
		displayMode: ImageDisplayMode.ScaleAspectFit,
		thumbFlag: EThumbFlag.Thumb200x160,

		onMouseEnter: noop,
		onMouseLeave: noop
	};

	render() {
		// all properties
		let allProperties: Array<IFAttributeProperty> = this.props
			.structuralItemInfo.attributeProperties;
		// 找到车牌颜色，车牌号码属性
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

			otherProperies.push(property);
		}

		return (
			<div
				className={`${ModuleStyle['structural-wraper']} ${
					this.props.className
				}`}
			>
				<div className={`${ModuleStyle['structural-car-container']}`}>
					<StructuralItemCar
						// style={{ width: '200px' }}
						className={`${ModuleStyle['structural-car-pic']}`}
						contentClassName={this.props.contentClassName}
						structuralItemInfo={this.props.structuralItemInfo}
						imageChildren={this.props.imageChildren}
						displayMode={this.props.displayMode}
						clickable={this.props.clickable}
						onClick={this.props.onClick}
						deletable={this.props.deletable}
						onDelete={this.props.onDelete}
						deleteButtonShowMode={this.props.deleteButtonShowMode}
						deleteButton={this.props.deleteButton}
						deleteButtonClass={this.props.deleteButtonClass}
						draggable={this.props.draggable}
						draggableData={this.props.draggableData}
						onDragStart={this.props.onDragStart}
						onDragEnd={this.props.onDragEnd}
						thumbFlag={this.props.thumbFlag}
					>
						{this.props.children}
					</StructuralItemCar>
					<div className={ModuleStyle['structural-car-attribute']}>
						<CarLicenseNumber
							licenseColor={carLicenseColor}
							licenseNumber={carLicenseNumber}
							className={ModuleStyle['structural-car-license-plate']}
						/>
						{otherProperies.map((item: IFAttributeProperty, index: number) => {
							// const carType =
							// 	item.keyTipLabelKey === carAttr.carType
							// 		? `${ModuleStyle['structural-car-attribute-item-content']} ${
							// 				ModuleStyle['car-model']
							// 		  }`
							// 		: `${ModuleStyle['structural-car-attribute-item-content']}`;
							if (index < 4) {
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
										<span
											className={
												ModuleStyle['structural-car-attribute-item-title']
											}
										>
											{intl.get(item.keyTipLabelKey).d(item.keyDefaultTip)}:
										</span>
										{/* <span
											title={`${intl.get(item.tipLabelKey).d(item.defaultTip)}`}
											className={carType}
										> */}
										{intl.get(item.tipLabelKey).d(item.defaultTip)}
										{/* </span> */}
									</div>
								);
							} else {
								return null;
							}
						})}
					</div>
				</div>
				<StructuralInfoTipSegements
					threshold={0}
					taskType={this.props.structuralItemInfo.taskType}
					taskTime={this.props.structuralItemInfo.time}
					className={`${ModuleStyle['structural-car-threshould']}`}
				/>
			</div>
		);
	}
}

export default StructuralItemCarWithTip;
