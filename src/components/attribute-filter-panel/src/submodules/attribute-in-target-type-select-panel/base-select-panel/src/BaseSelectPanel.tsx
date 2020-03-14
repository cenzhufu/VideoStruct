import * as React from 'react';
import {
	IFAttributeProperty,
	EBodyAttributeType,
	EAttributeType
} from 'stsrc/type-define';
import {
	BodyClothesColorAttributeList,
	BodyTrousersColorAttributeList
} from 'stsrc/components/attribute-filter-panel/src/attribute-config';

// 纯粹用来封装一些基础方法

class BaseSelectPanel<P = {}, S = {}, SS = any> extends React.Component<
	P,
	S,
	SS
> {
	/**
	 * 对选择的属性进行排序
	 * @param {Array<IFAttributeProperty>} selectedAttributeList 选择的属性列表
	 * @returns {Array<IFAttributeProperty>} 排序后的列表
	 * @memberof AttributeFilterPanel
	 */
	sort(
		selectedAttributeList: Array<IFAttributeProperty>
	): Array<IFAttributeProperty> {
		// let order: Array<EAttributeType> = [EFaceAttributeType.EArr];
		return selectedAttributeList;
	}

	/**
	 * 删除元素后，其对应的enalbedAttributeType，也应该从选择列表中删除
	 * @param {IFAttributeProperty[]} newDeletedList 删除的属性列表
	 * @param {IFAttributeProperty[]} prevSelectedList 当前选择的属性列表
	 * @returns {IFAttributeProperty[]} 处理后的属性列表
	 * @memberof AttributeFilterPanel
	 */
	applyEnablePropsForDeleteProperties(
		newDeletedList: IFAttributeProperty[],
		prevSelectedList: IFAttributeProperty[]
	) {
		let prevSelectedListCopy = [...prevSelectedList];

		let removedProperties: Array<IFAttributeProperty> = [];
		for (let i = 0; i < newDeletedList.length; i++) {
			let enableTypes = newDeletedList[i].enalbedAttributeType;
			for (let type of enableTypes) {
				for (let j = prevSelectedListCopy.length - 1; j >= 0; j--) {
					if (prevSelectedListCopy[j].attributeType === type) {
						//
						removedProperties.push(prevSelectedListCopy[j]);
						prevSelectedListCopy.splice(j, 1);
					}
				}
			}
		}

		return {
			selectedList: prevSelectedListCopy,
			removedProperties: removedProperties
		};
	}

	/**
	 * 选择元素后，其对应的againstAttributeType也应该从选择列表中删除
	 * @param {IFAttributeProperty[]} newSelectedList 新选择的属性列表
	 * @param {IFAttributeProperty[]} prevSelectedList 当前选择的属性列表
	 * @returns {IFAttributeProperty[]} 处理后的属性列表
	 * @memberof AttributeFilterPanel
	 */
	applyAgainstPropsForSelecctProperties(
		newSelectedList: IFAttributeProperty[],
		prevSelectedList: IFAttributeProperty[]
	) {
		let prevSelectedListCopy = [...prevSelectedList];

		let removedProperties: Array<IFAttributeProperty> = [];
		for (let i = 0; i < newSelectedList.length; i++) {
			let againstTypes = newSelectedList[i].againstAttributeType;
			for (let type of againstTypes) {
				for (let j = prevSelectedListCopy.length - 1; j >= 0; j--) {
					if (prevSelectedListCopy[j].attributeType === type) {
						//
						removedProperties.push(prevSelectedListCopy[j]);
						prevSelectedListCopy.splice(j, 1);
					}
				}
			}
		}

		return {
			selectedList: prevSelectedListCopy,
			removedProperties: removedProperties
		};
	}

	/**
	 * 从selectedList移除attributeGroupInfo对应的type对应的属性
	 * @param {IFAttributeProperty[]} selectedList 选择的属性列表
	 * @param {EAttributeType} attributeType 类型
	 * @returns {IFAttributeProperty[]} 处理后的属性列表
	 * @memberof AttributeFilterPanel
	 */
	removeSelectedAttributeOfType(
		selectedList: IFAttributeProperty[],
		attributeType: EAttributeType
	) {
		let selectedListCopy = [...selectedList];

		let removedProperties: IFAttributeProperty[] = [];
		for (let i = selectedListCopy.length - 1; i >= 0; i--) {
			if (selectedListCopy[i].attributeType === attributeType) {
				removedProperties.push(selectedListCopy[i]);
				selectedListCopy.splice(i, 1);
			}
		}

		return {
			selectedList: selectedListCopy,
			removedProperties: removedProperties
		};
	}

	/**
	 * 生成禁用的属性列表
	 * @param {Array<IFAttributeProperty>} selectedListAttributeList 当前选择的属性列表
	 * @param {Array<IFAttributeProperty>} allAttributes 所有的属性列表
	 * @returns {Array<IFAttributeProperty>} 禁用的属性列表
	 * @memberof AttributeFilterPanel
	 */
	generateDisableAttributeList(
		selectedListAttributeList: Array<IFAttributeProperty>,
		allAttributes: Array<IFAttributeProperty>
	): Array<IFAttributeProperty> {
		// 添加禁用
		let disableTypes: Set<EAttributeType> = selectedListAttributeList.reduce(
			(
				prevDisabledList: Set<EAttributeType>,
				currentItem: IFAttributeProperty
			) => {
				let types = currentItem.againstAttributeType;
				for (let type of types) {
					prevDisabledList.add(type);
				}

				return prevDisabledList;
			},
			new Set()
		);

		let results: Array<IFAttributeProperty> = [];
		// 添加禁用的attribute
		for (let disableType of disableTypes) {
			// 找到对应的attributes
			for (let existAttribute of allAttributes) {
				if (existAttribute.attributeType === disableType) {
					// 添加
					// NOTE: 防重复？
					results.push(existAttribute);
				}
			}
		}

		// 在没有选中上衣样式和裤子样式的时候，将对应的颜色属性禁用
		let hasClothesTextureAttribute = selectedListAttributeList.some(
			(item: IFAttributeProperty) => {
				if (item.attributeType === EBodyAttributeType.ClothesTexture) {
					return true;
				} else {
					return false;
				}
			}
		);

		if (!hasClothesTextureAttribute) {
			// 禁用颜色属性
			results.push(...BodyClothesColorAttributeList);
		}

		// 下衣同样处理
		let hasTrousesTextureAttribute = selectedListAttributeList.some(
			(item: IFAttributeProperty) => {
				if (item.attributeType === EBodyAttributeType.TrousersTexture) {
					return true;
				} else {
					return false;
				}
			}
		);

		if (!hasTrousesTextureAttribute) {
			// 禁用颜色属性
			results.push(...BodyTrousersColorAttributeList);
		}

		return results;
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

export default BaseSelectPanel;
