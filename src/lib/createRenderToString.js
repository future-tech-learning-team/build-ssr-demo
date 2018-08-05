
import ReactDOMServer from 'react-dom/server';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import createStore from './createStore';
import './reset.css'

export default (appName, actions, reducers, EntryWrapper) => {

    const store = createStore(reducers);

    const renderWithEntry = (Entry) => {
        return ReactDOMServer.renderToString(
            React.createElement('div', {
                id: appName,
            }, <Provider store={store}>
                {
                    React.createElement(EntryWrapper, {}, <Entry />)
                }
            </Provider>),
        );
    };

    const createdRender = (Entry) => {
        renderWithEntry(Entry);
    };

    createdRender.renderWithEntry = renderWithEntry;
    createdRender.store = store;

    return createdRender;

}
