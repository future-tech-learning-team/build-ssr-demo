
import { createStore, combineReducers, compose, applyMiddleware, } from 'redux';
import thunk from 'redux-thunk';

export default (reducers) => {
    return createStore(combineReducers(reducers), compose(
        applyMiddleware(thunk),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));
};
