import { guid } from 'ifvendors/utils/guid';
import { TaskQueueItem } from 'ifvendors/utils/task-queue';

interface StepTaskOption {
	update: number; // 多少ms更新一次
}

/**
 * 创建任务的子状态
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
export class TaskQueueStepTask implements TaskQueueItem {
	private _id: string;

	private _pastTime: number;
	private _config: StepTaskOption;

	constructor(options: StepTaskOption = { update: 1 * 1000 }) {
		this._id = guid();

		let defaultOptions = {
			update: 1 * 1000
		};
		this._config = {
			...defaultOptions,
			...options
		};

		this._pastTime = 0;
	}

	getId() {
		return this._id;
	}

	/**
	 * 父类调用，每次循环调用一次step
	 * @param {number} timePastAfterLastCall 距离上次调用的时间间隔
	 * @returns {void} void
	 * @memberof StepTask
	 */
	step(timePastAfterLastCall: number): void {
		this._pastTime += timePastAfterLastCall;
		if (this._pastTime > this._config.update) {
			this.update(this._pastTime);
			this._pastTime = 0;
		}
	}

	/**
	 * 交由子类去实现
	 * @memberof StepTask
	 * @param {number} deltaTime 距离上次调用的间隔时间
	 * @returns {void} void
	 */
	update(deltaTime: number) {
		//
	}

	isActive() {
		return false;
	}

	isError() {
		return false;
	}

	isSuspended() {
		return false;
	}

	isFinished() {
		return true;
	}

	async start(): Promise<any> {
		// 开头先触发一次
		this.update(0);
		return 0;
	}

	pause() {
		//
	}

	continue() {
		//
	}

	retry() {
		//
	}

	cancel() {
		//
	}
}
