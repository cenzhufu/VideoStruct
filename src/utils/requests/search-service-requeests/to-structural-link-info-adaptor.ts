import { NoLinkSearchResultDataType } from 'stsrc/utils/requests/search-service-requeests/types/_innter';
import { ValidateTool } from 'ifutils/validate-tool';
import { IFStructuralLinkInfo } from 'stsrc/type-define';
import { toStructuralInfoFromNoLinkResultType } from './to-structural-info-adaptor';
import { IBLinkSearchResultDataType } from './types/_innter';

export function toStructuralLinkInfoFromBLinkInfo(
	bLinkInfo: IBLinkSearchResultDataType
) {
	let faces: Array<NoLinkSearchResultDataType> = ValidateTool.getValidArray(
		bLinkInfo.faces
	);
	let bodies: Array<NoLinkSearchResultDataType> = ValidateTool.getValidArray(
		bLinkInfo.bodies
	);
	let cars: Array<NoLinkSearchResultDataType> = ValidateTool.getValidArray(
		bLinkInfo.cars
	);

	let uuid: string = `${(faces.length > 0 && faces[0].id) ||
		'face-id'}_${(bodies.length > 0 && bodies[0].id) ||
		'body-id'}_${(cars.length > 0 && cars[0].id) || 'car-id'}`;

	let result: IFStructuralLinkInfo = {
		uuid: uuid + '_search',
		face:
			faces.length > 0
				? toStructuralInfoFromNoLinkResultType(faces[0])
				: undefined,
		body:
			bodies.length > 0
				? toStructuralInfoFromNoLinkResultType(bodies[0])
				: undefined,
		vehicle:
			cars.length > 0
				? toStructuralInfoFromNoLinkResultType(cars[0])
				: undefined,
		faces: faces.map((item: NoLinkSearchResultDataType) => {
			return toStructuralInfoFromNoLinkResultType(item);
		}),
		bodies: bodies.map((item: NoLinkSearchResultDataType) => {
			return toStructuralInfoFromNoLinkResultType(item);
		}),
		vehicles: cars.map((item: NoLinkSearchResultDataType) => {
			return toStructuralInfoFromNoLinkResultType(item);
		})
	};

	return result;
}
