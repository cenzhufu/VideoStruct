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

import TableView, { TableViewSectionDataSource } from 'ifvendors/table-view';

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

class VehicleTypeAttributesSelectPanel extends BaseSelectPanel<
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
	_tableViewRef: React.RefObject<TableView>;

	constructor(props: PropsType) {
		super(props);

		this.state = {
			selectedAttributeListCopy: [...props.selectedAttributeList],
			originalSelectedAttributesListCopy: [...props.selectedAttributeList]
		};

		this._tableViewRef = React.createRef<TableView>();
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

	renderItem = (item: IFAttributeProperty) => {
		return (
			<List.Item>
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

	_groupItems() {
		let list: Array<IFAttributeProperty> = this.props.attributes[0].items;

		let results: { [key: string]: Array<IFAttributeProperty> } = {};
		for (let item of list) {
			// 首字母
			let letter = item.order[0] || '#';
			let existList = results[letter];
			if (!existList) {
				results[letter] = [item];
			} else {
				existList.push(item);
				results[letter] = existList;
			}
		}

		// items排序
		let keys: Array<string> = Object.keys(results);
		let withNoKeyResults: Array<Array<IFAttributeProperty>> = [];
		for (let key of keys) {
			results[key].sort(
				(first: IFAttributeProperty, second: IFAttributeProperty) => {
					return first.order > second.order ? 1 : -1;
				}
			);

			withNoKeyResults.push(results[key]);
		}

		// 对数组排序
		withNoKeyResults.sort(
			(first: IFAttributeProperty[], second: IFAttributeProperty[]) => {
				return first[0].order[0] > second[0].order[0] ? 1 : -1;
			}
		);

		return withNoKeyResults;
	}
	onReset = () => {
		this.setState({
			selectedAttributeListCopy: this.state.originalSelectedAttributesListCopy.filter(
				(item: IFAttributeProperty) => {
					return item.attributeType !== EVehicleAttributeType.CarType;
				}
			)
		});
	};
	_renderSectionHeader = (
		section: TableViewSectionDataSource,
		index: number
	) => {
		let property: IFAttributeProperty = section.items[0] as IFAttributeProperty;
		if (property) {
			let letter = property.order[0];
			return <div className={ModuelStyle['header']}>{letter}</div>;
		}
		return null;
	};

	_renderItem = (item: IFAttributeProperty, index: number) => {
		return (
			<div className={ModuelStyle['item']} key={item.uuid}>
				<Checkbox
					value={item}
					checked={this.isChecked(item)}
					onChange={this.onChange}
				>
					{intl.get(item.tipLabelKey).d(item.defaultTip)}
				</Checkbox>
			</div>
		);
	};

	render() {
		// 分组
		let results = this._groupItems();

		// 构建table view的属性
		let tableViewProps: Array<TableViewSectionDataSource> = [];
		for (let sectionItem of results) {
			tableViewProps.push({
				header: this._renderSectionHeader,
				footer: undefined,
				items: sectionItem,
				renderItem: this._renderItem
			});
		}

		return (
			<div className={ModuelStyle['structural-attribute-panel']}>
				<TableView
					ref={this._tableViewRef}
					datasource={tableViewProps}
					className={ModuelStyle['list-container']}
				/>
				<div className={ModuelStyle['button-container']}>
					<div>
						<Button
							onClick={this.onClickCancel}
							className={ModuelStyle['button-cancel']}
						>
							{intl.get('VEHICLE_TYPE_ATTRIBUTE_SELECTOR_CANCEL').d('取消')}
						</Button>
						<Button
							className={ModuelStyle['button-reset']}
							onClick={this.onReset}
						>
							{intl.get('VEHICLE_TYPE_ATTRIBUTE_SELECTOR_RESET').d('重置')}
						</Button>
					</div>
					<Button onClick={this.onClickOk} className={ModuelStyle['button-ok']}>
						{intl.get('VEHICLE_TYPE_ATTRIBUTE_SELECTOR_OK').d('确定')}
					</Button>
				</div>
			</div>
		);
	}
}

export default VehicleTypeAttributesSelectPanel;
