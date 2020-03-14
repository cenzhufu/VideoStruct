import * as React from 'react';
import {
	IFAttributeGroupProperty,
	IFAttributeProperty,
	EVehicleAttributeType
} from 'stsrc/type-define';
import BaseSelectPanel from '../../base-select-panel/src/BaseSelectPanel';
import { List, Checkbox, Button } from 'antd';
import * as intl from 'react-intl-universal';
import ModuelStyle from './index.module.scss';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface PropsType {
	// 多个属性组的集合对象
	attributes: Array<IFAttributeGroupProperty>;
	// 选择的属性列表
	selectedAttributeList: Array<IFAttributeProperty>;
	// 禁用的属性列表
	disabledAttributeList: Array<IFAttributeProperty>;

	onClickOk: (
		newSelectedAttributeProperties: Array<IFAttributeProperty>,
		newDeleteAttributeProperties: Array<IFAttributeProperty>
	) => void;
	onClickCancel: () => void;
}

interface StateType {
	selectedAttributeListCopy: Array<IFAttributeProperty>;
	originalSelectedAttributesListCopy: Array<IFAttributeProperty>;
}

function noop() {}

class VehicleColorAttributesSelectPanel extends BaseSelectPanel<
	PropsType,
	StateType
> {
	static defaultProps = {
		attributes: [],
		selectedAttributeList: [],
		disabledAttributeList: [],
		onClickOk: noop,
		onClickCancel: noop
	};

	constructor(props: PropsType) {
		super(props);

		this.state = {
			selectedAttributeListCopy: [...props.selectedAttributeList],
			originalSelectedAttributesListCopy: [...props.selectedAttributeList]
		};
	}

	onChange = (event: CheckboxChangeEvent) => {
		if (event.target.checked) {
			this.onChangeProperty(
				[event.target.value],
				[],
				this.props.attributes[0],
				[]
			);
		} else {
			this.onChangeProperty(
				[],
				[event.target.value],
				this.props.attributes[0],
				[]
			);
		}
	};

	onChangeProperty = (
		newSelectedList: IFAttributeProperty[],
		newDeletedList: IFAttributeProperty[],
		attributeGroupInfo: IFAttributeGroupProperty,
		selectedFaceAttributeList: IFAttributeProperty[]
	) => {
		// 修改选择的属性列表
		this.setState(
			(prevState: StateType) => {
				// 移除其他相同的attribute type (保证单选逻辑)
				let {
					selectedList: prevSelectedList
				} = this.removeSelectedAttributeOfType(
					prevState.selectedAttributeListCopy,
					attributeGroupInfo.attributeType
				);

				// 因为选择的时候会取消against所选择的
				let {
					selectedList: prevSelectedListForAgainst
				} = this.applyAgainstPropsForSelecctProperties(
					newSelectedList,
					prevSelectedList
				);

				// 删除元素时，对应的enable也要删除
				let {
					selectedList: prevSelectedListForEnable
				} = this.applyEnablePropsForDeleteProperties(
					newDeletedList,
					prevSelectedListForAgainst
				);

				// 添加
				prevSelectedListForEnable.push(...newSelectedList);
				return {
					selectedAttributeListCopy: this.sort(prevSelectedListForEnable)
				};
			},
			() => {
				// 获取当前选择的attributes(这儿没有需要禁用的，所以不计算了)
				// let disableAttributes = this.generateDisableAttributeList(
				// 	this.state.selectedAttributeListCopy,
				// 	AllAttributes
				// );
				// this.setState({
				// 	disabledAttributeListCopy: disableAttributes
				// });
			}
		);
	};

	isChecked(item: IFAttributeProperty) {
		for (let selectedItem of this.state.selectedAttributeListCopy) {
			if (item.uuid === selectedItem.uuid) {
				return true;
			}
		}

		return false;
	}

	onClickCancel = () => {
		this.props.onClickCancel();
	};

	onClickOk = () => {
		// new added
		let newAdded: Array<IFAttributeProperty> = this._inAButNotInB(
			this.state.selectedAttributeListCopy,
			this.state.originalSelectedAttributesListCopy
		);

		let newDeleted: Array<IFAttributeProperty> = this._inAButNotInB(
			this.state.originalSelectedAttributesListCopy,
			this.state.selectedAttributeListCopy
		);
		this.props.onClickOk(newAdded, newDeleted);
	};
	onReset = () => {
		this.setState({
			selectedAttributeListCopy: this.state.originalSelectedAttributesListCopy.filter(
				(item: IFAttributeProperty) => {
					return item.attributeType !== EVehicleAttributeType.CarColor;
				}
			)
		});
	};

	renderItem = (item: IFAttributeProperty) => {
		return (
			<List.Item className={ModuelStyle['item']}>
				<Checkbox
					value={item}
					checked={this.isChecked(item)}
					onChange={this.onChange}
				>
					{intl.get(item.tipLabelKey).d(item.defaultTip)}
				</Checkbox>
			</List.Item>
		);
	};

	render() {
		return (
			<div className={ModuelStyle['structural-attribute-panel']}>
				<List
					className={ModuelStyle['list-container']}
					size="small"
					dataSource={this.props.attributes[0].items}
					renderItem={this.renderItem}
				/>
				<div className={ModuelStyle['button-container']}>
					<div>
						<Button
							onClick={this.onClickCancel}
							className={ModuelStyle['button-cancel']}
						>
							{intl.get('VEHICLE_COLOR_ATTRIBUTE_SELECTOR_CANCEL').d('取消')}
						</Button>
						<Button
							className={ModuelStyle['button-reset']}
							onClick={this.onReset}
						>
							{intl.get('VEHICLE_COLOR_ATTRIBUTE_SELECTOR_RESET').d('重置')}
						</Button>
					</div>
					<Button onClick={this.onClickOk} className={ModuelStyle['button-ok']}>
						{intl.get('VEHICLE_COLOR_ATTRIBUTE_SELECTOR_OK').d('确定')}
					</Button>
				</div>
			</div>
		);
	}
}

export default VehicleColorAttributesSelectPanel;
