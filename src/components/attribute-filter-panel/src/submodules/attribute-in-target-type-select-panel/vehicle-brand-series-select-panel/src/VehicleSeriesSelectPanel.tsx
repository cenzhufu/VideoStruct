import * as React from 'react';
import { IFAttributeProperty } from 'stsrc/type-define';
import BaseSelectPanel from '../../base-select-panel/src/BaseSelectPanel';
import { List, Checkbox } from 'antd';
import ModuelStyle from './index.module.scss';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import * as intl from 'react-intl-universal';

interface PropsType {
	// 多个属性组的集合对象
	// attributes: Array<IFAttributeGroupProperty>;
	attributeProperties: Array<IFAttributeProperty>;
	// 选择的属性列表
	selectedAttributeList: Array<IFAttributeProperty>;
	// 禁用的属性列表
	disabledAttributeList: Array<IFAttributeProperty>;

	onChange: (
		newSelectedList: IFAttributeProperty[],
		newDeletedList: IFAttributeProperty[]
	) => void;

	currentPresentedBrandAttribute: IFAttributeProperty; // 当前展示的车辆品牌的属性
	onSelectedBrand: (brandProperty: IFAttributeProperty) => void;
	onUnselectedBrand: (brandProperty: IFAttributeProperty) => void;
}

interface StateType {}

function noop() {}

class VehicleSeriesSelectPanel extends BaseSelectPanel<PropsType, StateType> {
	static defaultProps = {
		attributeProperties: [],
		selectedAttributeList: [],
		disabledAttributeList: [],
		onChange: noop,
		onSelectedBrand: noop,
		onUnselectedBrand: noop
	};

	constructor(props: PropsType) {
		super(props);

		this.state = {};
	}

	onChange = (event: CheckboxChangeEvent) => {
		if (event.target.checked) {
			this.props.onChange([event.target.value], []);
		} else {
			this.props.onChange([], [event.target.value]);
		}
	};

	onChangeSelectAll = (event: CheckboxChangeEvent) => {
		if (event.target.checked) {
			this.props.onSelectedBrand(this.props.currentPresentedBrandAttribute);
		} else {
			this.props.onUnselectedBrand(this.props.currentPresentedBrandAttribute);
		}
	};

	isChecked(item: IFAttributeProperty) {
		if (this.isSelectedAll()) {
			return true;
		}

		for (let selectedItem of this.props.selectedAttributeList) {
			if (item.uuid === selectedItem.uuid) {
				return true;
			}
		}

		return false;
	}

	isSelectedAll() {
		for (let property of this.props.selectedAttributeList) {
			if (property.uuid === this.props.currentPresentedBrandAttribute.uuid) {
				// 判断是否选择了当前的品牌
				return true;
			}
		}
		return false;
	}

	renderItem = (item: IFAttributeProperty) => {
		return (
			<List.Item className={ModuelStyle['series-item']}>
				<Checkbox
					value={item}
					checked={this.isChecked(item)}
					disabled={this.isSelectedAll()}
					onChange={this.onChange}
				>
					{/* 不用国际化 */}
					{item.defaultTip}
				</Checkbox>
			</List.Item>
		);
	};

	render() {
		return (
			<div className={ModuelStyle['series-attribute-panel']}>
				<div className={ModuelStyle['select-all']}>
					<Checkbox
						onChange={this.onChangeSelectAll}
						checked={this.isSelectedAll()}
					>
						{intl
							.get('VEHICLE_BRAND_SERIES_ATTRIBUTE_SELECTOR_ALL')
							.d('全部选择')}
					</Checkbox>
				</div>

				<List
					className={ModuelStyle['series-list-container']}
					size="small"
					dataSource={this.props.attributeProperties}
					renderItem={this.renderItem}
				/>
			</div>
		);
	}
}

export default VehicleSeriesSelectPanel;
