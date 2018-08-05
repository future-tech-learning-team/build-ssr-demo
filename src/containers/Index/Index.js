

import React, { Component } from 'react';
import { connect } from 'react-redux';

import actions from '../../actions';

import '../../styles/common.css';

class Index extends Component {

    render() {

        return (
            <div className="ssr-container">
                ssr 内容
            </div>
        );
    }
}

export default connect((state) => ({

}), {

})(Index);
