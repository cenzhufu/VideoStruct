import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import * as intl from 'react-intl-universal';
import { Button } from 'antd';
import ModuleStyle from './assets/styles/index.module.scss';
import { withRouter, match } from 'react-router';
import * as H from 'history';
import { ETargetType } from 'stsrc/type-define';
import { ESourceType } from 'sttypedefine';
import { IFUniqueDataSource } from 'stsrc/utils/requests/collection-request';

// 结果查看的模式
export enum EStructuralItemResultsViewMode {
	Unknown = 'unknown',
	ListMode = 'listMode',
	MapMode = 'mapMode'
}

interface PropsType {
	// router带过来的属性
	match: match;
	history: H.History;
	location: H.Location;

	supportedTargetTypes: ETargetType[];
	onClickTargetType: (targetType: ETargetType) => void;

	searchRange: Array<IFUniqueDataSource>;

	viewMode: EStructuralItemResultsViewMode;
	onChangeViewMode: (viewMode: EStructuralItemResultsViewMode) => void;

	currentSelectedType: ETargetType;

	className: string;
	style: React.CSSProperties;
}
function noop() {}

class TargetTypeNavBar extends STComponent<PropsType> {
	static defaultProps = {
		supportedTargetTypes: [],
		onClickTargetType: noop,
		sourceList: [],

		viewMode: EStructuralItemResultsViewMode.Unknown,
		onChangeViewMode: noop,

		currentSelectedType: ETargetType.Unknown,

		className: '',
		style: {},
		searchRange: []
	};

	isFaceItemActive() {
		return this.props.currentSelectedType === ETargetType.Face;
	}

	isBodyItemActive() {
		return this.props.currentSelectedType === ETargetType.Body;
	}

	isVehicleItemActive() {
		return this.props.currentSelectedType === ETargetType.Vehicle;
	}

	onClickFace = () => {
		this.props.onClickTargetType(ETargetType.Face);
	};

	onClickBody = () => {
		this.props.onClickTargetType(ETargetType.Body);
	};

	onClickVehicle = () => {
		this.props.onClickTargetType(ETargetType.Vehicle);
	};

	onChangeToMapMode = () => {
		this.props.onChangeViewMode(EStructuralItemResultsViewMode.MapMode);
	};

	onChangeToListMode = () => {
		this.props.onChangeViewMode(EStructuralItemResultsViewMode.ListMode);
	};

	render() {
		return (
			<div
				className={`${ModuleStyle['target-type-nav-bar']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				{this.props.supportedTargetTypes.indexOf(ETargetType.Face) !== -1 && (
					<div
						onClick={this.onClickFace}
						className={`${
							ModuleStyle['target-type-item']
						} ${this.isFaceItemActive() && ModuleStyle['active-item']}`}
					>
						{intl.get('SEARCH_RESULT_TARGET_TYPE_FACE').d('人脸')}
					</div>
				)}
				{this.props.supportedTargetTypes.indexOf(ETargetType.Body) !== -1 && (
					<div
						onClick={this.onClickBody}
						className={`${
							ModuleStyle['target-type-item']
						} ${this.isBodyItemActive() && ModuleStyle['active-item']}`}
					>
						{intl.get('SEARCH_RESULT_TARGET_TYPE_BODY').d('人体')}
					</div>
				)}
				{this.props.supportedTargetTypes.indexOf(ETargetType.Vehicle) !==
					-1 && (
					<div
						onClick={this.onClickVehicle}
						className={`${
							ModuleStyle['target-type-item']
						} ${this.isVehicleItemActive() && ModuleStyle['active-item']}`}
					>
						{intl.get('SEARCH_RESULT_TARGET_TYPE_VEHICLE').d('车辆')}
					</div>
				)}
				{JSON.stringify(this.props.searchRange).indexOf(ESourceType.Camera) !==
					-1 || !this.props.searchRange.length ? (
					<div className={ModuleStyle['mode-change-container']}>
						{this.props.viewMode ===
							EStructuralItemResultsViewMode.ListMode && (
							<Button onClick={this.onChangeToMapMode}>
								{intl.get('SEARCH_RESULT_MAP_MODE').d('地图模式')}
							</Button>
						)}
						{this.props.viewMode === EStructuralItemResultsViewMode.MapMode && (
							<Button onClick={this.onChangeToListMode}>
								{intl.get('SEARCH_RESULT_LIST_MODE').d('列表模式')}
							</Button>
						)}
					</div>
				) : null}
			</div>
		);
	}
}

export default withRouter(TargetTypeNavBar);
