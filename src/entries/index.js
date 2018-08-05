
import render, { renderWithEntry } from '../lib/render';
import Index from '../containers/Index/Index';

render(Index);

if (module.hot) {
    module.hot.accept('../containers/Index/Index', () => {
        const NewEntry = require('../containers/Index/Index').default;   // eslint-disable-line global-require
        renderWithEntry(NewEntry);
    });
}
