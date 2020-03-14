import { createActions } from 'redux-actions';
// eslint-disable-next-line
import { DateFormat, IFAttributeProperty, EMerge } from 'stsrc/type-define';

const attributeFilterPanelActionCreators = createActions({
	APP: {
		COMPONENTS: {
			ATTRIBUTE_FILTER_PANEL: {
				// 修改日期
				CHANGE_DATE_RANGE: (
					startDate: typeof DateFormat,
					endDate: typeof DateFormat
				) => ({
					startDate: startDate,
					endDate: endDate
				}),
				// 更新所有选择的属性
				REFRESH_SELECTED_ATTRIBUTES: (
					allAttributes: Array<IFAttributeProperty>
				) => ({
					selectedAttributes: allAttributes
				}),
				// 修改人脸--->关联的人体
				SWITCH_SHOW_BODY_WITH_RELATED_FACE: (checked: boolean) => ({
					showBodyRelatedWithFace: checked
				}),
				// 修改人体 ----> 关联的人脸
				SWITCH_SHOW_FACE_WITH_RELATED_BODY: (checked: boolean) => ({
					showFaceRelatedWithBody: checked
				}),
				// 修改车辆 ----> 关联的人脸
				SWITCH_SHOW_VEHICLE_WITH_RELATED_FACE: (checked: boolean) => ({
					showVehicleRelatedWithFace: checked
				}),
				// 相似度
				CHANGE_FACE_THRESHOLD: (threshold: number) => ({
					faceThreshold: threshold
				}),
				CHANGE_BODY_THRESHOLD: (threshold: number) => ({
					bodyThreshold: threshold
				}),
				// 交并集
				CHANGE_FACE_RESULT_MERGE_TYPE: (mergeType: EMerge) => ({
					faceResultMergeType: mergeType
				}),
				CHANGE_BODY_RESULT_MERGE_TYPE: (mergeType: EMerge) => ({
					bodyResultMergeType: mergeType
				}),
				RESET: undefined,
				RESET_TO_LATEST: undefined,
				UPDATE_TODAY_END_TIME_IF_NEEDED: undefined
			}
		}
	}
});

const AttributeFilterPanelActionCreators = {
	reducerName: 'APP/COMPONENTS/ATTRIBUTE_FILTER_PANEL',
	changeDateRangeActionCreator:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.changeDateRange,
	refreshSelectedAttributes:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.refreshSelectedAttributes,
	switchShowBodyWithRelatedFace:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.switchShowBodyWithRelatedFace,
	switchShowFaceWithRelatedBody:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.switchShowFaceWithRelatedBody,
	switchShowVehicleWithRelatedFace:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.switchShowVehicleWithRelatedFace,
	changeFaceThreshold:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.changeFaceThreshold,
	changeBodyThreshold:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.changeBodyThreshold,
	changeFaceResultMergeType:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.changeFaceResultMergeType,
	changeBodyResultMergeType:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.changeBodyResultMergeType,
	resetActionCreator:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.reset,
	resetToLatest:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.resetToLatest,
	updateTodayEndTimeIfNeeded:
		attributeFilterPanelActionCreators.app.components.attributeFilterPanel
			.updateTodayEndTimeIfNeeded
};

export default AttributeFilterPanelActionCreators;
