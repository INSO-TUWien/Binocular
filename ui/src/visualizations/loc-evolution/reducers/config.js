'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COMMIT_ATTRIBUTE: (state, action) => _.assign({}, state, { commitAttribute: action.payload }),
    SET_HIGHLIGHTED_FOLDER: (state, action) => _.assign({}, state, { highlightedFolder: action.payload }),
    SET_FILTERED_FILES: (state, action) => _.assign({}, state, { filteredFiles: action.payload }),

},
  {
    highlightedFolder: "ui/src/visualizations/loc-evolution/chart/",
    commitAttribute: '',
    filteredFiles: []
  }
);
