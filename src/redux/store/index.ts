import { EventType } from 'stutils/event-emit';
// 局部 ---> 整体
// import createSagaMiddleware from 'redux-saga';
// #region redux
// import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';
import reduces from '../reduces';
import eventEmiiter from 'stsrc/utils/event-emit';
import { SearchResultPageActionsCreator } from 'stsrc/pages/Search/views/search-result-page';
import { FileUploadActionCreators } from 'stsrc/components/file-upload-analysis-panel';
import AttributeFilterPanelActionCreators from 'stsrc/components/attribute-filter-panel/src/redux/actions/attribute-filter-panel.actions';
// import { watchSearchRangeUpdate } from './saga';

// const sagaMiddleware = createSagaMiddleware();

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
	reduces,
	/* preloadedState, */ composeEnhancers(applyMiddleware(logger))
);

// sagaMiddleware.run(watchSearchRangeUpdate);

/* eslint-enable */

export default store;

// 接受一些
eventEmiiter.addListener(EventType.logout, () => {
	// 发出reset action
	store.dispatch(AttributeFilterPanelActionCreators.resetActionCreator());
	store.dispatch(SearchResultPageActionsCreator.resetActionCreator());
	store.dispatch(FileUploadActionCreators.resetActionCreator());
});

eventEmiiter.addListener(EventType.logIn, () => {
	// 发出reset action
	store.dispatch(AttributeFilterPanelActionCreators.resetToLatest());
	store.dispatch(SearchResultPageActionsCreator.resetToLatest());
});

//#endregion
