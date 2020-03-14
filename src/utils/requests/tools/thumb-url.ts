export enum EThumbFlag {
	Thumb100x100 = '_100x100',
	Thumb200x200 = '_200x200',
	Thumb280x140 = '_280x140',
	Thumb140x280 = '_140x280',
	Thumb560x280 = '_560x280',
	Thumb280x560 = '_280x560',

	Thumb200x160 = '_200x160'
}

/**
 * 给图片地址添加缩略图的标志
 * @export
 * @param {string} path 图片地址
 * @param {EThumbFlag} [flag=EThumbFlag.Thumb100x100] 缩略图配置
 * @returns {string} 带缩略图信息的图片地址
 */
export function addThumbFlagToImageUrlIfNeeded(
	path: string = '',
	flag: EThumbFlag = EThumbFlag.Thumb100x100
): string {
	// console.log('zml path',path);
	if (path) {
		if (path.match(/^data:image/)) {
			return path;
		} else {
			let exec = path.match(/(.png|.jpg|.jpeg|.gif)$/);
			if (exec) {
				// 找到了
				let substring = path.substr(0, exec.index);
				return `${substring}${flag}${exec[0]}`;
			} else {
				return `${path}${flag}`;
			}
		}
	} else {
		return '';
	}
	// if (path && path.match(/^data:image/)) {
	// 	return path;
	// } else {
	// 	// return `${path}${flag}`;
	// 	// 删除后缀名
	// 	let exec = path.match(/(.png|.jpg|.jpeg|.gif)$/);
	// 	if (exec) {
	// 		// 找到了
	// 		let substring = path.substr(0, exec.index);
	// 		return `${substring}${flag}${exec[0]}`;
	// 	} else {
	// 		return `${path}${flag}`;
	// 	}
	// }
}
