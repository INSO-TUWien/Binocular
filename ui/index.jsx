'use strict';

import 'babel-polyfill';
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import styleInject from 'style-inject';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import 'bulma';
import 'font-awesome/css/font-awesome.css';

import App from './components/app.jsx';
import app from './reducers';
import './global.scss';
import actions, { fetchConfig } from './actions.jsx';

const mountingPoint = document.createElement( 'div' );
mountingPoint.className = 'react-app';

const logger = createLogger();

const store = createStore( app, {
  activeVisualization: 'ISSUE_IMPACT',
  visualizations: [
    { id: 'ISSUE_IMPACT', label: 'Issue Impact' },
    { id: 'CODE_OWNERSHIP_RIVER', label: 'Code ownership river' },
    { id: 'HOTSPOT_DIALS', label: 'Hotspot Dials' }
  ],
  config: {
    isFetching: false,
    lastFetched: null,
    isShown: true
  }
}, applyMiddleware(thunk, logger) );

window.onload = function() {
  document.body.appendChild( mountingPoint );

  render(
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path='/' component={App} />
      </Router>
    </Provider>,
    mountingPoint
  );
};


store.dispatch( fetchConfig() )
.then( function() {
  console.log( store.getState() );
} );
