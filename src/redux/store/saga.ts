// import { SearchResultPageActionsCreator } from 'src/pages/Search/views/search-result-page';
// import { put, takeEvery } from 'redux-saga/effects';
// import { AttributeFilterPanelActionCreators } from 'stsrc/components/attribute-filter-panel';
// import { Action } from 'redux';

// ...

// Our worker Saga: 将执行异步的 increment 任务
// export function* updateEndDateIfNeeded() {
// 	let action: Action = AttributeFilterPanelActionCreators.updateTodayEndTimeIfNeeded();
// 	yield put(action);
// }

// // Our watcher Saga: 在每个 INCREMENT_ASYNC action spawn 一个新的 incrementAsync 任务
// export function* watchSearchRangeUpdate() {
// 	let action: Action = SearchResultPageActionsCreator.updateSearchRange([]);
// 	yield takeEvery(action.type, updateEndDateIfNeeded);
// }
