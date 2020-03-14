import {
	ETargetType,
	EMerge,
	IFStructuralInfo,
	DateFormat
} from 'sttypedefine';
import { getSearchMainType } from './get-main-search-type';
import { SearchOptions } from '../requests/search-service-requeests/search-request';

interface RequestOption {
	faceThreshold: number;
	bodyThreshold: number;
	faceResultMergeType: EMerge;
	bodyResultMergeType: EMerge;
	startDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	endDate: typeof DateFormat; // YYYY-MM-DD hh:mm:ss
	searchTargetList: IFStructuralInfo[];
	pageSize: number;
	page: number;
	targets: Array<ETargetType>;
	currentTargetType: ETargetType;
}

/**
 * 获得搜索请求的额外参数
 * @export
 * @param {RequestOption} options 参数
 * @returns {Partial<SearchOptions>} 请求参数
 */
export function getSearchRequestOption(
	options: RequestOption
): Partial<SearchOptions> {
	// 获得搜索的主
	let mainType: ETargetType = getSearchMainType(options.searchTargetList);

	let eMergetype =
		mainType === ETargetType.Face
			? options.faceResultMergeType
			: options.bodyResultMergeType;

	// let targets = this.props.searchTargetTypes;

	let threshold = 0;
	switch (mainType) {
		case ETargetType.Face:
			threshold = options.faceThreshold;
			break;

		case ETargetType.Body:
			threshold = options.bodyThreshold;
			break;

		default:
			break;
	}

	return {
		// page: options.pageSize === 1000 ? 1 : options.page,
		page: options.page,
		mergeType: eMergetype,
		pageSize: options.pageSize,
		showTypes: options.targets,
		startTime: options.startDate,
		endTime: options.endDate,
		threshold: Number(Number(threshold / 100).toFixed(2)),
		currentTargetType: options.currentTargetType
	};
}
