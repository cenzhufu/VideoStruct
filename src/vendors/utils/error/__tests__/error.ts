import IFError from '../index';

test('valid custom error type', () => {
	let error = new IFError('000');
	expect(error instanceof Error).toBe(true);
});
