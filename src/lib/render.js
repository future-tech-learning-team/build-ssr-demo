
import { combineReducers } from 'redux';
import createRender from './createRender';

import EntryWrapper from './EntryWrapper';
import actions from '../actions';
import reducers from '../reducers';
import { name } from '../../package.json';

const render = createRender(name, actions, reducers, EntryWrapper());

if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
        const nextRootReducer = require('../reducers').default;     // eslint-disable-line global-require
        render.store.replaceReducer(combineReducers(nextRootReducer));
    });
}

export const renderWithEntry = render.renderWithEntry;

export default (Entry) => {
    return render(Entry);
};
