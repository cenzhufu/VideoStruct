import { TypeValidate } from 'ifvendors/utils/validate-tool';
import Config from 'stutils/config';
import * as mqtt from 'mqtt';
import { getActionMonitorTopicId } from './utils';

let _stMqttInstance: STMqtt | null = null;
let _client: mqtt.MqttClient | null;

class STMqtt {
	constructor() {
		_client = null;
	}

	/**
	 * 单例
	 * @static
	 * @memberof STMqtt
	 * @returns {STMqtt} STMqtt实例
	 */
	static getInstance() {
		if (!_stMqttInstance) {
			_stMqttInstance = new STMqtt();
		}

		return _stMqttInstance;
	}

	connect(
		ip: string = '',
		port: string = '',
		options: Partial<mqtt.IClientOptions> = {}
	) {
		let realIp = ip || Config.getMqttServerIpAddress();
		let realPort = port || Config.getMqttServerPort();

		// 之前存在，则断开链接
		if (_client) {
			_client.end();
			_client = null;
		}

		_client = mqtt.connect({
			host: realIp,
			port: realPort
		});

		_client.on('connect', function() {
			console.log('连接MQTT服务成功!');
		});
		_client.on('reconnect', function() {
			console.log('mqtt正在尝试重新连接...');
		});

		_client.on('offline', function() {
			console.log('mqtt连接出错');
		});

		_client.on('close', function() {
			console.log('MQTT服务成功关闭!');
		});
	}

	disconnect() {
		//
		if (_client) {
			_client.end();
			_client = null;
		}
	}

	publish(topic: string, info: Object) {
		if (_client) {
			_client.publish(topic, JSON.stringify(info));
		}
	}

	subscribe(
		topic: string | string[] | mqtt.ISubscriptionMap,
		callback?: mqtt.ClientSubscribeCallback
	) {
		if (_client) {
			_client.subscribe(topic, (info: any) => {
				console.log(`mqtt订阅${topic}`);
			});
		}
	}

	unsubscribe(topic: string | string[], callback?: mqtt.PacketCallback) {
		if (_client) {
			_client.unsubscribe(topic, (info: any) => {
				console.log('mqtt取消订阅');
				if (TypeValidate.isFunction(callback)) {
					//
				}
			});
		}
	}

	listen(
		callback: (topic: string, message: string, packet: mqtt.Packet) => void
	) {
		if (_client) {
			_client.on('message', function(
				topic: string,
				message: Buffer,
				packet: mqtt.Packet
			) {
				if (TypeValidate.isFunction(callback)) {
					callback(topic, message.toString(), packet);
				}
			});
		}
	}

	/********************业务相关 ××××××××××××××××××××××*/
	/**
	 * 订阅行为布控
	 * @memberof STMqtt
	 * @param {string[]} cameraIds 摄像头id
	 * @param {string} userId 当前用户id
	 * @param {Function} callback 回调函数
	 * @returns {void} void
	 */
	subscribeActionAlarm(
		cameraIds: string[],
		userId: string,
		callback?: () => void
	) {
		if (cameraIds.length <= 0) {
			return;
		}
		let topics: string[] = [];
		for (let cameraId of cameraIds) {
			topics.push(getActionMonitorTopicId(cameraId, userId));
		}
		this.subscribe(topics, () => {
			if (callback && TypeValidate.isFunction(callback)) {
				callback();
			}
		});
	}

	/**
	 * 取消行为布控的订阅
	 * @param {string[]} cameraIds 摄像头id
	 * @param {string} userId 当前用户Id
	 * @param {Function} callback 回调函数
	 * @memberof STMqtt
	 * @returns {void} void
	 */
	unsubscribeActionAlarm(
		cameraIds: string[],
		userId: string,
		callback?: () => void
	) {
		if (cameraIds.length <= 0) {
			return;
		}

		let topics: string[] = [];
		for (let cameraId of cameraIds) {
			topics.push(getActionMonitorTopicId(cameraId, userId));
		}
		this.unsubscribe(topics, callback);
	}
}

export default STMqtt;
