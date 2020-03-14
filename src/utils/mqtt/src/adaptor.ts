import {
	EActionMonitorType,
	EActionScenceType
} from 'stsrc/utils/requests/monitor-request/src/action-monitor/types';
import { TypeValidate } from 'ifutils/validate-tool';
import { IFActionAlarmInfo } from './type';
import { addUrlPrefixIfNeeded } from 'stsrc/utils/requests/interceptors/responeses/uriprefix-interceptor';
import { EThumbFlag } from 'stsrc/utils/requests/tools';
import { guid } from 'ifutils/guid';

function _getType(type: EActionMonitorType): EActionMonitorType | null {
	if (!type) {
		return null;
	}

	switch (type) {
		case EActionMonitorType.Ride:
		case EActionMonitorType.ManyPeople:
		case EActionMonitorType.FallOver:
		case EActionMonitorType.Disorder:
			return type;
		default:
			return null;
	}
}

export function toActionAlarmInfoFromObject(
	obj: IFActionAlarmInfo
): IFActionAlarmInfo | undefined {
	if (TypeValidate.isObject(obj)) {
		// 判断必要参数

		let type: EActionMonitorType | null = _getType(obj.type);
		if (
			// @ts-ignore
			obj.id &&
			// @ts-ignore
			obj.userId &&
			// @ts-ignore
			obj.cameraId &&
			// @ts-ignore
			type &&
			// @ts-ignore
			obj.url &&
			// @ts-ignore
			obj.time
		) {
			let result: IFActionAlarmInfo = {
				id: obj.id,
				userId: obj.userId,
				cameraId: obj.cameraId,
				// @ts-ignore
				type: type,
				// 添加链接前缀
				url: addUrlPrefixIfNeeded(obj.url + EThumbFlag.Thumb200x200), // NOTE: 缩略图配置
				time: obj.time,
				sceneType: EActionScenceType.Unknown,
				isNewMessage: false,
				uuid: guid()
			};

			return result;
		} else {
			return undefined;
		}
	} else {
		return undefined;
	}
}
