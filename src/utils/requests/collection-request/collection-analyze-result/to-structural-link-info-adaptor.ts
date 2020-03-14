import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { IFStructuralLinkInfo } from 'stsrc/type-define';
import { toStructuralInfoFromAnalysisResult } from './to-structural-info-adaptor';
import { IBAnalysisResultLinkInfo, IBAnalysisResultInfo } from './types/outer';

export function toStructuralLinkInfoFromBLinkInfo(
	bLinkInfo: IBAnalysisResultLinkInfo
) {
	let faces: Array<IBAnalysisResultInfo> = ValidateTool.getValidArray(
		bLinkInfo.faces
	);
	let bodies: Array<IBAnalysisResultInfo> = ValidateTool.getValidArray(
		bLinkInfo.bodies
	);
	let cars: Array<IBAnalysisResultInfo> = ValidateTool.getValidArray(
		bLinkInfo.cars
	);

	let uuid: string = `${(faces.length > 0 && faces[0]._id) ||
		'face-id'}_${(bodies.length > 0 && bodies[0]._id) ||
		'body-id'}_${(cars.length > 0 && cars[0]._id) || 'car-id'}`;

	let result: IFStructuralLinkInfo = {
		uuid: uuid + '_analysis',
		// face: item.face
		// 	? toStructuralInfoFromAnalysisResult(item.face)
		// 	: undefined,
		face:
			faces.length > 0
				? toStructuralInfoFromAnalysisResult(faces[0])
				: undefined,
		body:
			bodies.length > 0
				? toStructuralInfoFromAnalysisResult(bodies[0])
				: undefined,
		vehicle:
			cars.length > 0 ? toStructuralInfoFromAnalysisResult(cars[0]) : undefined,

		faces: faces.map((item: IBAnalysisResultInfo) => {
			return toStructuralInfoFromAnalysisResult(item);
		}),
		bodies: bodies.map((item: IBAnalysisResultInfo) => {
			return toStructuralInfoFromAnalysisResult(item);
		}),
		vehicles: cars.map((item: IBAnalysisResultInfo) => {
			return toStructuralInfoFromAnalysisResult(item);
		})
	};

	return result;
}
