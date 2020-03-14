import { EConfidenceValue } from 'sttypedefine/types/attributes/attribute-type';
import { ValidateTool } from 'ifutils/validate-tool';
import { DateFormat, IFAttributeProperty, EMerge } from 'stsrc/type-define';
import { handleActions } from 'redux-actions';
import AttributeFilterPanelActionCreators from '../actions/attribute-filter-panel.actions';
import * as moment from 'moment';
import Config from 'stsrc/utils/config';

const DAYS: number = 7;

interface IRAttributeFilterPanelStateType {
	startDate: typeof DateFormat; // 开始时间
	endDate: typeof DateFormat; // 结束时间
	selectedAttributes: Array<IFAttributeProperty>; // 选择的所有的属性条件
	attributeAccuracy: EConfidenceValue; //属性精确度 (截止二期，还没有入口调整这个参数)
	showBodyRelatedWithFace: boolean; // 是否显示人脸关联的人体信息
	showFaceRelatedWithBody: boolean; // 是否显示人体关联的人脸信息
	showVehicleRelatedWithFace: boolean; // 是否先是人脸关联的车辆信息
	faceThreshold: number; // 人脸相似度
	bodyThreshold: number; // 人体相似度
	// 是否精确匹配
	faceResultMergeType: EMerge;
	bodyResultMergeType: EMerge;
}

const initState: IRAttributeFilterPanelStateType = {
	startDate: moment()
		.set('hour', 0)
		.set('minute', 0)
		.set('second', 0)
		.subtract(DAYS, 'days')
		.format(DateFormat),
	endDate: moment()
		// .set('hour', 23)
		// .set('minute', 59)
		// .set('second', 59)
		.format(DateFormat),
	selectedAttributes: [],
	attributeAccuracy: EConfidenceValue.Low,
	showBodyRelatedWithFace: false,
	showFaceRelatedWithBody: false,
	showVehicleRelatedWithFace: false,
	faceThreshold: Config.getFaceDefaultThreshold(),
	bodyThreshold: Config.getBodyDefaultThreshold(),
	faceResultMergeType: EMerge.Union,
	bodyResultMergeType: EMerge.Union
};

function isToday(date: string): boolean {
	let today = moment();
	let dt = moment(date);
	if (
		today.isSame(dt, 'year') &&
		today.isSame(dt, 'month') &&
		today.isSame(dt, 'day')
	) {
		return true;
	} else {
		return false;
	}
}

const attributeFilterPanelReducers = handleActions(
	{
		// 修改时间范围
		[AttributeFilterPanelActionCreators.changeDateRangeActionCreator.toString()]: (
			state,
			action
		) => {
			let startDate = action.payload.startDate || '';
			let endDate = action.payload.endDate || '';
			return {
				...state,
				startDate: startDate,
				endDate: endDate
			};
		},
		// 更新今天的结束时间（如果当前的endDate是今天的话)
		[AttributeFilterPanelActionCreators.updateTodayEndTimeIfNeeded.toString()]: (
			state,
			action
		) => {
			if (state.endDate && isToday(state.endDate)) {
				// 修改当前时间
				return {
					...state,
					endDate: moment().format(DateFormat)
				};
			} else {
				return {
					...state
				};
			}
		},
		// 更新选择的属性
		[AttributeFilterPanelActionCreators.refreshSelectedAttributes.toString()]: (
			state,
			action
		) => {
			let attributes: Array<IFAttributeProperty> = ValidateTool.getValidArray(
				action.payload.selectedAttributes
			);

			return {
				...state,
				selectedAttributes: [...attributes]
			};
		},
		// 修改人脸tab栏，是否显示关联信息
		[AttributeFilterPanelActionCreators.switchShowBodyWithRelatedFace.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				showBodyRelatedWithFace: !!action.payload.showBodyRelatedWithFace
			};
		},
		// 修改人体tab栏, 是否显示关联信息
		[AttributeFilterPanelActionCreators.switchShowFaceWithRelatedBody.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				showFaceRelatedWithBody: !!action.payload.showFaceRelatedWithBody
			};
		},
		// 修改车辆tab栏, 是否显示关联信息
		[AttributeFilterPanelActionCreators.switchShowVehicleWithRelatedFace.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				showVehicleRelatedWithFace: !!action.payload.showVehicleRelatedWithFace
			};
		},
		// 相似度
		[AttributeFilterPanelActionCreators.changeFaceThreshold.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				faceThreshold: action.payload.faceThreshold
			};
		},
		[AttributeFilterPanelActionCreators.changeBodyThreshold.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				bodyThreshold: action.payload.bodyThreshold
			};
		},
		[AttributeFilterPanelActionCreators.changeFaceResultMergeType.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				faceResultMergeType: action.payload.faceResultMergeType
			};
		},
		[AttributeFilterPanelActionCreators.changeBodyResultMergeType.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				bodyResultMergeType: action.payload.bodyResultMergeType
			};
		},
		[AttributeFilterPanelActionCreators.resetActionCreator.toString()]: (
			state,
			action
		) => {
			return {
				...initState
			};
		},
		[AttributeFilterPanelActionCreators.resetToLatest.toString()]: (
			state,
			action
		) => {
			return {
				...initState,
				startDate: moment()
					.set('hour', 0)
					.set('minute', 0)
					.set('second', 0)
					.subtract(DAYS, 'days')
					.format(DateFormat),
				endDate: moment()
					// .set('hour', 23)
					// .set('minute', 59)
					// .set('second', 59)
					.format(DateFormat)
			};
		}
	},
	initState
);

attributeFilterPanelReducers.toString = function() {
	return AttributeFilterPanelActionCreators.reducerName;
};

export default attributeFilterPanelReducers;
