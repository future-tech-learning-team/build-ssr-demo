

import React, { Component } from 'react';

export default () => {
    class EntryWrapper extends Component {

        render() {
            const {
                children,
            } = this.props;

            return children;
        }

    }

    return EntryWrapper;
};
