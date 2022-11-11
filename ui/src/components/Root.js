'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
          <Routes>
            <Route exact path="/" element={<App />} />
          </Routes>
        </Router>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
};
