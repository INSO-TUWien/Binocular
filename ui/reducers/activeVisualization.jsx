'use strict';

import { SWITCH_VISUALIZATION, switchVisualization } from '../actions.jsx';
import { handleAction } from 'redux-actions';

export default handleAction( 'SWITCH_VISUALIZATION', function( state, action ) {
  return action.payload;
}, {} );
