'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COMMIT_BOX_WIDTH: (state, action) => _.assign({}, state, { commitBoxWidth: action.payload }),
    SET_COMMIT_BOX_HEIGHT: (state, action) => _.assign({}, state, { commitBoxHeight: action.payload }),
    SET_COMMIT_BOX_COLOR: (state, action) => _.assign({}, state, { commitBoxColor: action.payload }),
    SET_SELECTED_AUTHORS: (state, action) => _.assign({}, state, { selectedAuthors: [...action.payload] }),
    SET_SELECTED_BRANCHES: (state, action) => _.assign({}, state, { selectedBranches: [...action.payload] }),
    SET_SHOW_COMMIT_DATE: (state, action) => _.assign({}, state, { showCommitDate: action.payload }),
    SET_SHOW_COMMIT_MESSAGE: (state, action) => _.assign({}, state, { showCommitMessage: action.payload }),
    SET_SHOW_COMMIT_AUTHOR: (state, action) => _.assign({}, state, { showCommitAuthor: action.payload }),
    SET_SHOW_COMMIT_FILES: (state, action) => _.assign({}, state, { showCommitFiles: action.payload })
  },
  {
    commitBoxWidth: 200,
    commitBoxHeight: 200,
    commitBoxColor: 'author',
    selectedAuthors: [],
    selectedBranches: [],
    showCommitDate: true,
    showCommitMessage: 'header',
    showCommitAuthor: false,
    showCommitFiles: true
  }
);
