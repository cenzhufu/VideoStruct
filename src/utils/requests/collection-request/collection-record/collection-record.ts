import { IFAnalysisSourceDetailInfo } from 'stsrc/utils/requests/collection-request';
import { EAnalysisUserType } from '../collection-analyze-source/datasource-type';
import { ESourceType, ListType } from 'sttypedefine';
import { CollectionAnalysisSourceRequest } from 'stutils/requests/collection-request';
import { IFRequestConfig } from 'ifvendors/utils/requests';

/**
 *获取已接入上传记录数据数据
 *
 * @param {string} [query=''] query
 * @param {string} [startTime=''] startTime
 * @param {string} [endTime=''] endTime
 * @param {number} [userType=EAnalysisUserType.All] EAnalysisUserType
 * @param {number} [page=1] page
 * @param {number} [pageSize=500] pageSize
 * @param {Partial<IFRequestConfig>} [options={}] options
 * @returns {void}
 */
// eslint-disable-next-line
async function getUploadRecordList(
	query: string = '',
	startTime: string = '',
	endTime: string = '',
	userType: number = EAnalysisUserType.All,
	page: number = 1,
	pageSize: number = 500,
	options: Partial<IFRequestConfig> = {}
): Promise<ListType<IFAnalysisSourceDetailInfo>> {
	return CollectionAnalysisSourceRequest.getAnalysisSourceList({
		page,
		pageSize,
		query,
		startTime,
		endTime,
		userType,
		sourceTypes: [ESourceType.Video, ESourceType.Zip],
		resourceStatus: 0
	});
}

const CollectionRecordRequest = {
	getUploadRecordList
};

export default CollectionRecordRequest;
