export interface TaskQueueItem {
	start: () => Promise<any>;
	pause: () => void;
	continue: () => void;
	retry: () => void;
	cancel: () => void;

	getId: () => string;
	isActive: () => boolean;
	isError: () => boolean;
	isSuspended: () => boolean;
	isFinished: () => boolean; // 是否完成

	// 二期添加
	step?: (timePastAfterLastCall: number) => void;
}

export enum TaskQueueType {
	Active,
	Waiting,
	Suspend
}

type ConfigType = {
	maxParalleledCount: number;
};

/**
 * 子任务的主要状态就五个
 * 激活中，等待中，挂起（暂停）,失败和成功（会自动移除队列）
 */
class TaskQueue {
	private _maxParalleledCount: number; // 并发的数量
	private _activeQueue: Array<TaskQueueItem>; // 活动队列
	private _waitingQueue: Array<TaskQueueItem>; // 等待队列，自动移入活动队列中
	private _suspendQueue: Array<TaskQueueItem>; // 暂停队列，手动移入活动队列中
	private _runloopHandle: number;

	private _config: ConfigType;

	private _startTimeStamp: DOMHighResTimeStamp;

	constructor(
		config: ConfigType = {
			maxParalleledCount: 1
		}
	) {
		this._config = {
			...{
				maxParalleledCount: 1,
				autoRemoveWaitingToActive: true
			},
			...config
		};
		//
		this.reset();
	}

	/**
	 * 添加子任务，如果active为true则表示在条件允许下，自动加入到active队列并运行，否则放在waiting队列，为false则需要手动运行
	 * @param {TaskQueueItem} item  子任务
	 * @param {boolean} [active=true] 是否激活
	 * @returns {void} void
	 * @memberof TaskQueue
	 */
	addItem(item: TaskQueueItem, active: boolean = true): void {
		console.log('添加任务', item.getId());
		if (item) {
			if (active) {
				if (this._activeQueue.length >= this._maxParalleledCount) {
					this._waitingQueue.push(item);
				} else {
					this._activeQueue.push(item);
					item.start();
					this._runIfNeeded();
				}
			} else {
				this._suspendQueue.push(item);
			}
		}
	}

	switchToIfNeeded(
		item: TaskQueueItem,
		from: TaskQueueType,
		to: TaskQueueType
	) {
		// 判断item是否在from里边

		let fromQueue: TaskQueueItem[] = [];
		let toQueue: TaskQueueItem[] = [];
		switch (from) {
			case TaskQueueType.Active: {
				fromQueue = this._activeQueue;
				break;
			}

			case TaskQueueType.Waiting:
				fromQueue = this._waitingQueue;
				break;

			case TaskQueueType.Suspend:
				fromQueue = this._suspendQueue;
				break;

			default:
				break;
		}

		switch (to) {
			case TaskQueueType.Active: {
				toQueue = this._activeQueue;
				break;
			}

			case TaskQueueType.Waiting:
				toQueue = this._waitingQueue;
				break;

			case TaskQueueType.Suspend:
				toQueue = this._suspendQueue;
				break;

			default:
				break;
		}

		this._switchFromToIfNeeded(item, from, fromQueue, to, toQueue);
	}

	_switchFromToIfNeeded(
		item: TaskQueueItem,
		from: TaskQueueType,
		fromQueue: TaskQueueItem[],
		to: TaskQueueType,
		toQueue: TaskQueueItem[]
	) {
		// 已经在目标队列里边了
		for (let toItem of toQueue) {
			if (toItem.getId() === item.getId()) {
				return;
			}
		}

		for (let i = 0; i < fromQueue.length; i++) {
			if (fromQueue[i].getId() === item.getId()) {
				// 执行一些操作
				fromQueue.splice(i, 1);
				toQueue.push(item);

				switch (from) {
					case TaskQueueType.Active:
						item.pause();
						break;

					case TaskQueueType.Waiting:
					case TaskQueueType.Suspend:
						item.continue();
						this._runIfNeeded();
						break;
				}
				return;
			}
		}
	}

	getTaskItemByTaskId(taskId: string): TaskQueueItem | null {
		for (let task of this._activeQueue) {
			if (task.getId() === taskId) {
				return task;
			}
		}

		for (let task of this._waitingQueue) {
			if (task.getId() === taskId) {
				return task;
			}
		}

		for (let task of this._suspendQueue) {
			if (task.getId() === taskId) {
				return task;
			}
		}

		return null;
	}

	removeAndCancelItemById(taskId: string, type: TaskQueueType) {
		let task: TaskQueueItem | null = this.getTaskItemByTaskId(taskId);
		if (task) {
			return this.removeAndCancelItem(task, type);
		} else {
			return false;
		}
	}

	/**
	 * 删除子任务，如果是活动队列中的子任务，则会调用子任务的cancel方法
	 * @param {TaskQueueItem} item 子任务
	 * @param {TaskQueueType} type 子任务所在的队列
	 * @returns {void}
	 * @memberof TaskQueue
	 */
	removeAndCancelItem(item: TaskQueueItem, type: TaskQueueType): void {
		switch (type) {
			case TaskQueueType.Active:
				this._removeItem(item, this._activeQueue);
				item.cancel();
				break;

			case TaskQueueType.Waiting:
				this._removeItem(item, this._waitingQueue);
				break;

			case TaskQueueType.Suspend:
				this._removeItem(item, this._suspendQueue);
				break;

			default:
				break;
		}
	}

	/**
	 * 清空任务队列，如果为清空活动队列，则会循环调用子任务的cancel方法
	 * @param {TaskQueueType} type 队列类型
	 * @returns {void}
	 * @memberof TaskQueue
	 */
	clearAndCancelItems(type: TaskQueueType): void {
		switch (type) {
			case TaskQueueType.Active:
				// 取消
				for (let item of this._activeQueue) {
					item.cancel();
				}
				this._activeQueue = [];
				break;

			case TaskQueueType.Waiting:
				this._waitingQueue = [];
				break;

			case TaskQueueType.Suspend:
				this._suspendQueue = [];
				break;

			default:
				break;
		}
	}

	/**
	 * 暂停活动队列中的子任务
	 * @param {TaskQueueItem} item 子任务
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	pauseItem(item: TaskQueueItem): void {
		for (let i = 0; i < this._activeQueue.length; i++) {
			let exitItem = this._activeQueue[i];
			if (item.getId() && item.getId() === exitItem.getId()) {
				item.pause();
				this._activeQueue.splice(i, 1);
				this._suspendQueue.push(item);
			}
		}
	}

	pauseTaskById(taskId: string) {
		let task: TaskQueueItem | null = this.getTaskItemByTaskId(taskId);
		if (task) {
			this.switchToIfNeeded(task, TaskQueueType.Active, TaskQueueType.Suspend);
		}
	}

	activeTaskById(taskId: string) {
		let task: TaskQueueItem | null = this.getTaskItemByTaskId(taskId);
		if (task) {
			this.switchToIfNeeded(task, TaskQueueType.Suspend, TaskQueueType.Active);
		}
	}

	/**
	 * 清空所有的列队，并取消活动的子任务
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	clearAll(): void {
		this.clearAndCancelItems(TaskQueueType.Active);
		this.clearAndCancelItems(TaskQueueType.Waiting);
		this.clearAndCancelItems(TaskQueueType.Suspend);
	}

	/**
	 * 清空任务所占用的资源
	 * * 取消任务循环
	 * * 清空队列
	 * * 重置状态
	 * @returns {void}
	 * @memberof TaskQueue
	 */
	public cleanup(): void {
		this._stopRunloop();
		this.clearAll();
		this.reset();
	}

	/**
	 * 取消run loop
	 * @private
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	private _stopRunloop(): void {
		if (this._runloopHandle) {
			window.cancelAnimationFrame(this._runloopHandle);
			this._runloopHandle = 0;
		}
	}

	/**
	 * 重置参数
	 * @private
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	private reset(): void {
		this._maxParalleledCount =
			this._config && this._config['maxParalleledCount'] > 0
				? this._config['maxParalleledCount']
				: 1;
		this._activeQueue = [];
		this._waitingQueue = [];
		this._suspendQueue = [];

		this._startTimeStamp = 0;
	}

	/**
	 * 从队列中移除（仅仅移除）
	 * @private
	 * @param {TaskQueueItem} item 子任务
	 * @param {Array<TaskQueueItem>} list 队列
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	private _removeItem(
		item: TaskQueueItem,
		list: Array<TaskQueueItem>
	): boolean {
		for (let i = 0; i < list.length; i++) {
			let exitItem = list[i];
			if (exitItem.getId() === item.getId() && item.getId()) {
				list.splice(i, 1);
				console.log('移除成功');
				return true;
			}
		}

		return false;
	}

	/**
	 * 根据情况开开启run loop
	 * @private
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	private _runIfNeeded(): void {
		if (!this._runloopHandle) {
			this.run();
		}
	}

	/**
	 * 开始run loop
	 * @private
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	private run(): void {
		console.log('开始循环任务');
		window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
			this._runloop(timestamp);
		});
	}

	/**
	 * run loop的执行函数
	 * @private
	 * @param {DOMHighResTimeStamp} timestamp 时间戳，开始触发回调函数的当前时间 performance.now()
	 * @memberof TaskQueue
	 * @returns {void}
	 */
	private _runloop(timestamp: DOMHighResTimeStamp): void {
		if (!this._startTimeStamp) {
			this._startTimeStamp = timestamp;
		}
		// do something
		for (let i = this._activeQueue.length - 1; i >= 0; i--) {
			let item = this._activeQueue[i];
			if (item.isFinished() || item.isError()) {
				// 在子任务item成功/失败的时候，将其移除活动队列
				this._removeItem(item, this._activeQueue);
				break;
			}

			// 任务暂停了
			if (item.isSuspended()) {
				this.pauseItem(item);
			} else {
				if (typeof item.step === 'function') {
					item.step(timestamp - this._startTimeStamp);
				}
			}
		}

		// 判断等待队列是否有数据
		while (
			this._activeQueue.length < this._maxParalleledCount &&
			this._waitingQueue.length > 0
		) {
			let items = this._waitingQueue.splice(0, 1);
			this._activeQueue.push(items[0]);
			// NOTE: 这儿移过来的，可能没有调用过start
			items[0].continue();
			if (typeof items[0].step === 'function') {
				items[0].step(timestamp - this._startTimeStamp);
			}
		}

		// 重新设置
		this._startTimeStamp = timestamp;

		if (this._activeQueue.length > 0) {
			// forever
			window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
				this._runloop(timestamp);
			});
		} else {
			console.log('结束循环');
			this._stopRunloop();
		}
	}
}

export default TaskQueue;
