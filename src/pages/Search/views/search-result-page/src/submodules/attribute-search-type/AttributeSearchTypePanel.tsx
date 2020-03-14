import STComponent from 'stcomponents/st-component';
import * as React from 'react';
import * as intl from 'react-intl-universal';
import { ETargetType, EMerge } from 'sttypedefine';
import { Checkbox, Switch, message } from 'antd';
import ModuleStyle from './src/assets/styles/index.module.scss';

const CheckboxGroup = Checkbox.Group;

const options = [
	{
		label: intl.get('ATTRIBUTE_SEARCH_FACE').d('人脸'),
		value: ETargetType.Face
	},
	{
		label: intl.get('ATTRIBUTE_SEARCH_BODY').d('人体'),
		value: ETargetType.Body
	},
	{
		label: intl.get('ATTRIBUTE_SEARCH_CAR').d('车辆'),
		value: ETargetType.Vehicle
		// disabled: true
	}
];

export enum EViewMode {
	Search = 'search', //搜索
	Analysis = 'analysis' //分析
}
interface PropsType {
	checkedValue: ETargetType[];
	onChange: (searchTypes: ETargetType[]) => void;
	onChangeMatch: (mergeType: EMerge) => void;
	viewMode: EViewMode;
	showMatch: boolean;
	total: string;
	style: Object;
	className: string;
}

interface StateType {
	// searchTypes: ETargetType[];
	mergeType: EMerge; //精确匹配 或者模糊匹配
}

function none() {}
const DEFAULTOTAL: string = '0';

class AttributeSearchTypePanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		checkedValue: [],
		onChange: none,
		onChangeMatch: none,
		viewMode: EViewMode.Analysis,
		showMatch: true,
		total: DEFAULTOTAL,
		style: {},
		className: ''
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			// searchTypes: props.checkedValue,
			mergeType: EMerge.Intersection
		};
	}

	onChange = (checkedValue: ETargetType[]) => {
		if (checkedValue.length >= 1 && this.props.onChange) {
			this.props.onChange(checkedValue);
		} else {
			message.warning(intl.get('----').d('人脸与人体需选中一项'));
		}
	};

	onChangeSwitch = (checked: boolean) => {
		let mergeType: EMerge = EMerge.Union;
		if (checked) {
			mergeType = EMerge.Intersection;
		}
		this.setState({
			mergeType
		});
		if (this.props.onChangeMatch) {
			this.props.onChangeMatch(mergeType);
		}
	};
	render() {
		const { checkedValue, viewMode, showMatch, total } = this.props;
		const { mergeType } = this.state;

		return (
			<div
				className={`${ModuleStyle['search-type-container']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				<div className={ModuleStyle['search-type-title-container']}>
					{viewMode === EViewMode.Search ? (
						<div className={ModuleStyle['search-type-title']}>
							<span>{intl.get('ATTRIBUTE_SEARCH_RESULTS').d('搜索结果')}</span>
							<span style={{ width: '80px', marginLeft: '4px' }}>
								{`(${total})`}
							</span>
						</div>
					) : (
						<div className={ModuleStyle['search-type-title']}>
							<span>
								{intl.get('ATTRIBUTE_ANALYSES_RESULTS').d('解析结果')}
							</span>
							{/* <span style={{ width: '80px', marginLeft: '4px' }}>
								{`(${total})`}
							</span> */}
						</div>
					)}
				</div>
				<CheckboxGroup
					value={checkedValue}
					options={options}
					onChange={this.onChange}
				/>
				{showMatch && (
					<div className={ModuleStyle['search-match-container']}>
						<Switch
							checked={mergeType === EMerge.Intersection}
							size="small"
							onChange={this.onChangeSwitch}
						/>
						{mergeType === EMerge.Intersection ? (
							<span className={ModuleStyle['search-match']}>
								{intl.get('ATTRIBUTE_EXACT_MATCH').d('精确匹配')}
							</span>
						) : (
							<span className={ModuleStyle['search-match']}>
								{intl.get('ATTRIBUTE_NO_EXACT_MATCH').d('模糊匹配')}
							</span>
						)}
					</div>
				)}
			</div>
		);
	}
}

export default AttributeSearchTypePanel;
