import { debounce } from '../src/debounce';

jest.useFakeTimers();

const callback = jest.fn();
let newFunc = debounce(callback, 300);

test('debounce test', () => {
	newFunc();
	newFunc();
	newFunc();
	newFunc();
	newFunc();
	newFunc();
	newFunc();

	setTimeout(newFunc, 200);

	// At this point in time, the callback should not have been called yet
	expect(callback).not.toBeCalled();

	// Fast-forward until all timers have been executed
	jest.runAllTimers();

	// Now our callback should have been called!
	expect(callback).toBeCalled();
	expect(callback).toHaveBeenCalledTimes(1);
});
