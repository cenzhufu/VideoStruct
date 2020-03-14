import * as React from 'react';
import ModuleStyle from './index.module.scss';

import * as intl from 'react-intl-universal';
import { IFAttributeProperty, IFAttributeGroupProperty } from 'sttypedefine';
import { BaseAttributeSelectpanel } from '../../base-attribute-select-panel';

import { AllAttributes } from '../../../../attribute-config';
import { Button } from 'antd';
import BaseSelectPanel from '../../base-select-panel/src/BaseSelectPanel';

export interface PropsType {
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
	onReset: () => void;
}

interface StateType {
	newSelectedAttributes: Array<IFAttributeProperty>;
	newDeletedAttributes: Array<IFAttributeProperty>;

	originalSelectedAttributesListCopy: Array<IFAttributeProperty>;
	selectedAttributeListCopy: Array<IFAttributeProperty>;
	disabledAttributeListCopy: Array<IFAttributeProperty>;
}

function noop() {}

class FaceAttributeSelectpanel extends BaseSelectPanel<PropsType, StateType> {
	static defaultProps = {
		selectedAttributeList: [],
		disabledAttributeList: [],
		onSelected: noop,
		onClickOk: noop,
		onClickCancel: noop,
		onReset: noop
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			newSelectedAttributes: [],
			newDeletedAttributes: [],

			selectedAttributeListCopy: [...props.selectedAttributeList],
			originalSelectedAttributesListCopy: [...props.selectedAttributeList],
			disabledAttributeListCopy: [...props.disabledAttributeList]
		};
	}

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

	onClickCancel = () => {
		this.props.onClickCancel();
	};

	onReset = () => {
		// 清空
		// this.props.onReset();
		for (let item of this.props.attributes) {
			this.onChangeFace([], [], item, []);
		}
	};

	onChangeFace = (
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
				// 计算新删除的和新添加的
				// 获取当前选择的attributes
				let disableAttributes = this.generateDisableAttributeList(
					this.state.selectedAttributeListCopy,
					AllAttributes
				);
				this.setState({
					disabledAttributeListCopy: disableAttributes
				});
			}
		);
	};

	render() {
		return (
			<div className={ModuleStyle['structural-attribute-panel']}>
				<BaseAttributeSelectpanel
					className={ModuleStyle['content-container']}
					selectedAttributeList={this.state.selectedAttributeListCopy}
					disabledAttributeList={this.state.disabledAttributeListCopy}
					attributes={this.props.attributes}
					onSelected={this.onChangeFace}
				/>
				<div className={ModuleStyle['button-container']}>
					<div className={ModuleStyle['left-part']}>
						<Button
							onClick={this.onClickCancel}
							className={ModuleStyle['button-cancel']}
						>
							{intl.get('FACE_ATTRIBUTE_SELECTOR_CANCEL').d('取消')}
						</Button>
						<Button
							onClick={this.onReset}
							className={ModuleStyle['button-cancel']}
						>
							{intl.get('FACE_ATTRIBUTE_SELECTOR_RESET').d('重置')}
						</Button>
					</div>

					<Button onClick={this.onClickOk} className={ModuleStyle['button-ok']}>
						{intl.get('FACE_ATTRIBUTE_SELECTOR_OK').d('确定')}
					</Button>
				</div>
			</div>
		);
	}
}

export default FaceAttributeSelectpanel;
