'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app.jsx';
import 'bulma';

const mountingPoint = document.createElement( 'div' );
mountingPoint.className = 'react-app';
window.onload = function() {
  document.body.appendChild( mountingPoint );

  ReactDOM.render( <App/>, mountingPoint );
};
