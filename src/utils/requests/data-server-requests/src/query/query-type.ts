import { FilterCondition } from './../util/filtration-condition';
import { IInCondition } from './../util/in-condition';
import { ILikeCondition } from '../util/like-condition';
import { EqualCondition } from '../util/equal-condion';

export interface IBDataQueryConditions {
	like?: Array<ILikeCondition>;
	eq?: Array<EqualCondition>;
	in?: IInCondition;
	filtration?: FilterCondition;
	pageParam?: {
		pageNo: number;
		pageSize: number;
		needTotal?: 0 | 1;
	};
	connector?: 'and' | 'or';
	orderBy?: { [key: string]: -1 | 1 };
	limit?: number;
	offset?: number;
}
