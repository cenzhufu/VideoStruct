import * as React from 'react';
import * as intl from 'react-intl-universal';
import * as moment from 'moment';
import {
	DatePicker,
	Tag,
	Icon,
	Input,
	Switch,
	Slider,
	message,
	LocaleProvider
} from 'antd';
import ModuleStyle from './assets/styles/index.module.scss';
import MaskLayer from 'ifvendors/mask-layer';
import { IFNewAttributesFilterInfo } from './atrribulte-filter-type';
import {
	EConfidenceValue,
	ETextureValue,
	IFAttributeProperty,
	IFAttributeGroupProperty,
	EBodyAttributeType,
	DateFormat,
	ETargetType,
	VehicleBrandManager,
	IFStructuralInfo,
	EMerge,
	generateVehicleLicenseNumberProperty,
	EVehicleAttributeType
} from 'sttypedefine';
import { connect } from 'react-redux';
// import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import Clear from './assets/imgs/clear.png';

import {
	FaceAttributeGroups,
	BodyLagguageAttributeGroups,
	BodyClothesAttributeGroups,
	BodyTrousersAttributeGroups,
	BodyOvercoatAttributeGroups,
	BodyClothesColorAttributeList,
	BodyTrousersColorAttributeList,
	VehicleColorAttributeGroups,
	VehicleLicenseColorAttributeGroups,
	VehicleTypeAttributeGroups,
	AllAttributes
} from './attribute-config';

import FaceAttributeSelectpanel from './submodules/attribute-in-target-type-select-panel/face-attribute-select-panel';
import BodyAttributeSelectpanel from './submodules/attribute-in-target-type-select-panel/body-attribute-select-panel';
import VehicleColorAttributesSelectPanel from './submodules/attribute-in-target-type-select-panel/vehicle-color-select-panel';
import VehicleLicenseColorAttributesSelectPanel from './submodules/attribute-in-target-type-select-panel/vehicle-license-color-select-panel';
import VehicleTypeAttributesSelectPanel from './submodules/attribute-in-target-type-select-panel/vehicle-type-select-panel';
import VehicleBrandSeriesAttributesSelectPanel from './submodules/attribute-in-target-type-select-panel/vehicle-brand-series-select-panel';
import AttributeFilterPanelActionCreators from './redux/actions/attribute-filter-panel.actions';
import { SearchResultPageActionsCreator } from 'stsrc/pages/Search/views/search-result-page';
import { EStructuralItemResultsViewMode } from 'stsrc/pages/Search/views/search-result-page/src/submodules/target-type-nav-bar/src/TargetTypeNavBar';
import Config from 'stconfig';
import { Dispatch } from 'redux';
import BaseSelectPanel from './submodules/attribute-in-target-type-select-panel/base-select-panel/src/BaseSelectPanel';
import 'moment/locale/zh-cn';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import {
	RangePickerValue,
	RangePickerPresetRange
} from 'antd/lib/date-picker/interface';
import { isSearchMode } from 'stsrc/utils/search-utils';
moment.locale('zh-cn');

const { RangePicker } = DatePicker;

// 相似度
const Min_Threshold = 70;
const Max_Threshold = 100;

//------------------------携带物属性(item)-----------------------

interface PropTypes {
	// onChange: (selectedAttributes: Array<IFAttributeProperty>) => void; // 属性修改的回调函数,返回选中的属性过滤值
	// onConfirm: () => void; // 点击查询时的回调
	className: string;
	style: React.CSSProperties;

	// 二期添加
	currentTargetType: ETargetType;
	searchTargets: Array<IFStructuralInfo>; // 搜索目标列表
	onChangeProperties: (attributes: IFNewAttributesFilterInfo) => void; // 属性改变后的回调

	// 已经移入到redux中去的props
	startDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	endDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	selectedAttributeList: Array<IFAttributeProperty>; // 选择的属性列表
	attributeAccuracy: EConfidenceValue; //属性精确度
	showBodyRelatedWithFace: boolean; // 是否显示人脸关联的人体信息
	showFaceRelatedWithBody: boolean; // 是否显示人体关联的人脸信息
	showVehicleRelatedWithFace: boolean; // 是否先是人脸关联的车辆信息
	faceThreshold: number; // 人脸相似度
	bodyThreshold: number; // 人体相似度
	// 是否精确匹配
	faceResultMergeType: EMerge;
	bodyResultMergeType: EMerge;
	viewMode: EStructuralItemResultsViewMode;

	// dispatch
	changeDateRange: (
		startDate: typeof DateFormat,
		endDate: typeof DateFormat
	) => void;
	updateSelectedAttributes: (
		selectedAttributeList: Array<IFAttributeProperty>
	) => void;
	switchShowBodyWithRelatedFace: (checked: boolean) => void;
	switchShowFaceWithRelatedBody: (checked: boolean) => void;
	switchShowVehicleWithRelatedFace: (checked: boolean) => void;
	changeFaceThreshold: (threshold: number) => void;
	changeBodyThreshold: (threshold: number) => void;
	changeFaceResultMergeType: (mergeType: EMerge) => void;
	changeBodyResultMergeType: (mergeType: EMerge) => void;
}

interface Point {
	x: number;
	y: number;
}

interface StateType {
	// 开始，结束时间

	disableAttributeList: Array<IFAttributeProperty>; // 禁用的属性类型

	// 二期添加
	showFaceAttributesPopview: boolean;
	showBodyAttributesPopview: boolean;
	showVehicleTypeAttributesPopview: boolean;
	showVehicleBrandAttributesPopview: boolean;
	showVehicleColorAttributesPopview: boolean;
	showVehicleLicenseAttributesPopview: boolean;

	pos: Point;
	prevTargetType: ETargetType;

	licenseNumberDraft: string; // 车牌号码
	// startDate: string //
	// endDate: string //
}

function none() {}
class AttributeFilterPanel extends BaseSelectPanel<PropTypes, StateType> {
	static defaultProps = {
		startDate: '',
		endDate: '',
		selectedAttributeList: [],
		attributeAccuracy: EConfidenceValue.Low, //属性精度 低 中 高
		showBodyRelatedWithFace: false,
		showFaceRelatedWithBody: false,
		showVehicleRelatedWithFace: false,
		faceThreshold: Config.getFaceDefaultThreshold(),
		bodyThreshold: Config.getBodyDefaultThreshold(),
		faceResultMergeType: EMerge.Union,
		bodyResultMergeType: EMerge.Union,

		isSearch: false,
		onchange: none,
		onConfirm: none,
		className: '',
		style: {},
		currentTargetType: ETargetType.Unknown,
		searchTargets: [],
		onChangeProperties: none,

		// dispatch
		changeDateRange: none,
		updateSelectedAttributes: none,
		switchShowBodyWithRelatedFace: none,
		switchShowFaceWithRelatedBody: none,
		switchShowVehicleWithRelatedFace: none,
		changeFaceThreshold: none,
		changeBodyThreshold: none,
		changeFaceResultMergeType: none,
		changeBodyResultMergeType: none
	};
	tagContainer: React.RefObject<HTMLDivElement>;

	// calendarLocale: Object;

	constructor(props: PropTypes) {
		super(props);
		this.tagContainer = React.createRef<HTMLDivElement>();

		// this.calendarLocale = CalendarLocale[Language.getLocale()];

		let licenseNumberDraft = '';
		for (let property of this.props.selectedAttributeList) {
			if (property.attributeType === EVehicleAttributeType.CarLicenseNumber) {
				licenseNumberDraft = property.attributeValue;
				break;
			}
		}
		this.state = {
			disableAttributeList: [
				// 默认禁用
				// 上衣颜色
				...BodyClothesColorAttributeList,
				// 下衣颜色
				...BodyTrousersColorAttributeList
			],

			showFaceAttributesPopview: false,
			showBodyAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			showVehicleLicenseAttributesPopview: false,
			pos: {
				x: 0,
				y: 0
			},
			prevTargetType: props.currentTargetType,
			licenseNumberDraft: licenseNumberDraft
			// startDate: '',
			// endDate: '',
		};
	}

	static getDerivedStateFromProps(
		props: PropTypes,
		state: StateType
	): Partial<StateType> | null {
		if (props.currentTargetType !== state.prevTargetType) {
			return {
				prevTargetType: props.currentTargetType,
				showBodyAttributesPopview: false,
				showFaceAttributesPopview: false,
				showVehicleTypeAttributesPopview: false,
				showVehicleBrandAttributesPopview: false,
				showVehicleColorAttributesPopview: false,
				showVehicleLicenseAttributesPopview: false
			};
		}

		return null;
	}

	getValidSearchTargetList(): Array<IFStructuralInfo> {
		let result: Array<IFStructuralInfo> = [];
		for (let target of this.props.searchTargets) {
			if (target.targetType !== ETargetType.Unknown) {
				result.push(target);
			}
		}

		return result;
	}

	needShowPreciseSwitchController() {
		return this.props.searchTargets.length >= 2;
	}

	/**
	 * 属性选择框是否已经显示（任一一个）
	 * @returns {boolean} true表示属性选择框已经显示
	 * @memberof AttributeFilterPanel
	 */
	isAttributesPopViewShowed() {
		return (
			this.state.showFaceAttributesPopview ||
			this.state.showBodyAttributesPopview ||
			this.state.showVehicleTypeAttributesPopview ||
			this.state.showVehicleBrandAttributesPopview ||
			this.state.showVehicleColorAttributesPopview ||
			this.state.showVehicleLicenseAttributesPopview
		);
	}

	isTodayOrLater(date: string): boolean {
		// let today = moment();
		// let dt = moment(date);
		// if (
		// 	today.isSame(dt, 'year') &&
		// 	today.isSame(dt, 'month') &&
		// 	today.isSame(dt, 'day')
		// ) {
		// 	return true;
		// } else {
		// 	return false;
		// }

		return moment(date).isAfter(moment());
	}

	getValidHour(date: string) {
		if (this.isTodayOrLater(date)) {
			return moment().get('hour');
		} else {
			return moment(date).get('hour');
		}
	}

	getValidMinute(date: string) {
		if (this.isTodayOrLater(date)) {
			return moment().get('minute');
		} else {
			return moment(date).get('minute');
		}
	}

	getValidSecond(date: string) {
		if (this.isTodayOrLater(date)) {
			return moment().get('second');
		} else {
			return moment(date).get('second');
		}
	}

	//改变日期
	onChangeDate = (date: RangePickerValue, dateString: Array<string>) => {
		// TODO: endData的时分秒用当前时间的时分秒
		// console.log('value', date, dateString)
		let startDate = dateString[0]
			? moment(dateString[0])
					.set('hour', 0)
					.set('minute', 0)
					.set('second', 0)
					.format(DateFormat)
			: '';
		let endDate = dateString[1]
			? moment(dateString[1])
					.set('hour', this.getValidHour(dateString[1]))
					.set('minute', this.getValidMinute(dateString[1]))
					.set('second', this.getValidSecond(dateString[1]))
					.format(DateFormat)
			: '';
		this.props.changeDateRange(startDate, endDate);
	};

	//改变日期
	onConfirmTime = (dates: RangePickerPresetRange) => {
		let startTime = moment(dates[0]).format(DateFormat);
		let endTime = moment(dates[1]).format(DateFormat);

		let startDate = startTime ? moment(startTime).format(DateFormat) : '';
		let endDate = endTime
			? moment(endTime)
					.set('hour', this.getValidHour(endTime))
					.set('minute', this.getValidMinute(endTime))
					.set('second', this.getValidSecond(endTime))
					.format(DateFormat)
			: '';
		this.props.changeDateRange(startDate, endDate);
	};
	//人脸相似度
	onChangeFaceThreshold = (value: number) => {
		if (Number.isNaN(value)) {
			return;
		}
		let val = value;
		if (!value && value !== 0) {
			val = 0;
		}
		if (value > 100) {
			val = 100;
		}

		this.props.changeFaceThreshold(val);
	};
	//人体相似度
	onChangeBodyThreshold = (value: number) => {
		if (Number.isNaN(value)) {
			return;
		}
		let val = value;
		if (!value && value !== 0) {
			val = 0;
		}
		if (value > 100) {
			val = 100;
		}

		this.props.changeBodyThreshold(val);
	};

	/**
	 * 重置所有的过滤条件
	 * @memberof StructAttributeFilterPanel
	 * @returns {void}
	 */
	handleClickReset = () => {
		// 清空对应type的属性条件
		let remianedAttributes: Array<
			IFAttributeProperty
		> = this.props.selectedAttributeList.filter((item: IFAttributeProperty) => {
			if (item.targetType === this.props.currentTargetType) {
				return false;
			} else {
				return true;
			}
		});

		// 更新选择的属性
		// 更新redux
		this.props.updateSelectedAttributes(remianedAttributes);

		if (this.props.currentTargetType === ETargetType.Body) {
			// 清空了人体属性后，我们要将一些条件重置
			this.setState({
				disableAttributeList: [
					// 上衣颜色
					...BodyClothesColorAttributeList,
					// 下衣颜色
					...BodyTrousersColorAttributeList
				]
			});
		}
		if (this.props.currentTargetType === ETargetType.Vehicle) {
			this.setState({
				licenseNumberDraft: ''
			});
		}
	};

	/**
	 * 点击查询操作
	 * @memberof StructAttributeFilterPanel
	 * @returns {void}
	 */
	handleClickSearch = (): void => {
		// if (this.props.onConfirm) {
		// 	this.props.onConfirm();
		// }
	};

	onChangeLicenseNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		this.setState({
			licenseNumberDraft: value
		});
	};

	onSearchLicenseNumber = () => {
		if (this.state.licenseNumberDraft) {
			// 构建licenseNumber property
			let licenseProperty: IFAttributeProperty | null = generateVehicleLicenseNumberProperty(
				this.state.licenseNumberDraft
			);
			if (licenseProperty) {
				let list: Array<IFAttributeProperty> = [
					...this.props.selectedAttributeList
				];

				// 移除licenseNumber
				for (let i = 0; i < list.length; i++) {
					if (
						list[i].attributeType === EVehicleAttributeType.CarLicenseNumber
					) {
						list.splice(i, 1);
					}
				}
				list.push(licenseProperty);
				console.log('wlj attr filter', list, licenseProperty);
				// 更新
				this.props.updateSelectedAttributes(list);
			}
		}
	};

	/**
	 * 外边组件嗲用
	 * @returns {IFNewAttributesFilterInfo} 参数
	 * @memberof AttributeFilterPanel
	 */
	public getNewParams(): IFNewAttributesFilterInfo {
		return {
			// threshold: this.state.threshold,
			startDate: this.props.startDate,
			endDate: this.props.endDate,
			selectedAttributes: this.props.selectedAttributeList,

			attributeAccuracy: this.props.attributeAccuracy,

			faceThreshold: this.props.faceThreshold,
			bodyThreshold: this.props.bodyThreshold,

			bodyesultMergeType: this.props.bodyResultMergeType,
			faceResultMergeType: this.props.faceResultMergeType,

			showBodyRelatedWithFace: this.props.showBodyRelatedWithFace,
			showFaceRelatedWithBody: this.props.showFaceRelatedWithBody,
			showVehicleRelatedWithFace: this.props.showVehicleRelatedWithFace,

			currentTargetType: this.props.currentTargetType
		};
	}

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
	 * 属性panel选择的ok回调
	 * @param {IFAttributeProperty[]} newSelectedList 新选择的属性列表
	 * @param {IFAttributeProperty[]} newDeletedList 新删除的属性列表
	 * @memberof AttributeFilterPanel
	 * @returns {void} void
	 */
	onOkAttribute = (
		newSelectedList: IFAttributeProperty[],
		newDeletedList: IFAttributeProperty[]
	) => {
		//
		let prevListCopy: Array<IFAttributeProperty> = [
			...this.props.selectedAttributeList
		];

		for (let deleteItem of newDeletedList) {
			for (let i = 0; i < prevListCopy.length; i++) {
				if (deleteItem.uuid === prevListCopy[i].uuid) {
					prevListCopy.splice(i, 1);
					break;
				}
			}
		}

		prevListCopy = [...prevListCopy, ...newSelectedList];

		// 更新redux
		this.props.updateSelectedAttributes(prevListCopy);

		this.setState((prevState: StateType) => {
			// 计算新删除的和新添加的
			// 获取当前选择的attributes
			let disableAttributes = this.generateDisableAttributeList(
				prevListCopy,
				AllAttributes
			);
			return {
				showFaceAttributesPopview: false,
				showBodyAttributesPopview: false,
				showVehicleTypeAttributesPopview: false,
				showVehicleBrandAttributesPopview: false,
				showVehicleColorAttributesPopview: false,
				showVehicleLicenseAttributesPopview: false,
				disableAttributeList: disableAttributes
			};
		});
	};

	onCancelAttribute = () => {
		this.setState({
			showFaceAttributesPopview: false,
			showBodyAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			showVehicleLicenseAttributesPopview: false
		});
	};

	/**
	 * 点击tag 删除某个属性条件
	 * @param {IFAttributeProperty} attributeInfo groupInfo
	 * @param {IFStructuralAttributeGroupItem} selectedItemInfo itemInfo
	 * @returns {void}
	 */
	onDelete = (attributeInfo: IFAttributeProperty) => {
		// 需要删除的属性
		let deletedAttributes: Array<IFAttributeProperty> = [attributeInfo];
		if (
			attributeInfo.attributeType === EBodyAttributeType.ClothesTexture &&
			attributeInfo.attributeValue === ETextureValue.PureColor
		) {
			// 删除衣服颜色(先不做过滤)
			deletedAttributes.push(...BodyClothesColorAttributeList);
		}
		if (
			attributeInfo.attributeType === EBodyAttributeType.TrousersTexture &&
			attributeInfo.attributeValue === ETextureValue.PureColor
		) {
			deletedAttributes.push(...BodyTrousersColorAttributeList);
		}

		let prevSelectedList: Array<IFAttributeProperty> = [
			...this.props.selectedAttributeList
		];

		for (let deleteAttribute of deletedAttributes) {
			for (let i = 0; i < prevSelectedList.length; i++) {
				if (prevSelectedList[i].uuid === deleteAttribute.uuid) {
					prevSelectedList.splice(i, 1);
					break;
				}
			}
		}

		// 对车牌做一个特殊处理
		if (
			attributeInfo.attributeType === EVehicleAttributeType.CarLicenseNumber
		) {
			// 重置搜素车牌的
			this.setState({
				licenseNumberDraft: ''
			});
		}

		// 更新redux
		this.props.updateSelectedAttributes(prevSelectedList);

		this.setState((prevState: StateType) => {
			// 计算新删除的和新添加的
			// 获取当前选择的attributes
			let disableAttributes = this.generateDisableAttributeList(
				prevSelectedList,
				AllAttributes
			);
			return {
				disableAttributeList: disableAttributes
			};
		});
	};

	/**
	 * 在所有的 选项中 比较选出已选的选项
	 * @param {IFStructuralAttributeGroupItem[]} list list
	 * @param {*} value value
	 * @returns {IFStructuralAttributeGroupItem | undefined} itemInfo
	 */
	_getShowText = (
		list: IFAttributeProperty[],
		value: any
	): IFAttributeProperty => {
		const itemInfo = list.filter((item, index) => {
			return value === item.uuid;
		});
		return itemInfo[0];
	};

	//获得已选择好的过滤条件
	_getTagList = (groups: Array<IFAttributeGroupProperty>) => {
		return this.props.selectedAttributeList.map(
			(attributeInfo: IFAttributeProperty, index) => {
				// 找到groupInfo
				if (attributeInfo.targetType === this.props.currentTargetType) {
					return (
						<Tag
							key={attributeInfo.uuid}
							closable
							onClose={this.onDelete.bind(this, attributeInfo)}
						>
							<span>
								{intl
									.get(attributeInfo.keyTipLabelKey)
									.d(attributeInfo.keyDefaultTip) +
									' :  ' +
									intl
										.get(attributeInfo.tipLabelKey)
										.d(attributeInfo.defaultTip)}
							</span>
						</Tag>
					);
				} else {
					return null;
				}
			}
		);
	};

	getElementPosition(e: HTMLElement | null) {
		let x = 0;
		let y = 0;
		let ecopy = e;
		while (ecopy != null) {
			x += ecopy.offsetLeft;
			y += ecopy.offsetTop;
			// @ts-ignore
			ecopy = ecopy.offsetParent;
		}
		return {
			x: x,
			y: y
		};
	}

	getAppropriatePos(element: HTMLElement) {
		let pos = this.getElementPosition(element);
		return {
			x: pos.x + element.clientWidth / 2,
			y: pos.y + element.clientHeight + 10
		};
	}

	onShowFaceAttributeSelector = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		this.setState({
			// showFaceAttributesPopview: true,
			showFaceAttributesPopview: !this.state.showFaceAttributesPopview,
			showBodyAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			showVehicleLicenseAttributesPopview: false,
			pos: this.getAppropriatePos(event.currentTarget)
		});
	};

	onShowBodyAttributeSelector = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		this.setState({
			// showBodyAttributesPopview: true,
			showBodyAttributesPopview: !this.state.showBodyAttributesPopview,
			showFaceAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			showVehicleLicenseAttributesPopview: false,
			pos: this.getAppropriatePos(event.currentTarget)
		});
	};

	onShowVehicleTypeSelector = (event: React.MouseEvent<HTMLDivElement>) => {
		this.setState({
			showBodyAttributesPopview: false,
			showFaceAttributesPopview: false,
			// showVehicleTypeAttributesPopview: true,
			showVehicleTypeAttributesPopview: !this.state
				.showVehicleTypeAttributesPopview,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			showVehicleLicenseAttributesPopview: false,
			pos: this.getAppropriatePos(event.currentTarget)
		});
	};

	onShowVehicleBrandSelector = (event: React.MouseEvent<HTMLDivElement>) => {
		// 先判断配置是否渠道
		if (VehicleBrandManager.isCarConfigInited()) {
			this.setState({
				showBodyAttributesPopview: false,
				showFaceAttributesPopview: false,
				showVehicleTypeAttributesPopview: false,
				// showVehicleBrandAttributesPopview: true,
				showVehicleBrandAttributesPopview: !this.state
					.showVehicleBrandAttributesPopview,
				showVehicleColorAttributesPopview: false,
				showVehicleLicenseAttributesPopview: false,
				pos: this.getAppropriatePos(event.currentTarget)
			});
		} else {
			message.warn(intl.get('ATTRIBUTE_FILETER_SOME_THING_WRONG').d('出错了'));
		}
	};

	onShowVehicleColorSelector = (event: React.MouseEvent<HTMLDivElement>) => {
		this.setState({
			showBodyAttributesPopview: false,
			showFaceAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			// showVehicleColorAttributesPopview: true,
			showVehicleColorAttributesPopview: !this.state
				.showVehicleColorAttributesPopview,
			showVehicleLicenseAttributesPopview: false,
			pos: this.getAppropriatePos(event.currentTarget)
		});
	};

	onShowVehicleLicenseColorSelector = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		this.setState({
			showBodyAttributesPopview: false,
			showFaceAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			// showVehicleLicenseAttributesPopview: true,
			showVehicleLicenseAttributesPopview: !this.state
				.showVehicleLicenseAttributesPopview,
			pos: this.getAppropriatePos(event.currentTarget)
		});
	};

	onSwitchBodyRelative = (checked: boolean, event: MouseEvent) => {
		this.props.switchShowFaceWithRelatedBody(checked);
	};

	onSwitchFaceRelative = (checked: boolean, event: MouseEvent) => {
		// 人脸---人体关联
		// 更新redux
		this.props.switchShowBodyWithRelatedFace(checked);
	};

	onSwitchVehicleRelative = (checked: boolean, event: MouseEvent) => {
		this.props.switchShowVehicleWithRelatedFace(checked);
	};

	onSwitchFaceResultMergeType = (checked: boolean) => {
		this.props.changeFaceResultMergeType(
			checked ? EMerge.Intersection : EMerge.Union
		);
	};

	onSwitchBodyResultMergeType = (checked: boolean) => {
		this.props.changeBodyResultMergeType(
			checked ? EMerge.Intersection : EMerge.Union
		);
	};

	onLimitDate = (current: moment.Moment | undefined) => {
		if (!current) {
			return false;
		} else if (current.isAfter(moment())) {
			return true;
		} else {
			return false;
		}
	};

	getEndDateDisableHours = (time: moment.Moment | undefined): number[] => {
		if (!time) {
			return [];
		}

		let now = moment();
		if (time.isBefore(now, 'day')) {
			// 过去时间(不禁用)
			return [];
		} else if (time.isSame(now, 'day')) {
			return this.range(now.get('hour') + 1, 24);
		} else {
			return this.range(0, 24);
		}
	};

	getEndDateDisableMinutes = (time: moment.Moment | undefined): number[] => {
		if (!time) {
			return [];
		}

		let now = moment();
		if (time.isBefore(now, 'hour')) {
			// 过去时间(不禁用)
			return [];
		} else if (time.isSame(now, 'hour')) {
			return this.range(now.get('minute') + 1, 60);
		} else {
			return this.range(0, 60);
		}
	};

	getEndDateDisableSeconds = (time: moment.Moment | undefined): number[] => {
		if (!time) {
			return [];
		}

		let now = moment();
		if (time.isBefore(now, 'minute')) {
			// 过去时间(不禁用)
			return [];
		} else if (time.isSame(now, 'minute')) {
			return this.range(now.get('second') + 1, 60);
		} else {
			return this.range(0, 60);
		}
	};

	range(start: number, end: number) {
		const result = [];
		for (let i = start; i < end; i++) {
			result.push(i);
		}
		return result;
	}

	onLimitTime = (
		current: [moment.Moment, moment.Moment] | undefined,
		type: 'start' | 'end'
	) => {
		if (type === 'start') {
			return {};
		}

		if (!current || current.length < 2) {
			return {};
		} else {
			return {
				disabledHours: () => this.getEndDateDisableHours(current[1]),
				disabledMinutes: () => this.getEndDateDisableMinutes(current[1]),
				disabledSeconds: () => this.getEndDateDisableSeconds(current[1])
			};
		}
	};

	onClickMask = () => {
		this.setState({
			showFaceAttributesPopview: false,
			showBodyAttributesPopview: false,
			showVehicleTypeAttributesPopview: false,
			showVehicleBrandAttributesPopview: false,
			showVehicleColorAttributesPopview: false,
			showVehicleLicenseAttributesPopview: false
		});
	};

	onOpenDateRangePicker = (status: boolean) => {
		if (status) {
			this.setState({
				showFaceAttributesPopview: false,
				showBodyAttributesPopview: false,
				showVehicleTypeAttributesPopview: false,
				showVehicleBrandAttributesPopview: false,
				showVehicleColorAttributesPopview: false,
				showVehicleLicenseAttributesPopview: false
			});
		}
	};

	_getMainSearchTargetType() {
		for (let item of this.props.searchTargets) {
			if (
				item.targetType === ETargetType.Face ||
				item.targetType === ETargetType.Body ||
				item.targetType === ETargetType.Vehicle
			) {
				return item.targetType;
			}
		}

		return ETargetType.Unknown;
	}

	_needShowFaceThreshold() {
		return (
			isSearchMode(this.props.currentTargetType, this.props.searchTargets) &&
			this.props.currentTargetType === ETargetType.Face &&
			this._getMainSearchTargetType() === ETargetType.Face
		);
	}

	_needShowBodyThreshold() {
		return (
			isSearchMode(this.props.currentTargetType, this.props.searchTargets) &&
			this.props.currentTargetType === ETargetType.Body &&
			this._getMainSearchTargetType() === ETargetType.Body
		);
	}

	_needShowFaceAccurateSwitch() {
		return (
			this.props.searchTargets.length >= 2 &&
			this.props.currentTargetType === ETargetType.Face &&
			this._getMainSearchTargetType() === ETargetType.Face
		);
	}

	_needShowBodyAccurateSwitch() {
		return (
			this.props.searchTargets.length >= 2 &&
			this.props.currentTargetType === ETargetType.Body &&
			this._getMainSearchTargetType() === ETargetType.Body
		);
	}

	//人脸属性条件
	_renderFaceAttributeUI() {
		const { showFaceAttributesPopview } = this.state;
		return (
			<div
				className={`${ModuleStyle['attribute-select-content']} ${
					ModuleStyle['attribute-select-content-spaciel']
				}`}
			>
				<div className={ModuleStyle['attribute-select-content-filter']}>
					{this.isAttributesPopViewShowed() && (
						<MaskLayer
							onClickMask={this.onClickMask}
							className={ModuleStyle['popover-selector-mask-layer']}
						/>
					)}
					<div className={ModuleStyle['center-flex-container']}>
						{/* 检索模式先是相似度 */}
						{this._needShowFaceThreshold() && (
							<div className={ModuleStyle['center-threshold-wraper']}>
								<div className={ModuleStyle['threshold-title']}>
									{intl.get('ATTRIBUTE_FILTER_PANEL_THRESHOLD').d('相似度')}
								</div>
								<div className={ModuleStyle['threshold-slider']}>
									<Slider
										min={Min_Threshold}
										max={Max_Threshold}
										defaultValue={this.props.faceThreshold}
										onChange={this.onChangeFaceThreshold}
									/>
								</div>
								<div className={ModuleStyle['threshold-slider-input']}>
									<span>{this.props.faceThreshold}</span>
									<span>%</span>
								</div>
							</div>
						)}
					</div>
					<LocaleProvider locale={zh_CN}>
						<RangePicker
							format={DateFormat}
							disabledDate={this.onLimitDate}
							disabledTime={this.onLimitTime}
							className={ModuleStyle['below-mask']}
							defaultValue={
								this.props.startDate && this.props.endDate
									? [
											moment(this.props.startDate, DateFormat),
											moment(this.props.endDate, DateFormat)
									  ]
									: [undefined, undefined]
							}
							ranges={{
								最近七天: [
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract(6, 'days'),
									moment()
								],
								最近三十天: [
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract(29, 'days'),
									moment()
								]
							}}
							showTime
							onOk={this.onConfirmTime}
							onOpenChange={this.onOpenDateRangePicker}
						/>
					</LocaleProvider>
					<div
						className={
							showFaceAttributesPopview
								? `${ModuleStyle['upon-mask']} ${
										ModuleStyle['opon-mask-active']
								  }`
								: `${ModuleStyle['upon-mask']}`
						}
						onClick={this.onShowFaceAttributeSelector.bind(this)}
					>
						{intl.get('ATTRIBUTE_FILETER_CONDITION').d('筛选条件')}
						{showFaceAttributesPopview ? (
							<Icon style={{ marginLeft: '8px' }} type="caret-up" />
						) : (
							<Icon style={{ marginLeft: '8px' }} type="caret-down" />
						)}
					</div>
				</div>
				<div className={ModuleStyle['search-action-wraper']}>
					{this._needShowFaceAccurateSwitch() && (
						<div
							className={ModuleStyle['center-flex-container']}
							style={{
								marginRight: '16px',
								position: 'absolute',
								left: '-112px'
							}}
						>
							<div style={{ marginRight: '8px' }}>
								{intl
									.get('ATTRIBUTE_FILTER_PANEL_ACCURATE_RESULT')
									.d('精确匹配')}
							</div>
							<Switch
								checked={this.props.faceResultMergeType === EMerge.Intersection}
								onChange={this.onSwitchFaceResultMergeType}
							/>
						</div>
					)}
					{this.props.viewMode !== EStructuralItemResultsViewMode.MapMode &&
					isSearchMode(
						this.props.currentTargetType,
						this.props.searchTargets
					) ? (
						<div className={ModuleStyle['center-flex-container']}>
							<div style={{ marginRight: '8px' }}>
								{intl
									.get('ATTRIBUTE_FILTER_PANEL_SHOW_RELATIVE_INFO')
									.d('显示关联的图片')}
							</div>
							<Switch
								checked={this.props.showBodyRelatedWithFace}
								onChange={this.onSwitchFaceRelative}
							/>
						</div>
					) : null}
				</div>
			</div>
		);
	}

	_renderBodyAttributeUI() {
		const { showBodyAttributesPopview } = this.state;

		return (
			<div
				className={`${ModuleStyle['attribute-select-content']} ${
					ModuleStyle['attribute-select-content-spaciel']
				}`}
			>
				<div className={ModuleStyle['attribute-select-content-filter']}>
					{this.isAttributesPopViewShowed() && (
						<MaskLayer
							onClickMask={this.onClickMask}
							className={ModuleStyle['popover-selector-mask-layer']}
						/>
					)}
					{this._needShowBodyThreshold() && (
						<div className={ModuleStyle['center-threshold-wraper']}>
							<div className={ModuleStyle['threshold-title']}>
								{intl.get('ATTRIBUTE_FILTER_PANEL_THRESHOLD').d('相似度')}
							</div>
							<div className={ModuleStyle['threshold-slider']}>
								<Slider
									min={Min_Threshold}
									max={Max_Threshold}
									defaultValue={this.props.bodyThreshold}
									onChange={this.onChangeBodyThreshold}
								/>
							</div>
							<div className={ModuleStyle['threshold-slider-input']}>
								<span>{this.props.bodyThreshold}</span>
								<span>%</span>
								{/* <InputNumber
								min={0}
								max={100}
								style={{ marginRight: 40 }}
								value={bodyThreshold}
								onChange={this.onChangeBodyThreshold}
							/> */}
							</div>
						</div>
					)}
					<LocaleProvider locale={zh_CN}>
						<RangePicker
							showTime
							format={DateFormat}
							disabledTime={this.onLimitTime}
							disabledDate={this.onLimitDate}
							className={ModuleStyle['below-mask']}
							defaultValue={
								this.props.startDate && this.props.endDate
									? [
											moment(this.props.startDate, DateFormat),
											moment(this.props.endDate, DateFormat)
									  ]
									: [undefined, undefined]
							}
							ranges={{
								最近七天: [
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract(6, 'days'),
									moment()
								],
								最近三十天: [
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract(29, 'days'),
									moment()
								]
							}}
							// onChange={this.onChangeDate}
							onOk={this.onConfirmTime}
							onOpenChange={this.onOpenDateRangePicker}
						/>
					</LocaleProvider>
					<div
						className={
							showBodyAttributesPopview
								? `${ModuleStyle['upon-mask']} ${
										ModuleStyle['opon-mask-active']
								  }`
								: `${ModuleStyle['upon-mask']}`
						}
						onClick={this.onShowBodyAttributeSelector.bind(this)}
					>
						{intl.get('ATTRIBUTE_FILETER_CONDITION').d('筛选条件')}
						{showBodyAttributesPopview ? (
							<Icon style={{ marginLeft: '8px' }} type="caret-up" />
						) : (
							<Icon style={{ marginLeft: '8px' }} type="caret-down" />
						)}
					</div>
				</div>
				<div className={ModuleStyle['search-action-wraper']}>
					{this._needShowBodyAccurateSwitch() && (
						<div
							className={ModuleStyle['center-flex-container']}
							style={{
								marginRight: '16px',
								position: 'absolute',
								left: '-112px'
							}}
						>
							<div style={{ marginRight: '8px' }}>
								{intl
									.get('ATTRIBUTE_FILTER_PANEL_ACCURATE_RESULT')
									.d('精确匹配')}
							</div>
							<Switch
								checked={this.props.bodyResultMergeType === EMerge.Intersection}
								onChange={this.onSwitchBodyResultMergeType}
							/>
						</div>
					)}
					{this.props.viewMode !== EStructuralItemResultsViewMode.MapMode &&
					isSearchMode(
						this.props.currentTargetType,
						this.props.searchTargets
					) ? (
						<div className={ModuleStyle['center-flex-container']}>
							<div style={{ marginRight: '8px' }}>
								{intl
									.get('ATTRIBUTE_FILTER_PANEL_SHOW_RELATIVE_INFO')
									.d('显示关联的图片')}
							</div>
							<Switch
								checked={this.props.showFaceRelatedWithBody}
								onChange={this.onSwitchBodyRelative}
							/>
						</div>
					) : null}
				</div>
			</div>
		);
	}

	_renderVehicleAttributeUI() {
		const {
			showVehicleTypeAttributesPopview,
			showVehicleBrandAttributesPopview,
			showVehicleColorAttributesPopview,
			showVehicleLicenseAttributesPopview
		} = this.state;
		const { viewMode } = this.props;
		return (
			<div
				className={`${ModuleStyle['attribute-select-content']} ${
					ModuleStyle['attribute-select-content-spaciel']
				}`}
			>
				<div className={ModuleStyle['attribute-select-content-filter']}>
					{this.isAttributesPopViewShowed() && (
						<MaskLayer
							onClickMask={this.onClickMask}
							className={ModuleStyle['popover-selector-mask-layer']}
						/>
					)}
					<LocaleProvider locale={zh_CN}>
						<RangePicker
							className={ModuleStyle['below-mask']}
							showTime
							format={DateFormat}
							disabledDate={this.onLimitDate}
							disabledTime={this.onLimitTime}
							defaultValue={
								this.props.startDate && this.props.endDate
									? [
											moment(this.props.startDate, DateFormat),
											moment(this.props.endDate, DateFormat)
									  ]
									: [undefined, undefined]
							}
							ranges={{
								最近七天: [
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract(6, 'days'),
									moment()
								],
								最近三十天: [
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract(29, 'days'),
									moment()
								]
							}}
							// onChange={this.onChangeDate}
							onOk={this.onConfirmTime}
							style={{ width: '240px' }}
							onOpenChange={this.onOpenDateRangePicker}
						/>
					</LocaleProvider>
					<div
						className={
							showVehicleTypeAttributesPopview
								? `${ModuleStyle['upon-mask']} ${
										ModuleStyle['opon-mask-active']
								  }`
								: `${ModuleStyle['upon-mask']}`
						}
						onClick={this.onShowVehicleTypeSelector}
					>
						{intl.get('ATTRIBUTE_FILETER_CAR_TYPE').d('车辆类型')}
						{showVehicleTypeAttributesPopview ? (
							<Icon style={{ marginLeft: '8px' }} type="caret-up" />
						) : (
							<Icon style={{ marginLeft: '8px' }} type="caret-down" />
						)}
					</div>
					<div
						className={
							showVehicleBrandAttributesPopview
								? `${ModuleStyle['upon-mask']} ${
										ModuleStyle['opon-mask-active']
								  }`
								: `${ModuleStyle['upon-mask']}`
						}
						onClick={this.onShowVehicleBrandSelector.bind(this)}
					>
						{intl.get('ATTRIBUTE_FILETER_CAR_BAND_CONDITION').d('车辆品牌')}
						{showVehicleBrandAttributesPopview ? (
							<Icon style={{ marginLeft: '8px' }} type="caret-up" />
						) : (
							<Icon style={{ marginLeft: '8px' }} type="caret-down" />
						)}
					</div>
					<div
						className={
							showVehicleColorAttributesPopview
								? `${ModuleStyle['upon-mask']} ${
										ModuleStyle['opon-mask-active']
								  }`
								: `${ModuleStyle['upon-mask']}`
						}
						onClick={this.onShowVehicleColorSelector.bind(this)}
					>
						{intl.get('ATTRIBUTE_FILETER_CAR_COLOR_CONDITION').d('车辆颜色')}
						{showVehicleColorAttributesPopview ? (
							<Icon style={{ marginLeft: '8px' }} type="caret-up" />
						) : (
							<Icon style={{ marginLeft: '8px' }} type="caret-down" />
						)}
					</div>
					<div
						className={
							showVehicleLicenseAttributesPopview
								? `${ModuleStyle['upon-mask']} ${
										ModuleStyle['opon-mask-active']
								  }`
								: `${ModuleStyle['upon-mask']}`
						}
						onClick={this.onShowVehicleLicenseColorSelector.bind(this)}
					>
						{intl
							.get('ATTRIBUTE_FILETER_CAR_LICENSE_COLOR_CONDITION')
							.d('车牌颜色')}
						{showVehicleLicenseAttributesPopview ? (
							<Icon style={{ marginLeft: '8px' }} type="caret-up" />
						) : (
							<Icon style={{ marginLeft: '8px' }} type="caret-down" />
						)}
					</div>
					<div className={ModuleStyle['search-car-license-input']}>
						<Input
							prefix={
								<Icon
									className={ModuleStyle['input-license-number']}
									type="search"
									onClick={this.onSearchLicenseNumber}
								/>
							}
							value={this.state.licenseNumberDraft}
							onChange={this.onChangeLicenseNumber}
							onPressEnter={this.onSearchLicenseNumber}
							placeholder={intl
								.get('ATTRIBUTE_FILETER_CAR_INPUT_CAR_LICENSE_PLACEHODE')
								.d('输入车牌号回车搜索')}
						/>
						{/* <Button
						className={ModuleStyle['carSearchBtn']}
						onClick={this.onSearchLicenseNumber}
					>
						{intl.get('ATTRIBUTE_FILETER_SEARCH_CAR_LICENSE').d('查询')}
					</Button> */}
					</div>
				</div>
				<div className={ModuleStyle['search-action-wraper']}>
					{/* <div
							className={ModuleStyle['center-flex-container']}
							style={{ marginRight: '16px' }}
						>
							<div style={{ marginRight: '8px' }}>
								{intl
									.get('ATTRIBUTE_FILTER_PANEL_ACCURATE_RESULT')
									.d('精确匹配')}
							</div>
							<Switch />
						</div> */}
					{viewMode !== EStructuralItemResultsViewMode.MapMode ? (
						<div className={ModuleStyle['center-flex-container']}>
							<div style={{ marginRight: '8px' }}>
								{intl
									.get('ATTRIBUTE_FILTER_PANEL_SHOW_RELATIVE_INFO')
									.d('显示关联图片')}
							</div>
							<Switch
								checked={this.props.showVehicleRelatedWithFace}
								onChange={this.onSwitchVehicleRelative}
							/>
						</div>
					) : null}
				</div>
			</div>
		);
	}

	render() {
		// //tag列表\
		const faceAttributes = FaceAttributeGroups; // this._buildFaceAttributesGroup();
		const bodyAttributes = [
			...BodyClothesAttributeGroups,
			...BodyTrousersAttributeGroups,
			...BodyOvercoatAttributeGroups
		]; // this._buildBodyAttributesGroup();
		const baggageAttributes = BodyLagguageAttributeGroups; //this._buildBaggageAttributesGroup();

		const tagComponent = this._getTagList([
			...faceAttributes,
			...bodyAttributes,
			...baggageAttributes
		]);
		let isShowTagComponent = false;
		if (tagComponent.join('')) {
			isShowTagComponent = true;
		}

		return (
			<div
				className={`${ModuleStyle['attribute-filter-panel']}  ${
					this.props.className
				}`}
			>
				{this.props.currentTargetType === ETargetType.Face &&
					this._renderFaceAttributeUI()}
				{this.props.currentTargetType === ETargetType.Body &&
					this._renderBodyAttributeUI()}
				{this.props.currentTargetType === ETargetType.Vehicle &&
					this._renderVehicleAttributeUI()}

				{/* face attribute popover */}
				{this.state.showFaceAttributesPopview && (
					<div
						className={ModuleStyle['content-card']}
						style={{
							left: `${this.state.pos.x}px`,
							top: `${this.state.pos.y}px`
						}}
					>
						<FaceAttributeSelectpanel
							selectedAttributeList={this.props.selectedAttributeList}
							disabledAttributeList={this.state.disableAttributeList}
							attributes={faceAttributes}
							onClickOk={this.onOkAttribute}
							onClickCancel={this.onCancelAttribute}
						/>
					</div>
				)}
				{/* body attribute popover */}
				{this.state.showBodyAttributesPopview && (
					<div
						className={ModuleStyle['content-card']}
						style={{
							left: `${this.state.pos.x}px`,
							top: `${this.state.pos.y}px`
						}}
					>
						<BodyAttributeSelectpanel
							clothesGroupAttributes={BodyClothesAttributeGroups}
							trousesGroupAttributes={BodyTrousersAttributeGroups}
							overcoatGroupAttributes={BodyOvercoatAttributeGroups}
							bagGroupAttrutes={BodyLagguageAttributeGroups}
							disabledAttributeList={this.state.disableAttributeList}
							selectedAttributeList={this.props.selectedAttributeList}
							onClickOk={this.onOkAttribute}
							onClickCancel={this.onCancelAttribute}
						/>
					</div>
				)}
				{/* car type attribute popover */}
				{this.state.showVehicleTypeAttributesPopview && (
					<div
						className={ModuleStyle['content-card']}
						style={{
							left: `${this.state.pos.x}px`,
							top: `${this.state.pos.y}px`
						}}
					>
						<VehicleTypeAttributesSelectPanel
							attributes={VehicleTypeAttributeGroups}
							disabledAttributeList={this.state.disableAttributeList}
							selectedAttributeList={this.props.selectedAttributeList}
							onClickOk={this.onOkAttribute}
							onClickCancel={this.onCancelAttribute}
						/>
					</div>
				)}

				{/* car brand attribute popover */}
				{this.state.showVehicleBrandAttributesPopview && (
					<div
						className={ModuleStyle['content-card']}
						style={{
							left: `${this.state.pos.x}px`,
							top: `${this.state.pos.y}px`
						}}
					>
						<VehicleBrandSeriesAttributesSelectPanel
							vehilceAttributeGroup={VehicleBrandManager.getVehicleBrandAttributeGroupInfo()}
							disabledAttributeList={this.state.disableAttributeList}
							selectedAttributeList={this.props.selectedAttributeList}
							onClickOk={this.onOkAttribute}
							onClickCancel={this.onCancelAttribute}
						/>
					</div>
				)}

				{/* car color attribute popover */}
				{this.state.showVehicleColorAttributesPopview && (
					<div
						className={`${ModuleStyle['content-card']}`}
						style={{
							left: `${this.state.pos.x}px`,
							top: `${this.state.pos.y}px`
						}}
					>
						<VehicleColorAttributesSelectPanel
							attributes={VehicleColorAttributeGroups}
							disabledAttributeList={this.state.disableAttributeList}
							selectedAttributeList={this.props.selectedAttributeList}
							onClickOk={this.onOkAttribute}
							onClickCancel={this.onCancelAttribute}
						/>
					</div>
				)}

				{/* car license color attribute popover */}
				{this.state.showVehicleLicenseAttributesPopview && (
					<div
						className={ModuleStyle['content-card']}
						style={{
							left: `${this.state.pos.x}px`,
							top: `${this.state.pos.y}px`
						}}
					>
						<VehicleLicenseColorAttributesSelectPanel
							attributes={VehicleLicenseColorAttributeGroups}
							disabledAttributeList={this.state.disableAttributeList}
							selectedAttributeList={this.props.selectedAttributeList}
							onClickOk={this.onOkAttribute}
							onClickCancel={this.onCancelAttribute}
						/>
					</div>
				)}

				{/* 已选择过滤属性 */}
				{isShowTagComponent && (
					<div
						ref={this.tagContainer}
						className={ModuleStyle['search-selected-container']}
					>
						{tagComponent}
						{/* </ReactCSSTransitionGroup> */}
						<div
							className={ModuleStyle['clear-all-attribute']}
							onClick={this.handleClickReset}
						>
							<img src={Clear} width="18px" height="15px" alt="" />
							<span style={{ marginLeft: '4px' }}>
								{intl.get('ATTRIBUTE_CLEAR_ALL_ATTRIBUTES').d('清空条件')}
							</span>
						</div>
					</div>
				)}
			</div>
		);
	}
}

// 导出一个厉害的东西

function mapStateToProps(state) {
	return {
		startDate: state[AttributeFilterPanelActionCreators.reducerName].startDate,
		endDate: state[AttributeFilterPanelActionCreators.reducerName].endDate,
		selectedAttributeList:
			state[AttributeFilterPanelActionCreators.reducerName].selectedAttributes,
		attributeAccuracy:
			state[AttributeFilterPanelActionCreators.reducerName].attributeAccuracy,
		showBodyRelatedWithFace:
			state[AttributeFilterPanelActionCreators.reducerName]
				.showBodyRelatedWithFace,
		showFaceRelatedWithBody:
			state[AttributeFilterPanelActionCreators.reducerName]
				.showFaceRelatedWithBody,
		showVehicleRelatedWithFace:
			state[AttributeFilterPanelActionCreators.reducerName]
				.showVehicleRelatedWithFace,
		faceThreshold:
			state[AttributeFilterPanelActionCreators.reducerName].faceThreshold,
		bodyThreshold:
			state[AttributeFilterPanelActionCreators.reducerName].bodyThreshold,
		faceResultMergeType:
			state[AttributeFilterPanelActionCreators.reducerName].faceResultMergeType,
		bodyResultMergeType:
			state[AttributeFilterPanelActionCreators.reducerName].bodyResultMergeType,
		searchTargets:
			state[SearchResultPageActionsCreator.reducerName].searchTargetList
	};
}

// let mapDispatchToProps = {
// };

function mapDispatchToProps(disptach: Dispatch) {
	return {
		// 修改时间范围
		changeDateRange: function changeDate(
			startDate: typeof DateFormat,
			endDate: typeof DateFormat
		) {
			disptach(
				AttributeFilterPanelActionCreators.changeDateRangeActionCreator(
					startDate,
					endDate
				)
			);
		},
		// 更新选择的属性
		updateSelectedAttributes: function updateSelectedAttributes(
			selectedAttributeList: Array<IFAttributeProperty>
		) {
			disptach(
				AttributeFilterPanelActionCreators.refreshSelectedAttributes(
					selectedAttributeList
				)
			);
		},
		// 显示关联的人体信息
		switchShowBodyWithRelatedFace: function switchShowBodyWithRelatedFace(
			checked: boolean
		) {
			disptach(
				AttributeFilterPanelActionCreators.switchShowBodyWithRelatedFace(
					checked
				)
			);
		},
		// 显示关联的人脸信息
		switchShowFaceWithRelatedBody: function switchShowFaceWithRelatedBody(
			checked: boolean
		) {
			disptach(
				AttributeFilterPanelActionCreators.switchShowFaceWithRelatedBody(
					checked
				)
			);
		},
		// 显示关联的车辆信息
		switchShowVehicleWithRelatedFace: function switchShowVehicleWithRelatedFace(
			checked: boolean
		) {
			disptach(
				AttributeFilterPanelActionCreators.switchShowVehicleWithRelatedFace(
					checked
				)
			);
		},
		// 修改人脸相似度
		changeFaceThreshold: function changeFaceThreshold(threshold: number) {
			disptach(
				AttributeFilterPanelActionCreators.changeFaceThreshold(threshold)
			);
		},
		// 修改人体相似度
		changeBodyThreshold: function changeBodyThreshold(threshold: number) {
			disptach(
				AttributeFilterPanelActionCreators.changeBodyThreshold(threshold)
			);
		},
		// 人脸结果的交并集
		changeFaceResultMergeType: function changeFaceResultMergeType(
			mergeType: EMerge
		) {
			disptach(
				AttributeFilterPanelActionCreators.changeFaceResultMergeType(mergeType)
			);
		},
		// 人体结果的交并集
		changeBodyResultMergeType: function changeBodyResultMergeType(
			mergeType: EMerge
		) {
			disptach(
				AttributeFilterPanelActionCreators.changeBodyResultMergeType(mergeType)
			);
		}
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AttributeFilterPanel);
