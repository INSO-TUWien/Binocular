'use strict';

import React from 'react';
import { createStore } from 'redux';
import { render } from 'react-dom';
import App from './components/app.jsx';
import { Provider } from 'react-redux';
import app from './reducers';
import 'bulma';

const mountingPoint = document.createElement( 'div' );
mountingPoint.className = 'react-app';

const store = createStore( app, {
  visualizations: [
    { id: 'ISSUE_IMPACT', label: 'Issue Impact' },
    { id: 'CODE_OWNERSHIP_RIVER', label: 'Code ownership river' },
    { id: 'HOTSPOT_DIALS', label: 'Hotspot Dials' }
  ],
  activeVisualization: 'ISSUE_IMPACT'
} );

window.onload = function() {
  document.body.appendChild( mountingPoint );

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    mountingPoint
  );
};
