// 结构化数据的类型
export enum ETargetType {
	Unknown = 'unknown', // 前端添加, 未知类型
	All = '', // 前端添加，只用于某些过滤条件中
	Face = 'face', // 人脸
	Body = 'body', //  人体
	Handbag = 'handbag', // 箱包，目前跟人体同时出现(属于人体属性)
	Vehicle = 'car' // 确认这个字段
}

/**
 * 获得有效的targetType
 * @export
 * @param {ETargetType} targetType ETargetType
 * @returns {ETargetType} 有效的TargetType
 */
export function getValidTargetType(targetType: ETargetType): ETargetType {
	if (!targetType) {
		return ETargetType.Unknown;
	}

	switch (targetType) {
		case ETargetType.Face:
		case ETargetType.Body:
		case ETargetType.Handbag:
		case ETargetType.Vehicle:
			return targetType;

		default:
			return ETargetType.Unknown;
	}
}
