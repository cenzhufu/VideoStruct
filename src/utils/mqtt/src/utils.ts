import { TypeValidate } from 'ifvendors/utils/validate-tool';

enum STMqttTopic {
	ActionTopic = 'alarm/behavior', // 行为布控mqtt topic
	LiveAnalysisTopic = 'notice/collection/online'
}

/**
 * 获得行为布控的mqtt topic
 * @export
 * @param {string} cameraId 摄像头id
 * @param {string} userId 当前用户id
 * @returns {string} topic
 */
export function getActionMonitorTopicId(
	cameraId: string,
	userId: string
): string {
	// 结构为：alarm/behavior/cameraId/userId(布控人)
	return `${STMqttTopic.ActionTopic}/${cameraId}/${userId}/#`;
}

/**
 * 获得实时解析消息的topic id
 * @export
 * @param {string} cameraid 摄像头id
 * @returns {string} topic
 */
export function getLiveAnalysisTopicId(cameraid: string): string {
	return `${STMqttTopic.LiveAnalysisTopic}/${cameraid}`;
}

/**
 * 是否行为布控消息
 * @export
 * @param {string} topic mqtt的topic
 * @returns {boolean} true表示是行为布控
 */
export function isActionMonitorTopic(topic: string): boolean {
	if (TypeValidate.isString(topic)) {
		return topic.startsWith(STMqttTopic.ActionTopic);
	} else {
		return false;
	}
}

/**
 * 是否是实时解析的top
 * @export
 * @param {string} topic mqtt的topic
 * @returns {boolean} true表示是实时解析的topic类型
 */
export function isLiveAnalysisTopic(topic: string): boolean {
	if (TypeValidate.isString(topic)) {
		return topic.startsWith(STMqttTopic.LiveAnalysisTopic);
	} else {
		return false;
	}
}
