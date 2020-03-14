import { IFUploadAndAnalysisProcessInfo } from './type';
import { ValidateTool } from 'ifutils/validate-tool';
import { handleActions } from 'redux-actions';
import FileUploadActionCreators from '../actions/file-upload-analysis.actions';

// 上传状态
interface IRFileUploadStateType {
	finishedBadgeCount: number; // 完成的文件上传数量
	totalUploadTasks: Array<IFUploadAndAnalysisProcessInfo>; // 所有的上传的任务
}

const fileUploadState: IRFileUploadStateType = {
	finishedBadgeCount: 0,
	totalUploadTasks: []
};

const fileUploadReduces = handleActions(
	{
		// 刷新上传文件
		[FileUploadActionCreators.refreshUploadFilesActionCreator.toString()]: (
			state,
			action
		) => {
			// 获得新增加的文件列表
			let infos: Array<
				IFUploadAndAnalysisProcessInfo
			> = ValidateTool.getValidArray(action.payload.totalUploadTasks);

			// 创建对应的上传任务
			return {
				...state,
				totalUploadTasks: [...infos]
			};
		},
		// 增加上传完成badge count
		[FileUploadActionCreators.increaseFinishedBadgeCountActionCreator.toString()]: (
			state,
			action
		) => {
			let amount = action.payload.amount || 1;
			return {
				...state,
				finishedBadgeCount: state.finishedBadgeCount + amount
			};
		},
		[FileUploadActionCreators.decreateFinishedBadgeCountActionCreator.toString()]: (
			state,
			action
		) => {
			let amount = action.payload.amount || 1;
			return {
				...state,
				finishedBadgeCount: Math.max(state.finishedBadgeCount - amount, 0)
			};
		},
		// 清空上传完成的badge count
		[FileUploadActionCreators.clearFinishedBadgeCountActionCreator.toString()]: (
			state,
			action
		) => {
			return {
				...state,
				finishedBadgeCount: 0
			};
		},
		// 重置
		[FileUploadActionCreators.resetActionCreator.toString()]: (
			state,
			action
		) => {
			return {
				...fileUploadState
			};
		}
	},
	{
		...fileUploadState
	}
);

// NOTE: 重写toString
fileUploadReduces.toString = function() {
	return FileUploadActionCreators.reducerName;
};
export default fileUploadReduces;
