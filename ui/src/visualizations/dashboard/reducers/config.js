'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

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
  },
  {
    chartResolution: getLocalStorage().chartResolution,
    chartTimeSpan: getLocalStorage().chartTimeSpan,
    selectedAuthorsGlobal: getLocalStorage().selectedAuthorsGlobal,
    allAuthors: [],
  }
);

function updateLocalStorage(key, value) {
  let currConfig = {};
  if (localStorage.getItem('universalConfig') === null) {
    currConfig = {
      chartResolution: 'months',
      chartTimeSpan: { from: undefined, to: undefined },
      selectedAuthorsGlobal: [],
    };
  } else {
    currConfig = JSON.parse(localStorage.getItem('universalConfig'));
  }
  currConfig[key] = value;

  localStorage.setItem('universalConfig', JSON.stringify(currConfig));
}

function getLocalStorage() {
  let currConfig = {};
  if (localStorage.getItem('universalConfig') === null) {
    currConfig = {
      chartResolution: 'months',
      chartTimeSpan: { from: undefined, to: undefined },
      selectedAuthorsGlobal: [],
    };
  } else {
    currConfig = JSON.parse(localStorage.getItem('universalConfig'));
  }
  return currConfig;
}
