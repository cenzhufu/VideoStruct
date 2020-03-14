import { IFAnalysisSourceDetailInfo } from 'stsrc/utils/requests/collection-request';
import { TypeValidate } from 'ifutils/validate-tool';
import * as Loadable from 'react-loadable';
import LoadingComponent from 'stcomponents/loading-component';
import { IFStructuralInfo } from 'sttypedefine';

import SearchResultPageActionsCreator from './src/redux/actions/search-result-page.actions';

let config: Loadable.OptionsWithoutRender<any> = {
	loader: async function loader() {
		let result = await import(/* webpackChunkName: "search-result-page" */
		'./src/SearchResultPage');
		return result;
	},
	loading: LoadingComponent
};

export default Loadable(config);

// NOTE: 将search-result作为异步加载之后，导出的模块跟SearchResult也不一样，之前直接使用的静态方法也不能使用了
// NOTE: 折中方法
const _structural_info_memo_key = 'SearchResultPage_structural_memo_key';
const _strutural_info_range_key = '_strutural_info_range_key'; // 检索范围
/**
 * 保存结构化信息memo
 * @static
 * @memberof SearchUploadImagePanel
 * @param {IFStructuralInfo[]} structuralInfo 结构化的数据
 * @returns {void} void
 */
function saveStructuralInfoMemo(structuralInfo: IFStructuralInfo[]) {
	try {
		if (structuralInfo) {
			localStorage.setItem(
				_structural_info_memo_key,
				JSON.stringify(structuralInfo)
			);
		}
	} catch (error) {
		console.error(error);
	}
}

/**
 * 保存搜素所的范围
 * @static
 * @param {Array<IFAnalysisSourceDetailInfo>} list 范围
 * @returns {void}
 * @memberof SearchResultPage
 */
function saveSearchRangeMemo(list: Array<IFAnalysisSourceDetailInfo>) {
	try {
		if (TypeValidate.isExactArray(list)) {
			localStorage.setItem(_strutural_info_range_key, JSON.stringify(list));
		}
	} catch (error) {
		console.error(error);
	}
}

export {
	saveStructuralInfoMemo,
	saveSearchRangeMemo,
	SearchResultPageActionsCreator
};
