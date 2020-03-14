// 数据源类型
export enum ESourceType {
	Unknown = 'unknown', // 前端添加，未知
	All = 'all', // 前端添加（除了Unknown之外的类型)
	Camera = 'hikCamera', // 摄像头
	Video = 'videoFile', // 视频
	Zip = 'zipFile' // 压缩包
	// Pictural = 'imageFile', // 图片(暂没有用到)
	// LiveVideo = 'liveVideo', // (暂没有用到)
	// Box = 'box' // (暂没有用到)
}

/**
 * 获得有效的sourceType类型
 * @export
 * @param {ESourceType} sourceType sourceType
 * @returns {ESourceType} 有效的sourceType
 */
export function getValidSourceType(sourceType: ESourceType): ESourceType {
	if (!sourceType) {
		return ESourceType.Unknown;
	}

	switch (sourceType) {
		// case ESourceType.Box:
		case ESourceType.Camera:
		case ESourceType.Video:
		case ESourceType.Zip:
			// case ESourceType.Pictural:
			// case ESourceType.LiveVideo:
			return sourceType;

		default:
			return ESourceType.Unknown;
	}
}
