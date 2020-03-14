import { throttle } from '../src/throttle';

jest.useFakeTimers();

let callback = jest.fn();
let newFunction = throttle(callback, 1 * 1000);

test('throttle test', () => {
	newFunction();
	expect(callback).toBeCalled();

	newFunction();
	newFunction();
	newFunction();
	newFunction();

	setTimeout(() => {
		newFunction();
	}, 2 * 1000);

	// Fast-forward until all timers have been executed
	jest.runAllTimers();

	expect(callback).toHaveBeenCalledTimes(3);
});
