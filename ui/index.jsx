'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './components/hello-world.jsx';

const mountingPoint = document.createElement( 'div' );
mountingPoint.className = 'react-app';
window.onload = function() {
  document.body.appendChild( mountingPoint );

  ReactDOM.render( <HelloWorld/>, mountingPoint );
};
