'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_ISSUE: (state, action) =>
      _.assign({}, state, { activeIssueId: action.payload ? action.payload.iid : null }),

    SET_FILTERED_COMMITS: (state, action) =>
      _.assign({}, state, { filteredCommits: action.payload }),

    SET_FILTERED_FILES: (state, action) => _.assign({}, state, { filteredFiles: action.payload }),

    RECEIVE_ISSUE_IMPACT_DATA: (state, action) => {
      const files = action.payload.issue ? getAllFiles(action.payload.issue) : [];
      return _.assign({}, state, {
        filteredCommits: action.payload.issue ? action.payload.issue.commits.map(c => c.sha) : [],
        files,
        filteredFiles: files
      });
    }
  },
  { activeIssueId: 1, filteredCommits: [], files: [], filteredFiles: [] }
);

function getAllFiles(issue) {
  const files = {};

  _.each(issue.commits, c => {
    _.each(c.files, h => {
      files[h.file.id] = h.file.path;
    });
  });

  return _.values(files);
}
