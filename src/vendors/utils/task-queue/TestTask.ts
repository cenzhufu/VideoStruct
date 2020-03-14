import { TaskQueueStepTask } from './TaskQueueStepItem';

/**
 * md5任务
 * @class AnalysisTaskCreateStatus
 * @implements {TaskQueueItem}
 */
class TestTask1 extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	constructor() {
		super({
			update: 1 * 1000
		});

		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;
		console.log('test task 1 started');
		setTimeout(() => {
			this._isFinished = true;
			this._isActive = false;
			console.log('test task 1 finished');
		}, 1 * 1000);
	}

	pause() {
		//
	}

	continue() {
		this.pause();
		this.reset();
		this.start();
	}

	retry() {
		this.continue();
	}

	cancel() {
		this.pause();
	}

	isActive() {
		return this._isActive;
	}

	isError() {
		return this._isError;
	}

	isSuspended() {
		return this._isError;
	}

	isFinished() {
		return this._isFinished;
	}

	update(deltaTime: number) {
		// do nothing
	}
}

class TestTask2 extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	constructor() {
		super({
			update: 1 * 1000
		});

		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;
		console.log('test task 2 started');
		setTimeout(() => {
			this._isFinished = true;
			this._isActive = false;
			console.log('test task 2 finished');
		}, 2 * 1000);
	}

	pause() {
		//
	}

	continue() {
		this.pause();
		this.reset();
		this.start();
	}

	retry() {
		this.continue();
	}

	cancel() {
		this.pause();
	}

	isActive() {
		return this._isActive;
	}

	isError() {
		return this._isError;
	}

	isSuspended() {
		return this._isError;
	}

	isFinished() {
		return this._isFinished;
	}

	update(deltaTime: number) {
		// do nothing
	}
}

class TestTask3 extends TaskQueueStepTask {
	private _isActive: boolean;
	private _isError: boolean;
	private _isFinished: boolean;

	constructor() {
		super({
			update: 3 * 1000
		});

		this.reset();
	}

	reset() {
		this._isActive = false;
		this._isError = false;
		this._isFinished = false;
	}

	/************** 重载方法 ************************/

	async start(): Promise<void> {
		this._isActive = true;
		console.log('test task 3 started');
		setTimeout(() => {
			this._isFinished = true;
			this._isActive = false;
			console.log('test task 3 finished');
		}, 3 * 1000);
	}

	pause() {
		//
	}

	continue() {
		this.pause();
		this.reset();
		this.start();
	}

	retry() {
		this.continue();
	}

	cancel() {
		this.pause();
	}

	isActive() {
		return this._isActive;
	}

	isError() {
		return this._isError;
	}

	isSuspended() {
		return this._isError;
	}

	isFinished() {
		return this._isFinished;
	}

	update(deltaTime: number) {
		// do nothing
	}
}

export { TestTask1, TestTask2, TestTask3 };
