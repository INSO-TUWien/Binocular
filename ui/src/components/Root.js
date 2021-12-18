'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import App from '../components/App';

export default class Root extends React.Component {
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
          <Route exact path="/" component={App} />
        </Router>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
};
