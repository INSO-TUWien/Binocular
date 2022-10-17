'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

// enum ISSUE_INFO {LOC = 'loc', TIME = 'time', CI_BUILDS = 'ciBuilds'}

export default handleActions(
  {
    MS_SET_ISSUE_INFORMATION: (state, action) => {
      return _.assign({}, state, { issueInfo: action.payload });
    },
    MS_SET_MILESTONE: (state, action) => {
      return _.assign({}, state, { milestone: action.payload });
    },
  },
  {
    issueInfo: 'loc',
    milestone: null,
    issues: ['-1-', '-2-'],
  }
);

function getAllFiles(issue) {
  const files = {};

  return null;
}
