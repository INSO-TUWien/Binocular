'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import App from '../components/App';

export default class RootOffline extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidCatch(error, info) {
    console.log('error:', error, info);
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <Router>
          <App />
        </Router>
      </Provider>
    );
  }
}

RootOffline.propTypes = {
  store: PropTypes.object.isRequired,
};
