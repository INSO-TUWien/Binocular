'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
import { getContext } from '../utils/context';
const ctx = getContext();
const defaultConfig = {
  chartResolution: 'months',
  chartTimeSpan: { from: undefined, to: undefined },
  selectedAuthorsGlobal: [],
  mergedAuthors: [],
  otherAuthors: [],
  initialized: false,
  excludeMergeRequests: false,
};
export default handleActions(
  {
    SET_RESOLUTION: (state, action) => {
      updateLocalStorage('chartResolution', action.payload);
      return _.assign({}, state, { chartResolution: action.payload });
    },
    SET_TIME_SPAN: (state, action) => {
      updateLocalStorage('chartTimeSpan', action.payload);
      return _.assign({}, state, { chartTimeSpan: action.payload });
    },
    SET_SELECTED_AUTHORS_GLOBAL: (state, action) => {
      updateLocalStorage('selectedAuthorsGlobal', action.payload);
      return _.assign({}, state, { selectedAuthorsGlobal: action.payload });
    },
    SET_All_AUTHORS: (state, action) => {
      return _.assign({}, state, { allAuthors: action.payload });
    },
    SET_MERGED_AUTHOR_LIST: (state, action) => {
      const config = updateLocalStorage('mergedAuthors', action.payload);
      return _.assign({}, state, { mergedAuthors: config.mergedAuthors, selectedAuthorsGlobal: config.selectedAuthorsGlobal });
    },
    SET_OTHER_AUTHOR_LIST: (state, action) => {
      updateLocalStorage('otherAuthors', action.payload);
      return _.assign({}, state, { otherAuthors: action.payload });
    },
    SET_EXCLUDE_MERGE_COMMITS: (state, action) => {
      updateLocalStorage('excludeMergeCommits', action.payload);
      return _.assign({}, state, { excludeMergeCommits: action.payload });
    },
    REQUEST_UNIVERSAL_SETTINGS_DATA: (state) =>
      _.assign({}, state, { universalSettingsData: { data: {}, lastFetched: null, isFetching: true } }),
    RECEIVE_UNIVERSAL_SETTINGS_DATA: (state, action) => {
      return _.assign({}, state, {
        universalSettingsData: {
          data: action.payload,
          isFetching: false,
          receivedAt: action.meta.receivedAt,
        },
      });
    },
  },
  {
    universalSettingsData: { data: {}, lastFetched: null, isFetching: null },
    chartResolution: getLocalStorage().chartResolution,
    chartTimeSpan: getLocalStorage().chartTimeSpan,
    selectedAuthorsGlobal: getLocalStorage().selectedAuthorsGlobal,
    allAuthors: [],
    mergedAuthors: getLocalStorage().mergedAuthors,
    otherAuthors: getLocalStorage().otherAuthors,
    excludeMergeCommits: getLocalStorage().excludeMergeCommits,
  }
);

function updateLocalStorage(key, value) {
  let currConfig = {};
  if (localStorage.getItem(ctx.repo.name + '-UniversalSettings') === null) {
    currConfig = defaultConfig;
  } else {
    try {
      currConfig = JSON.parse(localStorage.getItem(ctx.repo.name + '-UniversalSettings'));
    } catch (e) {
      currConfig = defaultConfig;
    }
  }

  currConfig[key] = value;
  if (currConfig.mergedAuthors.length > 0 && (currConfig.initialized === undefined || currConfig.initialized === false)) {
    selectAllAuthors(currConfig);
    currConfig.initialized = true;
  }

  localStorage.setItem(ctx.repo.name + '-UniversalSettings', JSON.stringify(currConfig));
  return currConfig;
}

function getLocalStorage() {
  let currConfig = {};
  if (localStorage.getItem(ctx.repo.name + '-UniversalSettings') === null) {
    currConfig = defaultConfig;
  } else {
    try {
      currConfig = JSON.parse(localStorage.getItem(ctx.repo.name + '-UniversalSettings'));
      if (currConfig.initialized === undefined || currConfig.initialized === false) {
        selectAllAuthors(currConfig);
        currConfig.initialized = true;
      }
    } catch (e) {
      currConfig = defaultConfig;
    }
  }

  return currConfig;
}

function selectAllAuthors(config) {
  config.selectedAuthorsGlobal = config.mergedAuthors.map((mergedAuthor) => mergedAuthor.mainCommitter);
}
