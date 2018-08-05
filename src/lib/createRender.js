
import 'babel-polyfill';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import createStore from './createStore';
import './reset.css'

export default (appName, actions, reducers, EntryWrapper) => {

    const store = createStore(reducers);

    const renderWithEntry = (Entry) => {
        return render(
            <AppContainer>
                <Provider store={store}>
                    {
                        React.createElement(EntryWrapper, {}, <Entry />)
                    }
                </Provider>
            </AppContainer>,
            document.getElementById(appName)
        );
    };

    const createdRender = (Entry) => {
        renderWithEntry(Entry);
    };

    createdRender.renderWithEntry = renderWithEntry;
    createdRender.store = store;

    return createdRender;

}
