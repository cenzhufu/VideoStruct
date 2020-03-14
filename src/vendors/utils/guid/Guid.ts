/**
 * 生成一个唯一id
 * @export
 * @returns {string} unique id
 */
export function guid(): string {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return (
		String(String(String(String(s4() + s4()) + s4()) + s4()) + s4()) +
		s4() +
		s4() +
		s4()
	);
}
