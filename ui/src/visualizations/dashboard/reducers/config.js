'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
import { getContext } from './../../../utils/context';
const ctx = getContext();

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
      updateLocalStorage('mergedAuthors', action.payload);
      return _.assign({}, state, { mergedAuthors: action.payload });
    },
    SET_OTHER_AUTHOR_LIST: (state, action) => {
      updateLocalStorage('otherAuthors', action.payload);
      return _.assign({}, state, { otherAuthors: action.payload });
    },
  },
  {
    chartResolution: getLocalStorage().chartResolution,
    chartTimeSpan: getLocalStorage().chartTimeSpan,
    selectedAuthorsGlobal: getLocalStorage().selectedAuthorsGlobal,
    allAuthors: [],
    mergedAuthors: getLocalStorage().mergedAuthors,
    otherAuthors: getLocalStorage().otherAuthors,
  }
);

function updateLocalStorage(key, value) {
  let currConfig = {};
  if (localStorage.getItem(ctx.repo.name + '-universalConfig') === null) {
    currConfig = {
      chartResolution: 'months',
      chartTimeSpan: { from: undefined, to: undefined },
      selectedAuthorsGlobal: [],
      mergedAuthors: [],
      otherAuthors: [],
    };
  } else {
    currConfig = JSON.parse(localStorage.getItem(ctx.repo.name + '-universalConfig'));
  }
  currConfig[key] = value;

  localStorage.setItem(ctx.repo.name + '-universalConfig', JSON.stringify(currConfig));
}

function getLocalStorage() {
  let currConfig = {};
  if (localStorage.getItem(ctx.repo.name + '-universalConfig') === null) {
    currConfig = {
      chartResolution: 'months',
      chartTimeSpan: { from: undefined, to: undefined },
      selectedAuthorsGlobal: [],
      mergedAuthors: [],
      otherAuthors: [],
    };
  } else {
    currConfig = JSON.parse(localStorage.getItem(ctx.repo.name + '-universalConfig'));
  }
  return currConfig;
}
