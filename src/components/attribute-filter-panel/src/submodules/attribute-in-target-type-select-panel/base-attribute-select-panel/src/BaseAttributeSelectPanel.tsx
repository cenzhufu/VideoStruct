import * as React from 'react';
import ModuleStyle from './index.module.scss';
import AttributeTypeAttributeSelectGroup from '../../../attribute-in-attribute-type-select-group';
import { IFAttributeProperty, IFAttributeGroupProperty } from 'sttypedefine';
import BaseSelectPanel from '../../base-select-panel/src/BaseSelectPanel';

export interface PropsType {
	className: string;

	// 多个属性组的集合对象
	attributes: Array<IFAttributeGroupProperty>;
	// 选择的属性列表
	selectedAttributeList: Array<IFAttributeProperty>;
	// 禁用的属性列表
	disabledAttributeList: Array<IFAttributeProperty>;
	/**
	 * @param {IFAttributeProperty[]} newSelectedList 当前组新选择的所有属性列表
	 * @param {IFAttributeProperty[]} newDeletedList 当前组选择新删除所有属性列表
	 * @param {IFAttributeGroupProperty} attributeGroupInfo 属性的组信息
	 * @param {IFAttributeProperty[]} selectd 当前组选择的所有属性列表
	 */
	onSelected: (
		newSelectedList: IFAttributeProperty[],
		newDeletedList: IFAttributeProperty[],
		attributeGroupInfo: IFAttributeGroupProperty,
		selected: IFAttributeProperty[]
	) => void;
}

type StateType = {};

function noop() {}

class BaseAttributeSelectpanel extends BaseSelectPanel<PropsType, StateType> {
	static defaultProps = {
		selectedAttributeList: [],
		disabledAttributeList: [],
		onSelected: noop,
		className: ''
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {};
	}

	/**
	 * @param {IFAttributeProperty[]} selected 某一组选择的所有属性列表
	 * @param {IFAttributeGroupProperty} groupInfo 属性的组信息
	 * @param {IFAttributeGroupProperty} prevSelectedList 上次选择某一组选择的所有属性列表
	 * @returns {void}
	 */
	onSelected = (
		selected: Array<IFAttributeProperty>,
		groupInfo: IFAttributeGroupProperty,
		prevSelectedList: Array<IFAttributeProperty>
	) => {
		// 找出新增的那个
		let newSelectedList: Array<IFAttributeProperty> = this._inAButNotInB(
			selected,
			prevSelectedList
		);

		// 找出删除的那个
		let newDeletedList: Array<IFAttributeProperty> = this._inAButNotInB(
			prevSelectedList,
			selected
		);

		this.props.onSelected(newSelectedList, newDeletedList, groupInfo, selected);
	};

	render() {
		const { attributes } = this.props;

		const RadioGroupComponent = attributes.map(
			(group: IFAttributeGroupProperty, index) => {
				// 找到选择的属性
				let selected: string[] = [];
				let disabled: string[] = [];
				for (let i = 0; i < this.props.selectedAttributeList.length; i++) {
					// 只看当前group的
					if (
						this.props.selectedAttributeList[i].attributeType ===
						group.attributeType
					) {
						selected.push(this.props.selectedAttributeList[i].uuid);
					}
				}

				for (let i = 0; i < this.props.disabledAttributeList.length; i++) {
					// 只看当前group的
					disabled.push(this.props.disabledAttributeList[i].uuid);
				}
				return (
					<AttributeTypeAttributeSelectGroup
						key={group.uuid}
						attributeGroupInfo={group}
						onSelected={this.onSelected}
						selectedValues={selected}
						disabledValues={disabled}
					/>
				);
			}
		);

		return (
			<div
				className={`${ModuleStyle['structural-attribute-panel']} ${
					this.props.className
				}`}
			>
				{RadioGroupComponent}
			</div>
		);
	}
}

export default BaseAttributeSelectpanel;
