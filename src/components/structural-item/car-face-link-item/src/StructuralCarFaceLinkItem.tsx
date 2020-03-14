import STPureComponent from 'stsrc/components/st-component';
import StructuralItemFace from '../../face';
// import { ETaskType } from 'stsrc/type-define';
import StructuralInfoTipSegements from 'stsrc/components/structural-info-segements';
// import Segments from 'ifvendors/segments';
import * as React from 'react';
import * as intl from 'react-intl-universal';
import ModuleStyle from './assets/styles/index.module.scss';
import StructuralItemCar from '../../car';
import {
	StructuralItemPropsType,
	DeleteButtonShowMode
} from '../../base/StructuralItem';
import { ImageDisplayMode } from 'ifvendors/image-view';
import {
	ETaskType,
	IFStructuralLinkInfo,
	DateFormat,
	EVehicleAttributeType,
	IFAttributeProperty
} from 'stsrc/type-define';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import CarLicenseNumber from 'stsrc/components/car-license';
import { ReactComponent as LinkIcon } from './assets/images/car-link-face.svg';
import FacePlaceholder from './assets/images/face.png';
import { Icon } from 'antd';
interface PropsType
	extends Pick<
		StructuralItemPropsType,
		Exclude<keyof StructuralItemPropsType, 'structuralItemInfo'>
	> {
	structuralLinkInfo: IFStructuralLinkInfo;

	taskType: ETaskType; // 任务类型
	taskTime: typeof DateFormat; // 任务的时间戳
	threshold: number; // 相似度
}
export enum carAttr {
	carType = 'ATTRIBUTE_VEHICLE_BRAND_SERIALS'
}
function noop() {}
class StructuralCarFaceLinkItem extends STPureComponent<PropsType> {
	static defaultProps = {
		className: '',
		contentClassName: '',
		style: {},

		children: [],
		imageChildren: [],

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
		thumbFlag: EThumbFlag.Thumb100x100,

		taskType: ETaskType.Unknown,
		threshold: 0,

		onMouseEnter: noop,
		onMouseLeave: noop
	};

	render() {
		const taskType = this.props.taskType;
		const vehicle = this.props.structuralLinkInfo.vehicle;
		if (!vehicle) {
			return null;
		}

		let otherProperies: Array<IFAttributeProperty> = [];
		let carLicenseColor: IFAttributeProperty | undefined;
		let carLicenseNumber: IFAttributeProperty | undefined;

		const attributeProperties = vehicle.attributeProperties;
		for (const carAttribute of attributeProperties) {
			if (
				carAttribute.attributeType === EVehicleAttributeType.CarLicenseColor
			) {
				carLicenseColor = carAttribute;
				continue;
			}

			if (
				carAttribute.attributeType === EVehicleAttributeType.CarLicenseNumber
			) {
				carLicenseNumber = carAttribute;
				continue;
			}

			otherProperies.push(carAttribute);
		}

		return (
			<div
				className={`${ModuleStyle['structural-wraper']} ${
					this.props.className
				}`}
			>
				<div className={`${ModuleStyle['structural-car']}`}>
					<div className={`${ModuleStyle['structural-car-container']}`}>
						<StructuralItemCar
							style={{ width: '200px' }}
							className={`${ModuleStyle['structural-car-pic']}`}
							contentClassName={this.props.contentClassName}
							structuralItemInfo={vehicle}
							imageChildren={this.props.imageChildren}
							displayMode={this.props.displayMode}
							clickable={true}
							onClick={this.props.onClick}
							deletable={this.props.deletable}
							onDelete={this.props.onDelete}
							deleteButtonShowMode={this.props.deleteButtonShowMode}
							deleteButton={this.props.deleteButton}
							deleteButtonClass={this.props.deleteButtonClass}
							draggable={false}
							draggableData={this.props.draggableData}
							onDragStart={this.props.onDragStart}
							onDragEnd={this.props.onDragEnd}
							thumbFlag={EThumbFlag.Thumb200x160}
						>
							{this.props.children}
						</StructuralItemCar>
						<div
							className={`${
								ModuleStyle['structural-car-link-face-icon-wraper']
							}`}
						>
							{/* <span
								className={`${ModuleStyle['structural-car-link-face-icon']}`}
							/> */}
							<Icon
								component={LinkIcon}
								style={{ width: '10px', height: '20px' }}
							/>
						</div>
						<div
							className={`${ModuleStyle['structural-car-link-face-container']}`}
						>
							{this.props.structuralLinkInfo.face ? (
								<StructuralItemFace
									className={`${this.props.className} ${
										ModuleStyle['structural-car-link-face']
									}`}
									style={this.props.style}
									draggable={true}
									draggableData={this.props.structuralLinkInfo.face}
									structuralItemInfo={this.props.structuralLinkInfo.face}
								/>
							) : (
								<div className={ModuleStyle['face-Placeholder']}>
									<img
										src={FacePlaceholder}
										height={'100%'}
										width={'100%'}
										alt=""
									/>
								</div>
							)}
							<CarLicenseNumber
								licenseColor={carLicenseColor}
								licenseNumber={carLicenseNumber}
							/>
						</div>
					</div>
					{/* 车辆属性 */}
					<div className={ModuleStyle['structural-car-attribute-wraper']}>
						{otherProperies.map((item: IFAttributeProperty, index: number) => {
							if (index < 4) {
								return (
									<div
										key={index}
										className={
											item.keyTipLabelKey === carAttr.carType
												? `${ModuleStyle['structural-car-type']}`
												: `${ModuleStyle['structural-car-attribute']}`
										}
									>
										<div
											className={ModuleStyle['structural-car-attribute-item']}
										/>
										<span>
											{intl.get(item.keyTipLabelKey).d(item.keyDefaultTip)}
										</span>
										：
										<span>{intl.get(item.tipLabelKey).d(item.defaultTip)}</span>
									</div>
								);
							} else {
								return null;
							}
						})}
					</div>
				</div>
				<StructuralInfoTipSegements
					threshold={vehicle.threshold}
					taskType={taskType}
					taskTime={vehicle.time}
					className={`${ModuleStyle['structural-car-threshould']}`}
				/>
			</div>
		);
	}
}

export default StructuralCarFaceLinkItem;
