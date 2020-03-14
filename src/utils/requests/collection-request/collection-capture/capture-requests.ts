import { ValidateTool } from 'ifutils/validate-tool';
import { getCollectionRequestUrl } from '../_util';
import IFRequest, { IFResponse } from 'ifvendors/utils/requests';
import * as moment from 'moment';

export interface CameraRequestDataType {
	id: string;
	url: string;
}

/**
 * 获取摄像头视频流
 * @param {string} id 摄像头id
 * @returns {Promise<CameraRequestDataType>} CameraRequestDataType
 */
async function getCameraAddress(id: string): Promise<CameraRequestDataType> {
	let url = getCollectionRequestUrl(
		'/collection/api/camera/onTime/streammedia/1.0'
	); //获取摄像头视频流地址
	let result: IFResponse<CameraRequestDataType> = await IFRequest.post(url, {
		id: id
	});
	// @ts-ignore
	let serverData = ValidateTool.getValidObject(result['data'], {});
	let data = ValidateTool.getValidString(serverData['data'], '{}');

	try {
		let jsonData: {
			EasyDarwin: {
				Body: {
					url: string;
					error_msg: string;
				};
			};
		} = JSON.parse(data);

		if (
			jsonData &&
			jsonData.EasyDarwin &&
			jsonData.EasyDarwin.Body &&
			jsonData.EasyDarwin.Body.error_msg
		) {
			return Promise.reject(new Error(jsonData.EasyDarwin.Body.error_msg));
		}

		return {
			url:
				jsonData &&
				jsonData.EasyDarwin &&
				jsonData.EasyDarwin.Body &&
				jsonData.EasyDarwin.Body.url,
			id: id
			// url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
			// url: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
			// id: id
		};
	} catch (error) {
		throw error;
	}
}

/**
 * 获取直播视频流
 * @param {string} cameraId 摄像头id
 * @param {string} startTime 开始时间 YYYY-MM-DD HH:mm:ss
 * @param {string} endTime 结束时间 YYYY-MM-DD HH:mm:ss
 * @returns {Promise<CameraRequestDataType>} 结果
 */
async function getSpecialLiveStream(
	cameraId: string,
	startTime: string,
	endTime: string
): Promise<CameraRequestDataType> {
	let url = getCollectionRequestUrl('/collection/api/camera/streammedia/1.0'); //获取摄像头视频流地址
	let result: IFResponse<CameraRequestDataType> = await IFRequest.post(url, {
		id: cameraId,
		start: startTime,
		end: endTime
	});
	// @ts-ignore
	let serverData = ValidateTool.getValidObject(result['data'], {});
	let data = ValidateTool.getValidString(serverData['data'], '{}');

	try {
		let jsonData: {
			EasyDarwin: {
				Body: {
					url: string;
					error_msg: string;
				};
			};
		} = JSON.parse(data);

		if (
			jsonData &&
			jsonData.EasyDarwin &&
			jsonData.EasyDarwin.Body &&
			jsonData.EasyDarwin.Body.error_msg
		) {
			return Promise.reject(new Error(jsonData.EasyDarwin.Body.error_msg));
		}

		return {
			url:
				jsonData &&
				jsonData.EasyDarwin &&
				jsonData.EasyDarwin.Body &&
				jsonData.EasyDarwin.Body.url,
			id: cameraId
			// url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
			// url: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
			// id: id
		};
	} catch (error) {
		throw error;
	}
}

/**
 * 获得timestamp前后range秒的视频
 * @param {string} cameraId 摄像头id
 * @param {number} timestamp 时间戳
 * @param {number} [range=10] 范围，单位s
 * @returns {Promise<CameraRequestDataType>} 视频流
 */
async function getCapture10RangeLiveStream(
	cameraId: string,
	timestamp: number,
	range: number = 10
): Promise<CameraRequestDataType> {
	// 得到start, end
	let startTime = moment(timestamp - range * 1000).format(
		'YYYY-MM-DD HH:mm:ss'
	);
	let endTime = moment(timestamp + range * 1000).format('YYYY-MM-DD HH:mm:ss');
	return getSpecialLiveStream(cameraId, startTime, endTime);
}

const CollectionCaptureRequests = {
	getCameraAddress: getCameraAddress,
	getSpecialLiveStream: getSpecialLiveStream,
	getCapture10RangeLiveStream: getCapture10RangeLiveStream
};

export default CollectionCaptureRequests;
