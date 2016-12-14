'use strict';

import { SWITCH_VISUALIZATION, switchVisualization } from '../actions.jsx';

const activeVisualization = (state = {}, action) => {
  if( action.type !== SWITCH_VISUALIZATION ) {
    return state;
  }

  return action.id;
};

export default activeVisualization;
