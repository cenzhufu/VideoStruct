export function getvwInJS(
	size: number,
	variety: number = size / 2,
	designScreenWidth: number = 1920
): string {
	let vwContext = designScreenWidth * 0.01;
	let noVariety = size - variety;
	let vwResult = (size - noVariety) / vwContext;

	return `calc(${vwResult}vw + ${noVariety}px)`;
}

export function getvhInJS(
	size: number,
	variety: number = size / 2,
	designScreenHeight: number = 1080
): string {
	let vwContext = designScreenHeight * 0.01;
	let noVariety = size - variety;
	let vwResult = (size - noVariety) / vwContext;

	return `calc(${vwResult}vh + ${noVariety}px)`;
}

export function getvminInJS(
	size: number,
	variety: number = size / 2,
	designMinSize: number = 1080
): string {
	let vwContext = designMinSize * 0.01;
	let noVariety = size - variety;
	let vwResult = (size - noVariety) / vwContext;

	return `calc(${vwResult}vmin + ${noVariety}px)`;
}

export function getvmaxInJS(
	size: number,
	variety: number = size / 2,
	designMaxSize: number = 1920
): string {
	let vwContext = designMaxSize * 0.01;
	let noVariety = size - variety;
	let vwResult = (size - noVariety) / vwContext;

	return `calc(${vwResult}vmin + ${noVariety}px)`;
}
