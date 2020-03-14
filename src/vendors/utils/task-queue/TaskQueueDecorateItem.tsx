import { TaskQueueStepTask } from './TaskQueueStepItem';
import { TaskQueueItem } from './TaskQueue';
import { TaskQueueSequenceItem } from '.';

class TaskQueueDecorateItem implements TaskQueueItem {
	private _inner: TaskQueueStepTask;

	// constructor(...items: Array<TaskQueueStepTask>) {
	// 	// this._inner = new TaskQueueSequenceItem(...items);
	// }

	setTasks(...items: Array<TaskQueueItem>) {
		this._inner = new TaskQueueSequenceItem(...items);
	}

	getId() {
		return this._inner.getId();
	}

	isActive() {
		return this._inner.isActive();
	}

	isError() {
		return this._inner.isError();
	}

	isFinished() {
		return this._inner.isFinished();
	}

	isSuspended() {
		return this._inner.isSuspended();
	}

	start() {
		return this._inner.start();
	}

	pause() {
		this._inner.pause();
	}

	continue() {
		this._inner.continue();
	}

	retry() {
		this._inner.retry();
	}

	cancel() {
		this._inner.cancel();
	}

	step(timestamp: DOMHighResTimeStamp) {
		this._inner.step(timestamp);
	}
}

export default TaskQueueDecorateItem;
