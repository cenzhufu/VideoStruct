import * as React from 'react';
import ModuleStyle from './index.module.scss';
import { IFAttributeProperty, IFAttributeGroupProperty } from 'sttypedefine';
import { BaseAttributeSelectpanel } from '../../base-attribute-select-panel';
import { Button } from 'antd';
import * as intl from 'react-intl-universal';
import BaseSelectPanel from '../../base-select-panel/src/BaseSelectPanel';
import { AllAttributes } from 'stsrc/components/attribute-filter-panel/src/attribute-config';

type PropsType = {
	clothesGroupAttributes: Array<IFAttributeGroupProperty>;
	trousesGroupAttributes: Array<IFAttributeGroupProperty>;
	overcoatGroupAttributes: Array<IFAttributeGroupProperty>;
	bagGroupAttrutes: Array<IFAttributeGroupProperty>;

	disabledAttributeList: Array<IFAttributeProperty>;

	selectedAttributeList: Array<IFAttributeProperty>;

	onClickOk: (
		newSelectedAttributeProperties: Array<IFAttributeProperty>,
		newDeleteAttributeProperties: Array<IFAttributeProperty>
	) => void;
	onClickCancel: () => void;
};

type StateType = {
	originalSelectedAttributesListCopy: Array<IFAttributeProperty>;
	selectedAttributeListCopy: Array<IFAttributeProperty>;
	disabledAttributeListCopy: Array<IFAttributeProperty>;
};

function noop() {}

class BodyAttributeSelectpanel extends BaseSelectPanel<PropsType, StateType> {
	static defaultProps = {
		selectedAttributeList: [],
		onSelected: noop,
		clothesGroupAttributes: [],
		trousesGroupAttributes: [],
		overcoatGroupAttributes: [],
		bagGroupAttrutes: [],
		onClickOk: noop,
		onClickCancel: noop
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
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
		for (let item of this.props.clothesGroupAttributes) {
			this.onChangeBody([], [], item, []);
		}
		for (let item of this.props.trousesGroupAttributes) {
			this.onChangeBody([], [], item, []);
		}
		for (let item of this.props.overcoatGroupAttributes) {
			this.onChangeBody([], [], item, []);
		}
		for (let item of this.props.bagGroupAttrutes) {
			this.onChangeBody([], [], item, []);
		}
	};

	onChangeBody = (
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
				<div className={ModuleStyle['content-container']}>
					<BaseAttributeSelectpanel
						selectedAttributeList={this.state.selectedAttributeListCopy}
						disabledAttributeList={this.state.disabledAttributeListCopy}
						attributes={this.props.clothesGroupAttributes}
						onSelected={this.onChangeBody}
					/>
					<BaseAttributeSelectpanel
						selectedAttributeList={this.state.selectedAttributeListCopy}
						disabledAttributeList={this.state.disabledAttributeListCopy}
						attributes={this.props.trousesGroupAttributes}
						onSelected={this.onChangeBody}
					/>
					<BaseAttributeSelectpanel
						selectedAttributeList={this.state.selectedAttributeListCopy}
						disabledAttributeList={this.state.disabledAttributeListCopy}
						attributes={this.props.overcoatGroupAttributes}
						onSelected={this.onChangeBody}
					/>
					<BaseAttributeSelectpanel
						selectedAttributeList={this.state.selectedAttributeListCopy}
						disabledAttributeList={this.state.disabledAttributeListCopy}
						attributes={this.props.bagGroupAttrutes}
						onSelected={this.onChangeBody}
					/>
				</div>
				<div className={ModuleStyle['button-container']}>
					<div className={ModuleStyle['left-part']}>
						<Button
							onClick={this.onClickCancel}
							className={ModuleStyle['button-cancel']}
						>
							{intl.get('BODY_ATTRIBUTE_SELECTOR_CANCEL').d('取消')}
						</Button>
						<Button
							onClick={this.onReset}
							className={ModuleStyle['button-cancel']}
						>
							{intl.get('BODY_ATTRIBUTE_SELECTOR_RESET').d('重置')}
						</Button>
					</div>
					<Button onClick={this.onClickOk} className={ModuleStyle['button-ok']}>
						{intl.get('BODY_ATTRIBUTE_SELECTOR_OK').d('确定')}
					</Button>
				</div>
			</div>
		);
	}

	/*********************** 辅助函数 ***************************/

	/**
	 * 获得在AList里边，却不再BList里边(A - (A and B))
	 * @param {Array<IFAttributeProperty>} ALIst list a
	 * @param {Array<IFAttributeProperty>} BList list b
	 * @returns {Array<IFAttributeProperty>} 结果元素list
	 * @memberof AttributeTypeAttributeSelectGroup
	 */
	_inAButNotInB(
		ALIst: Array<IFAttributeProperty>,
		BList: Array<IFAttributeProperty>
	): Array<IFAttributeProperty> {
		let results: Array<IFAttributeProperty> = [];
		for (let aelement of ALIst) {
			let exist = false;
			for (let belement of BList) {
				if (Object.is(aelement.uuid, belement.uuid)) {
					exist = true;
					break;
				}
			}

			if (!exist) {
				results.push(aelement);
			}
		}

		return results;
	}
}

export default BodyAttributeSelectpanel;
