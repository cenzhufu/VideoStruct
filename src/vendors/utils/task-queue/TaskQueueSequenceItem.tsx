import { TaskQueueStepTask } from './TaskQueueStepItem';
import * as is from 'is';
import { TaskQueueItem } from './TaskQueue';

class TaskQueueSequenceItem extends TaskQueueStepTask {
	tasks: Array<TaskQueueItem>;
	totalTasks: number;
	currentIndex: number;

	constructor(...items: Array<TaskQueueItem>) {
		super();
		this.tasks = [];

		// 分组
		if (items.length >= 2) {
			let firstTask = items[0];
			for (let i = 1; i < items.length - 1; i++) {
				firstTask = new TaskQueueSequenceItem(firstTask, items[i]);
			}

			this.tasks.push(firstTask);
			this.tasks.push(items[items.length - 1]);
			this.totalTasks = 2;
		} else {
			this.tasks.push(items[0]);
			this.totalTasks = 1;
		}
	}

	async start(): Promise<void> {
		this.currentIndex = 0;
		if (this.totalTasks !== 0) {
			this.tasks[this.currentIndex].start();
		}
		return;
	}

	continue() {
		if (this.currentIndex === undefined || this.currentIndex === null) {
			this.start();
		}
	}

	retry() {
		if (this.totalTasks !== 0) {
			this.tasks[this.currentIndex].retry();
		}
	}

	cancel() {
		if (this.totalTasks !== 0) {
			this.tasks[this.currentIndex].cancel();
		}
	}

	pause() {
		if (this.totalTasks !== 0) {
			this.tasks[this.currentIndex].pause();
		}
	}

	isActive() {
		if (this.totalTasks) {
			return this.tasks[this.currentIndex].isActive();
		} else {
			return false;
		}
	}

	isError() {
		if (this.totalTasks) {
			return this.tasks[this.currentIndex].isError();
		} else {
			return false;
		}
	}

	isSuspended() {
		return this.isError();
	}

	isFinished() {
		if (this.totalTasks === 1) {
			return this.tasks[0].isFinished();
		} else if (this.totalTasks === 2) {
			return this.tasks[0].isFinished() && this.tasks[1].isFinished();
		} else {
			return true;
		}
	}

	step(timePastAfterLastCall: number) {
		if (this.totalTasks === 0) {
			// do nothing
		} else if (this.totalTasks === 2) {
			if (this.tasks[0].isFinished() && this.currentIndex === 0) {
				this.currentIndex = 1;
				this.tasks[1].start();
			}

			if (
				this.tasks[this.currentIndex].step &&
				is.function(this.tasks[this.currentIndex].step)
			) {
				this.tasks[this.currentIndex].step(timePastAfterLastCall);
			}
		} else if (this.totalTasks === 1) {
			if (this.tasks[0].step && is.function(this.tasks[0].step)) {
				this.tasks[0].step(timePastAfterLastCall);
			}
		}
	}
}

export default TaskQueueSequenceItem;
