'use strict';

import { SWITCH_VISUALIZATION, switchVisualization } from '../actions.jsx';

describe( 'switchVisualization', function() {
  it( 'should generate an action holding the visualization to switch to', function() {

    const action = switchVisualization( 'MY_VIS' );
    expect( action ).toEqual( {
      type: SWITCH_VISUALIZATION,
      id: 'MY_VIS'
    } );
  } );
} );
