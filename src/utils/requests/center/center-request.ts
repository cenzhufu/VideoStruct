import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { CommonResponseDataType } from './../../../type-define/types/common-response-datatype';
import { IFResponse } from 'ifutils/requests';
import IFRequest from 'ifvendors/utils/requests';
import { getCenterRequestUrl } from './_util';
import { ETargetType, ESourceType } from 'stsrc/type-define';

export interface IFEngineTargetStatus {
	target: ETargetType;
	sourceType: ESourceType[];
}

export interface IFEngineStatus {
	engineCapability: IFEngineTargetStatus[];
}

/**
 * 检查引擎的能力
 * @export
 * @returns {Promise<IFEngineStatus>} IFEngineStatus
 */
async function getEngineStatus(): Promise<IFEngineStatus> {
	let url = getCenterRequestUrl('/api/intellif/engine/status/query/1.0');
	let result: IFResponse<
		CommonResponseDataType<IFEngineStatus>
	> = await IFRequest.post(url, {
		engineType: []
	});

	// @ts-ignore
	let serverResponseData: CommonResponseDataType<
		IFEngineStatus
	> = ValidateTool.getValidObject(result['data']);

	// @ts-ignore
	let serverData: IFEngineStatus = ValidateTool.getValidObject(
		serverResponseData.data
	);

	return serverData;
}

export const CenterRequests = {
	getEngineStatus: getEngineStatus
};
