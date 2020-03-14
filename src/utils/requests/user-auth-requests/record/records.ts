import { getAnalysisRequestUrl } from '../../collection-request/_util';
import IFRequest from 'ifvendors/utils/requests';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import {
	IRecordDataSourceListReqPayload,
	IFRecordInfo,
	IBRecordInfo
} from './records-type';
import { CommonResponseDataType, ListType } from 'stsrc/type-define';
import { toFUserInfoFromB } from '../account/to-user-info-adaptor';

async function getrecordSearch(
	payload: IRecordDataSourceListReqPayload
): Promise<ListType<IFRecordInfo>> {
	let url = getAnalysisRequestUrl('/structuring/api/user/log/list/1.0');

	//@ts-ignore
	let result: IFResponse<
		CommonResponseDataType<IBRecordInfo[]>
	> = await IFRequest.post(url, payload);

	//@ts-ignore
	let serverData: CommonResponseDataType<
		IBRecordInfo[]
	> = ValidateTool.getValidObject(result['data'], {});

	let total: number = serverData.total || 0;

	//@ts-ignore
	let brecordInfos: IBRecordInfo[] = serverData.data;

	//@ts-ignore convert backend data to front
	let frecordInfo: IFRecordInfo[] = convertBRecordInfoToFRecordInfo(
		brecordInfos
	);

	//@ts-ignore
	return {
		list: frecordInfo,
		total: total
	};
}

function convertBRecordInfoToFRecordInfo(
	brecordInfos: Array<IBRecordInfo>
): Array<IFRecordInfo> {
	let fRecordInfos: Array<IFRecordInfo> = [];
	if (brecordInfos) {
		for (let item of brecordInfos) {
			let obj: IFRecordInfo = {
				id: item.id,
				operateTime: item.operateTime,
				logType: item.logType,
				userInfo:
					(item.userInfo && toFUserInfoFromB(item.userInfo)) || undefined,
				description: item.description
			};

			fRecordInfos.push(obj);
		}
	}
	return fRecordInfos;
}
const UserRecordSearchRequest = {
	recordSearch: getrecordSearch
};
export default UserRecordSearchRequest;
