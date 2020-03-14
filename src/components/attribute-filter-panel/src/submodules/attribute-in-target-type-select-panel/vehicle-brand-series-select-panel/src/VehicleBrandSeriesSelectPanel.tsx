import * as React from 'react';
import {
	IFAttributeGroupProperty,
	IFAttributeProperty,
	EVehicleAttributeType
} from 'stsrc/type-define';
import BaseSelectPanel from '../../base-select-panel/src/BaseSelectPanel';
import { Button } from 'antd';
import * as intl from 'react-intl-universal';
import ModuelStyle from './index.module.scss';

import TableView, { TableViewSectionDataSource } from 'ifvendors/table-view';
import QuickIndex from './QuickIndex';
import VehicleSeriesSelectPanel from './VehicleSeriesSelectPanel';

interface PropsType {
	// 多个属性组的集合对象
	vehilceAttributeGroup: IFAttributeGroupProperty;
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

	currentSelectBrandAttribute: IFAttributeProperty;
}

function noop() {}

class VehicleBrandSeriesAttributesSelectPanel extends BaseSelectPanel<
	PropsType,
	StateType
> {
	static defaultProps = {
		selectedAttributeList: [],
		disabledAttributeList: [],
		onClickOk: noop,
		onClickCancel: noop
	};
	_tableViewRef: React.RefObject<TableView>;

	constructor(props: PropsType) {
		super(props);

		// 先排个序
		let results: Array<Array<IFAttributeProperty>> = this._groupItems();
		this.state = {
			selectedAttributeListCopy: [...props.selectedAttributeList],
			originalSelectedAttributesListCopy: [...props.selectedAttributeList],
			currentSelectBrandAttribute: results[0][0]
		};

		this._tableViewRef = React.createRef<TableView>();
	}

	onSelectedBrand = (brandProperty: IFAttributeProperty) => {
		// TODO: 移除并禁用选择的车系属性
		this.onChangeSerialProperty([brandProperty], []);
	};

	onUnselectedBrand = (brandProperty: IFAttributeProperty) => {
		// TODO: 移除并禁用选择的车系属性
		this.onChangeSerialProperty([], [brandProperty]);
	};

	onChangeSerialProperty = (
		newSelectedList: IFAttributeProperty[],
		newDeletedList: IFAttributeProperty[]
	) => {
		// 修改选择的属性列表
		this.setState(
			(prevState: StateType) => {
				// 移除其他相同的attribute type (保证单选逻辑)
				let {
					selectedList: prevSelectedList
				} = this.removeSelectedAttributeOfType(
					prevState.selectedAttributeListCopy,
					EVehicleAttributeType.CarBrandSerials // 移除车系属性
				);

				// 也移除品牌属性
				let {
					selectedList: pprevSelectedList
				} = this.removeSelectedAttributeOfType(
					prevSelectedList,
					EVehicleAttributeType.CarBrand
				);

				// 因为选择的时候会取消against所选择的
				let {
					selectedList: prevSelectedListForAgainst
				} = this.applyAgainstPropsForSelecctProperties(
					newSelectedList,
					pprevSelectedList
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

	onQuickIndexClick = (index: number) => {
		if (this._tableViewRef.current) {
			this._tableViewRef.current.scrollToSection(index);
		}
	};

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

	_groupItems(): Array<Array<IFAttributeProperty>> {
		let list: Array<IFAttributeProperty> = this.props.vehilceAttributeGroup
			.items;

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

	onReset = () => {
		this.setState({
			selectedAttributeListCopy: this.state.originalSelectedAttributesListCopy.filter(
				(item: IFAttributeProperty) => {
					return (
						item.attributeType !== EVehicleAttributeType.CarBrandSerials &&
						item.attributeType !== EVehicleAttributeType.CarBrand
					);
				}
			)
		});
	};
	onSelectBrand = (item: IFAttributeProperty) => {
		this.setState({
			currentSelectBrandAttribute: item
		});
	};

	_renderItem = (item: IFAttributeProperty, index: number) => {
		const activeStyle =
			this.state.currentSelectBrandAttribute.uuid === item.uuid
				? ModuelStyle['item_active']
				: '';
		return (
			<div
				className={`${ModuelStyle['item']} ${activeStyle}`}
				key={item.uuid}
				onClick={() => {
					this.onSelectBrand(item);
				}}
			>
				{/* NOTE: 车辆品牌不用国际化 */}
				{item.defaultTip}
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

		// 获得所有的首字母
		let letters: Array<string> = results.map(
			(item: Array<IFAttributeProperty>) => {
				return item[0].order[0];
			}
		);

		return (
			<div className={ModuelStyle['structural-attribute-panel']}>
				<QuickIndex
					className={ModuelStyle['quick-index']}
					index={letters}
					onQuickIndexClick={this.onQuickIndexClick}
				/>
				<TableView
					ref={this._tableViewRef}
					datasource={tableViewProps}
					className={ModuelStyle['list-container']}
				/>
				<VehicleSeriesSelectPanel
					attributeProperties={
						this.state.currentSelectBrandAttribute.subAttributeProperties
					}
					disabledAttributeList={this.props.disabledAttributeList}
					selectedAttributeList={this.state.selectedAttributeListCopy}
					onChange={this.onChangeSerialProperty}
					currentPresentedBrandAttribute={
						this.state.currentSelectBrandAttribute
					}
					onSelectedBrand={this.onSelectedBrand}
					onUnselectedBrand={this.onUnselectedBrand}
				/>
				<div className={ModuelStyle['button-container']}>
					<div>
						<Button
							onClick={this.onClickCancel}
							className={ModuelStyle['button-cancel']}
						>
							{intl
								.get('VEHICLE_BRAND_SERIES_ATTRIBUTE_SELECTOR_CANCEL')
								.d('取消')}
						</Button>
						<Button
							className={ModuelStyle['button-reset']}
							onClick={this.onReset}
						>
							{intl
								.get('VEHICLE_BRAND_SERIES_ATTRIBUTE_SELECTOR_RESET')
								.d('重置')}
						</Button>
					</div>
					<Button onClick={this.onClickOk} className={ModuelStyle['button-ok']}>
						{intl.get('VEHICLE_BRAND_SERIES_ATTRIBUTE_SELECTOR_OK').d('确定')}
					</Button>
				</div>
			</div>
		);
	}
}

export default VehicleBrandSeriesAttributesSelectPanel;
