import * as React from 'react';
import IFComponent from 'ifvendors/if-component';
import { Checkbox } from 'antd';
import * as intl from 'react-intl-universal';
import ModuleStyle from './index.module.scss';
import { IFAttributeProperty, IFAttributeGroupProperty } from 'sttypedefine';
const isEqual = require('lodash/isEqual');

const CheckboxGroup = Checkbox.Group;
// const RadioGroup = Radio.Group;
interface PropType {
	attributeGroupInfo: IFAttributeGroupProperty; //当前要显示的属性选项group数据
	selectedValues: string[]; // 选择的值列表
	disabledValues: string[]; // 禁用的值列表
	/**
	 * @param {IFAttributeProperty[]} selectd 当前组选择的所有属性列表
	 * @param {IFAttributeGroupProperty} attributeGroupInfo 属性的组信息
	 * @memberof PropType
	 */
	onSelected: (
		selected: IFAttributeProperty[],
		attributeGroupInfo: IFAttributeGroupProperty,
		prevSelected: IFAttributeProperty[]
	) => void;
}

interface StateType {
	preSelectedValues: Array<string>;
}

function noop() {}
class AttributeTypeAttributeSelectGroup extends IFComponent<
	PropType,
	StateType
> {
	static defaultProps = {
		onSelected: noop,
		selectedValues: [],
		disabledValues: []
	};

	constructor(props: PropType) {
		super(props);

		this.state = {
			preSelectedValues: this.props.selectedValues
		};
	}

	static getDerivedStateFromProps(
		props: PropType,
		state: StateType
	): Partial<StateType> | null {
		if (!isEqual(props.selectedValues, state.preSelectedValues)) {
			return {
				preSelectedValues: props.selectedValues
			};
		}

		return null;
	}

	onChange = (checkedValues: string[]) => {
		// @ts-ignore
		let selectedAttributeList: Array<IFAttributeProperty> = checkedValues
			.map<IFAttributeProperty | null>((value: string) => {
				return this.getAttributeInfo(value);
			})
			.filter((info: IFAttributeProperty | null) => {
				return info !== null;
			});

		// @ts-ignore 上次选择的list
		let prevSelectedAttributeList: Array<
			IFAttributeProperty
		> = this.state.preSelectedValues
			.map<IFAttributeProperty | null>((value: string) => {
				return this.getAttributeInfo(value);
			})
			.filter((info: IFAttributeProperty | null) => {
				return info !== null;
			});

		this.setState(
			{
				preSelectedValues: checkedValues
			},
			() => {
				this.props.onSelected(
					selectedAttributeList,
					this.props.attributeGroupInfo,
					prevSelectedAttributeList
				);
			}
		);
	};

	/**
	 * 通过uuid找到对应的属性信息
	 * @param {string} uuid uuid
	 * @returns {(IFAttributeProperty | null)} 属性信息(如果找到的话)
	 * @memberof AttributeTypeAttributeSelectGroup
	 */
	getAttributeInfo(uuid: string): IFAttributeProperty | null {
		if (!uuid) {
			return null;
		}

		for (let attributeInfo of this.props.attributeGroupInfo.items) {
			if (uuid === attributeInfo.uuid) {
				return attributeInfo;
			}
		}

		return null;
	}

	isDisabled(attribute: IFAttributeProperty): boolean {
		for (let disabledValue of this.props.disabledValues) {
			if (attribute.uuid === disabledValue) {
				return true;
			}
		}
		return false;
	}

	render() {
		const { attributeGroupInfo } = this.props;

		let disabledGroup = false; //选项group是否互斥禁用

		//属性选项option
		const option = [];
		for (let item of attributeGroupInfo.items) {
			const label = intl.get(item.tipLabelKey).d(item.defaultTip);
			const value = item.uuid;
			const disabled = this.isDisabled(item);
			option.push({ label, value, disabled });
		}

		return (
			<div className={ModuleStyle['attr-group']}>
				<label
					style={{
						width: '100px',
						textAlign: 'left',
						//paddingRight: '16px',
						// color: 'rgba(191, 191, 191, 1)'
						color: '#8395A7',
						lineHeight: 2.5
					}}
				>
					{intl
						.get(attributeGroupInfo.tipLabelKey)
						.d(attributeGroupInfo.defaultTip)}
				</label>
				<CheckboxGroup
					options={option}
					value={disabledGroup ? [] : this.props.selectedValues} // 选中的项
					onChange={this.onChange}
					disabled={disabledGroup}
				/>
			</div>
		);
	}
}

export default AttributeTypeAttributeSelectGroup;
