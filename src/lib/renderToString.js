
import createRenderToString from './createRenderToString';

import EntryWrapper from './EntryWrapper';
import actions from '../actions';
import reducers from '../reducers';
import { name } from '../../package.json';

const renderToString = createRenderToString(name, actions, reducers, EntryWrapper());

export const renderToStringWithEntry = renderToString.renderWithEntry;

export default (Entry) => {
    return renderToStringWithEntry(Entry);
};
