import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { OutFlowCallBack, IFThrottlePoolInterface } from '../interfaces';

function noop() {}

class ThrottlePool implements IFThrottlePoolInterface {
	allData: Array<any>; // 保存所有的数据
	outputCountPerTime: number; // 一次发送的数据的量，
	outputIntervalTime: number; // 一次发送的间隔时间, 为0表示一次全部发送
	capability: number; // 能容纳的总数
	callback: OutFlowCallBack;

	// 时间控制有关的变量
	_lastTimestamp: number; // 上次的时间戳
	_delta: number;
	_requestAnimationId: number;

	constructor(
		outputCountPerTime: number = 1,
		outputIntervalTime: number = 1,
		initData: Array<any> = []
	) {
		this._reset(outputCountPerTime, outputIntervalTime, initData);
		this._requestAnimationId = 0;
		this._delta = 0;
	}

	/**
	 * 开启数据流的管理
	 * NOTE: 最核心的方法，价值一个亿
	 * @private
	 * @returns {void}
	 * @memberof ThrottlePool
	 */
	public startFlowManage(): void {
		this._lastTimestamp = performance.now();
		window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
			this._flowSpeedControl(timestamp);
		});
	}

	/**
	 * 开启数据流的管理
	 * NOTE: 最核心的方法，价值一个亿
	 * @private
	 * @returns {void}
	 * @memberof ThrottlePool
	 */
	public stopFlowManage(): void {
		if (this._requestAnimationId) {
			window.cancelAnimationFrame(this._requestAnimationId);
			this._requestAnimationId = 0;
		}
	}

	/*×××××××××××××××××××××××××××××××××××××× IFThrottlePoolInterface 接口实现部分 begin  ××××××××××××××××××××××××××××××××××××××*/

	/**
	 * 数据流入接口
	 * @param {Array<any>} data 数据
	 * @returns {void}
	 */
	inflow(data: any[]): void {
		//
		let remainderCapability = this._getRemainderCapability();
		if (remainderCapability > 0) {
			// 还有剩余容量
			if (remainderCapability < data.length) {
				// 截取
				data.splice(remainderCapability - 1);
				console.warn(
					'pool is about to be fulled, the partial data will be ignored'
				);
			}

			this.allData.push(...data);
		} else {
			console.warn('pool is full, the data is ignored');
		}
	}

	/**
	 * 数据流出的接口
	 * @param {OutFlowCallBack} callback 回调函数
	 * @memberof ThrottlePool
	 * @returns {void}
	 */
	outflow(callback: OutFlowCallBack): void {
		//
		this.callback = callback;
	}

	/**
	 * 调整输出速率
	 * @param {number} outputCountPerTime 整数(一次发送的数量)
	 * @param {number} outputIntervalTime 单位s（发送的间隔时间）
	 * @returns {void}
	 * @memberof ThrottlePool
	 */
	adjustFlowSpeed(
		outputCountPerTime: number,
		outputIntervalTime: number
	): void {
		//
		this._resetOutputCountPerTime(outputCountPerTime);
		this._resetOutputIntervalTime(outputIntervalTime);
	}

	adjustCapability(capability: number): void {
		let validCapability = ValidateTool.getValidNumber(capability, -1);
		this.capability = Math.max(0, validCapability);
	}

	clearPool() {
		//
		this._resetData([]);
	}
	/*×××××××××××××××××××××××××××××××××××××× IFThrottlePoolInterface 接口实现部分 eng  ××××××××××××××××××××××××××××××××××××××*/

	/*××××××××××××××××××××××××××××××××××××××******** 私有方法 begin **************××××××××××××××××××××××××××××××××××××××*/

	private _reset(
		outputCountPerTime: number = 1,
		outputIntervalTime: number = 1,
		initData: Array<any> = []
	) {
		this._resetOutputCountPerTime(outputCountPerTime);
		this._resetOutputIntervalTime(outputIntervalTime);
		this._resetData(initData);

		this.callback = noop;
		this.capability = 1000; // 默认的容量大小
	}

	private _resetOutputCountPerTime(outputCountPerTime: number = 1) {
		this.outputCountPerTime = Math.max(
			1,
			Number.parseInt(
				String(ValidateTool.getValidNumber(outputCountPerTime, 1)),
				10
			)
		);
	}

	/**
	 * 重置发送的时间间隔
	 * @private
	 * @param {number} [outputIntervalTime=1] 单位s
	 * @returns {void}
	 * @memberof ThrottlePool
	 */
	private _resetOutputIntervalTime(outputIntervalTime: number = 1) {
		this.outputIntervalTime = Math.max(
			1,
			Number.parseInt(
				String(ValidateTool.getValidNumber(outputIntervalTime, 1)),
				10
			)
		);
	}

	private _resetData(data: Array<any>) {
		this.allData = ValidateTool.getValidArray(data, []);
	}

	private _getRemainderCapability(): number {
		return this.capability - this.allData.length;
	}

	/**
	 * 流速限制
	 * NOTE: 核心代码，价值一个亿
	 * @private
	 * @param {DOMHighResTimeStamp} timestamp 时间戳
	 * @returns {void}
	 * @memberof ThrottlePool
	 */
	private _flowSpeedControl(timestamp: DOMHighResTimeStamp): void {
		let now = performance.now();
		this._delta += performance.now() - this._lastTimestamp;
		this._lastTimestamp = now;
		if (this._delta > this.outputIntervalTime * 1000) {
			// 重置
			this._delta = 0;
			// 需要切割数据
			let outputData: Array<any> = this._spliceData(
				this.outputIntervalTime === 0
					? this.allData.length
					: this.outputCountPerTime
			);
			if (outputData.length > 0) {
				console.log('0000000000000000 delta', this._delta);
				// 输出
				this.callback(outputData);
			}
		}

		this._requestAnimationId = window.requestAnimationFrame(
			(nextTimestamp: DOMHighResTimeStamp) => {
				this._flowSpeedControl(nextTimestamp);
			}
		);
	}

	/**
	 * 获取需要流出的数据
	 * NOTE: 核心代码，价值一个亿
	 * @param {number} count 预期输出的个数
	 * @returns {Array<any>} 需要输出的数据，长度小于等于count
	 * @memberof ThrottlePool
	 */
	private _spliceData(count: number): Array<any> {
		if (count >= this.allData.length) {
			return this.allData.splice(0);
		} else {
			return this.allData.splice(0, Math.max(1, count));
		}
	}

	/*××××××××××××××××××××××××××××××××××××××******** 私有方法 end **************××××××××××××××××××××××××××××××××××××××*/
}

export default ThrottlePool;
