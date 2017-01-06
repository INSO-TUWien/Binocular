'use strict';

import 'babel-polyfill';
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { render } from 'react-dom';
import App from './components/app.jsx';
import { Provider } from 'react-redux';
import app from './reducers';
import 'bulma';
import 'font-awesome/css/font-awesome.css';
import './global.scss';
import styleInject from 'style-inject';
import iconFont from 'icons-loader';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
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
    lastFetched: null
  }
}, applyMiddleware(thunk, logger) );

styleInject( iconFont.css );

window.onload = function() {
  document.body.appendChild( mountingPoint );

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    mountingPoint
  );
};


store.dispatch( fetchConfig() )
.then( function() {
  console.log( store.getState() );
} );
