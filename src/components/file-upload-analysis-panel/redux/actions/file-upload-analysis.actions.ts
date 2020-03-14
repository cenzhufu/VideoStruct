import { IFUploadAndAnalysisProcessInfo } from './../reduces/type';
import { createActions } from 'redux-actions';

// @ts-ignore
const fileUploadActionCreators = createActions({
	APP: {
		UTILS: {
			// 非组件
			FILE_UPLOAD: {
				// 新增完成的badge count
				INCREASE_FINISHED_BADGE_COUNT: (amount: number = 1) => ({
					amount: amount
				}),
				DECREASE_FINISHED_BADGE_COUNT: (amount: number = 1) => {
					return {
						amount: amount
					};
				},
				// 清空完成的badge count
				CLEAR_FINISHED_BADGE_COUNT: undefined,
				// 刷新上传的文件列表
				REFRESH_UPLOAD_FILES: (
					allUploadInfos: Array<IFUploadAndAnalysisProcessInfo>
				) => ({
					totalUploadTasks: allUploadInfos
				}),
				RESET: undefined
			}
		}
	}
});

const FileUploadActionCreators = {
	reducerName: 'APP/UTILS/FILE_UPLOAD',
	refreshUploadFilesActionCreator:
		fileUploadActionCreators.app.utils.fileUpload.refreshUploadFiles,
	clearFinishedBadgeCountActionCreator:
		fileUploadActionCreators.app.utils.fileUpload.clearFinishedBadgeCount,
	increaseFinishedBadgeCountActionCreator:
		fileUploadActionCreators.app.utils.fileUpload.increaseFinishedBadgeCount,
	decreateFinishedBadgeCountActionCreator:
		fileUploadActionCreators.app.utils.fileUpload.decreaseFinishedBadgeCount,
	resetActionCreator: fileUploadActionCreators.app.utils.fileUpload.reset
};

export default FileUploadActionCreators;
