'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    // an issue for highlighting its commits was changed
    SET_SELECTED_ISSUE: (state, action) => {
      return _.assign({}, state, { selectedIssue: action.payload });
    },

    // an issue for highlighting its commits was changed
    SET_ISSUE_SELECTOR: (state, action) => {
      return _.assign({}, state, { issueSelector: action.payload });
    },

    // an issue for highlighting its commits was changed
    SET_ISSUE_FOR_FILTER: (state, action) => {
      return _.assign({}, state, { issueForFilter: action.payload });
    },

    // a color of a project was changed via a ColorPicker
    SET_COLOR: (state, action) => {
      let colorFromKey = {
        color: {},
      };
      colorFromKey.color[`${action.payload.key}`] = action.payload.color;
      return _.merge({}, state, colorFromKey);
    },

    // a (new) project/fork was selected
    SET_OTHER_PROJECT: (state, action) => {
      return _.assign({}, state, { otherProject: action.payload });
    },

    // adds/removes a branch of the base project to/from the excluded branches list
    SWITCH_EXCLUDED_BRANCHES_BASE_PROJECT: (state, action) => {
      let excludedBranchesBaseProject = _.assign([], state.excludedBranchesBaseProject);
      if (!action.payload.checked) {
        excludedBranchesBaseProject.push(action.payload.branchName);
      } else {
        excludedBranchesBaseProject = excludedBranchesBaseProject.filter(
          (branch) => branch !== action.payload.branchName
        );
      }
      return _.assign({}, state, {
        showAllBranchesBaseProjectChecked: excludedBranchesBaseProject.length === 0,
        excludedBranchesBaseProject,
      });
    },

    // adds/removes a branch of the other project to/from the excluded branches list
    SWITCH_EXCLUDED_BRANCHES_OTHER_PROJECT: (state, action) => {
      let excludedBranchesOtherProject = state.excludedBranchesOtherProject;
      if (!action.payload.checked) {
        excludedBranchesOtherProject.push(action.payload.branchName);
      } else {
        excludedBranchesOtherProject = excludedBranchesOtherProject.filter(
          (branch) => branch !== action.payload.branchName
        );
      }
      return _.assign({}, state, {
        showAllBranchesOtherProjectChecked: excludedBranchesOtherProject.length === 0,
        excludedBranchesOtherProject,
      });
    },

    // switches the checked property of the show all branches checkbox for the base project
    // and sets the excluded branches of the base project accordingly
    SWITCH_SHOW_ALL_BRANCHES_BASE_PROJECT: (state, action) => {
      let excludedBranchesBaseProject;
      // all branches of the base should be excluded in the graph
      if (!action.payload.isChecked) {
        excludedBranchesBaseProject = _.assign(
          [],
          action.payload.branches.map((branch) => branch.branchName)
        );
      } else {
        // all branches of the base project should be shown in the graph
        excludedBranchesBaseProject = [];
      }
      return _.assign({}, state, {
        showAllBranchesBaseProjectChecked: action.payload.isChecked,
        excludedBranchesBaseProject,
      });
    },

    // switches the checked property of the show all branches checkbox for the other project
    // and sets the excluded branches of the other project accordingly
    SWITCH_SHOW_ALL_BRANCHES_OTHER_PROJECT: (state, action) => {
      let excludedBranchesOtherProject;
      // all branches of the other project should be excluded in the graph
      if (!action.payload.isChecked) {
        excludedBranchesOtherProject = _.assign(
          [],
          action.payload.branches.map((branch) => branch.branchName)
        );
      } else {
        // all branches of the base project should be shown in the graph
        excludedBranchesOtherProject = [];
      }
      return _.assign({}, state, {
        showAllBranchesOtherProjectChecked: action.payload.isChecked,
        excludedBranchesOtherProject,
      });
    },

    // updates the filterBeforeDate element
    SET_FILTER_BEFORE_DATE: (state, action) => {
      return _.assign({}, state, { filterBeforeDate: action.payload });
    },

    // updates the filterAfterDate element
    SET_FILTER_AFTER_DATE: (state, action) => {
      return _.assign({}, state, { filterAfterDate: action.payload });
    },

    // updates the filterAuthor element
    SET_FILTER_AUTHOR: (state, action) => {
      return _.assign({}, state, { filterAuthor: action.payload });
    },

    // updates the filterCommitter element
    SET_FILTER_COMMITTER: (state, action) => {
      return _.assign({}, state, { filterCommitter: action.payload });
    },

    // updates the filterSubtree element
    SET_FILTER_SUBTREE: (state, action) => {
      return _.assign({}, state, { filterSubtree: action.payload });
    },
  },
  {
    color: {
      baseProject: '#F17013',
      otherProject: '#0155FE',
      combined: '#188E01',
    },
    issueSelector: 'text',
    excludedBranchesBaseProject: [],
    excludedBranchesOtherProject: [],
    showAllBranchesBaseProjectChecked: true,
    showAllBranchesOtherProjectChecked: true,
    filterAfterDate: {
      date: undefined,
      show: true,
    },
    filterBeforeDate: {
      date: undefined,
      show: true,
    },
    filterAuthor: {
      author: '',
      show: true,
    },
    filterCommitter: {
      committer: '',
      show: true,
    },
    filterSubtree: {
      subtree: undefined,
      show: true,
    },
  }
);
