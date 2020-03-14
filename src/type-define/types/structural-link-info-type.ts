import { IFStructuralInfo } from './structural-info-type';
import { ESourceType, getValidSourceType } from './source-type';

/**
 * 关联的结构化类型
 * @export
 * @interface IFStructuralLinkInfo
 */
export interface IFStructuralLinkInfo {
	uuid: string;
	// 二期重新赋予定义
	// 取自faces/bodies/vehicles的第一个数据
	face?: IFStructuralInfo;
	body?: IFStructuralInfo;
	vehicle?: IFStructuralInfo; // 车辆属性

	// 二期添加
	faces: Array<IFStructuralInfo>;
	bodies: Array<IFStructuralInfo>;
	vehicles: Array<IFStructuralInfo>;
}

export function getStructuralLinkInfoSourceType(
	item: IFStructuralLinkInfo
): ESourceType {
	for (let faceItem of item.faces) {
		return getValidSourceType(faceItem.sourceType);
	}
	for (let bodyItem of item.bodies) {
		return getValidSourceType(bodyItem.sourceType);
	}
	for (let carItem of item.vehicles) {
		return getValidSourceType(carItem.sourceType);
	}

	return ESourceType.Unknown;
}

export function getStructuralLinkInfoSourceId(
	item: IFStructuralLinkInfo
): string {
	for (let faceItem of item.faces) {
		return faceItem.sourceId;
	}
	for (let bodyItem of item.bodies) {
		return bodyItem.sourceId;
	}
	for (let carItem of item.vehicles) {
		return carItem.sourceId;
	}

	return '';
}
