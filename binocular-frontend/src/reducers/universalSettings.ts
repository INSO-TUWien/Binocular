'use strict';

import { handleActions, Action } from 'redux-actions';
import * as _ from 'lodash';
import { getContext } from '../utils/context';
import { UniversalSettings } from '../types/unversalSettingsTypes';
import { Author } from '../types/authorTypes';

const ctx = getContext();
const defaultConfig: UniversalSettings = {
  chartResolution: 'months',
  chartTimeSpan: { from: undefined, to: undefined },
  selectedAuthorsGlobal: [],
  mergedAuthors: [],
  otherAuthors: [],
  sprints: [],
  initialized: false,
  excludeMergeCommits: false,
};
export default handleActions(
  {
    SET_RESOLUTION: (state, action: Action<any>) => {
      updateLocalStorage('chartResolution', action.payload);
      return _.assign({}, state, { chartResolution: action.payload });
    },
    SET_TIME_SPAN: (state, action: Action<any>) => {
      updateLocalStorage('chartTimeSpan', action.payload);
      return _.assign({}, state, { chartTimeSpan: action.payload });
    },
    SET_SELECTED_AUTHORS_GLOBAL: (state, action: Action<any>) => {
      updateLocalStorage('selectedAuthorsGlobal', action.payload);
      return _.assign({}, state, { selectedAuthorsGlobal: action.payload });
    },
    SET_All_AUTHORS: (state, action: Action<any>) => {
      return _.assign({}, state, { allAuthors: action.payload });
    },
    SET_MERGED_AUTHOR_LIST: (state, action: Action<any>) => {
      const config: UniversalSettings = updateLocalStorage('mergedAuthors', action.payload);
      return _.assign({}, state, { mergedAuthors: action.payload, selectedAuthorsGlobal: config.selectedAuthorsGlobal });
    },
    SET_OTHER_AUTHOR_LIST: (state, action: Action<any>) => {
      updateLocalStorage('otherAuthors', action.payload);
      return _.assign({}, state, { otherAuthors: action.payload });
    },
    SET_EXCLUDE_MERGE_COMMITS: (state, action: Action<any>) => {
      updateLocalStorage('excludeMergeCommits', action.payload);
      return _.assign({}, state, { excludeMergeCommits: action.payload });
    },
    SET_SPRINTS: (state, action: Action<any>) => {
      updateLocalStorage('sprints', action.payload);
      return _.assign({}, state, { sprints: action.payload });
    },
    REQUEST_UNIVERSAL_SETTINGS_DATA: (state) =>
      _.assign({}, state, { universalSettingsData: { data: {}, lastFetched: null, isFetching: true } }),
    RECEIVE_UNIVERSAL_SETTINGS_DATA: (state, action: any) => {
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
    sprints: getLocalStorage().sprints,
  },
);

function updateLocalStorage(key: string, value: any): UniversalSettings {
  let currConfig: UniversalSettings;
  if (localStorage.getItem(ctx.repo.name + '-UniversalSettings') === null) {
    currConfig = defaultConfig;
  } else {
    try {
      currConfig = JSON.parse(<string>localStorage.getItem(ctx.repo.name + '-UniversalSettings'));
    } catch (e) {
      currConfig = defaultConfig;
    }
  }

  (currConfig[key as keyof UniversalSettings] as any) = value;
  if (currConfig.mergedAuthors.length > 0 && (currConfig.initialized === undefined || currConfig.initialized === false)) {
    selectAllAuthors(currConfig);
    currConfig.initialized = true;
  }

  localStorage.setItem(ctx.repo.name + '-UniversalSettings', JSON.stringify(currConfig));
  return currConfig;
}

function getLocalStorage(): UniversalSettings {
  let currConfig: UniversalSettings;
  if (localStorage.getItem(ctx.repo.name + '-UniversalSettings') === null) {
    currConfig = defaultConfig;
  } else {
    try {
      currConfig = JSON.parse(<string>localStorage.getItem(ctx.repo.name + '-UniversalSettings'));
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

function selectAllAuthors(config: UniversalSettings) {
  config.selectedAuthorsGlobal = config.mergedAuthors.map((mergedAuthor: Author) => mergedAuthor.mainCommitter);
}
