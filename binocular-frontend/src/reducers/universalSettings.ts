'use strict';

import { handleActions, Action } from 'redux-actions';
import * as _ from 'lodash';
import { UniversalSettings } from '../types/unversalSettingsTypes';
import { updateUniversalSettingsLocalStorage, getUniversalSettingsLocalStorage } from '../utils/localStorage.ts';
import { Author, Committer, Palette } from '../types/authorTypes.ts';

const defaultConfig: UniversalSettings = {
  chartResolution: 'months',
  chartTimeSpan: { from: undefined, to: undefined },
  selectedAuthorsGlobal: [],
  mergedAuthors: [],
  otherAuthors: [],
  sprints: [],
  initialized: false,
  excludeMergeCommits: false,
  excludedCommits: [],
  excludeCommits: false,
};

/**
 * If something changes with the structure of the Universal Settings, please update
 * the localStorage version number in src/utils/localStorage.ts
 **/
export default handleActions(
  {
    SET_RESOLUTION: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('chartResolution', action.payload, defaultConfig);
      return _.assign({}, state, { chartResolution: action.payload });
    },
    SET_TIME_SPAN: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('chartTimeSpan', action.payload, defaultConfig);
      return _.assign({}, state, { chartTimeSpan: action.payload });
    },
    SET_SELECTED_AUTHORS_GLOBAL: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('selectedAuthorsGlobal', action.payload, defaultConfig);
      return _.assign({}, state, { selectedAuthorsGlobal: action.payload });
    },
    SET_All_AUTHORS: (state, action: Action<any>) => {
      const mergedAndOtherAuthorsCount = sumMergedAndOtherAuthors(state.mergedAuthors, state.otherAuthors);
      const allAuthorCount = Object.keys(action.payload).length;
      if (mergedAndOtherAuthorsCount > 0 && mergedAndOtherAuthorsCount < allAuthorCount - 1) {
        console.log('Current localStorage does not align with the Author list loaded from the Database! New Authors will be added.');
        const missingAuthors = findMissingAuthors(action.payload, state.mergedAuthors, state.otherAuthors);
        state.mergedAuthors.push(...missingAuthors);
        const config: UniversalSettings = updateUniversalSettingsLocalStorage('mergedAuthors', state.mergedAuthors, defaultConfig);
      }
      return _.assign({}, state, { allAuthors: action.payload });
    },
    SET_MERGED_AUTHOR_LIST: (state, action: Action<any>) => {
      const config: UniversalSettings = updateUniversalSettingsLocalStorage('mergedAuthors', action.payload, defaultConfig);
      return _.assign({}, state, { mergedAuthors: action.payload, selectedAuthorsGlobal: config.selectedAuthorsGlobal });
    },
    SET_OTHER_AUTHOR_LIST: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('otherAuthors', action.payload, defaultConfig);
      return _.assign({}, state, { otherAuthors: action.payload });
    },
    SET_EXCLUDE_MERGE_COMMITS: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('excludeMergeCommits', action.payload, defaultConfig);
      return _.assign({}, state, { excludeMergeCommits: action.payload });
    },
    SET_EXCLUDED_COMMITS: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('excludedCommits', action.payload, defaultConfig);
      return _.assign({}, state, { excludedCommits: action.payload });
    },
    SET_EXCLUDE_COMMITS: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('excludeCommits', action.payload, defaultConfig);
      return _.assign({}, state, { excludeCommits: action.payload });
    },
    SET_SPRINTS: (state, action: Action<any>) => {
      updateUniversalSettingsLocalStorage('sprints', action.payload, defaultConfig);
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
    chartResolution: getUniversalSettingsLocalStorage(defaultConfig).chartResolution,
    chartTimeSpan: getUniversalSettingsLocalStorage(defaultConfig).chartTimeSpan,
    selectedAuthorsGlobal: getUniversalSettingsLocalStorage(defaultConfig).selectedAuthorsGlobal,
    allAuthors: [],
    mergedAuthors: getUniversalSettingsLocalStorage(defaultConfig).mergedAuthors,
    otherAuthors: getUniversalSettingsLocalStorage(defaultConfig).otherAuthors,
    excludeMergeCommits: getUniversalSettingsLocalStorage(defaultConfig).excludeMergeCommits,
    excludedCommits: getUniversalSettingsLocalStorage(defaultConfig).excludedCommits,
    excludeCommits: getUniversalSettingsLocalStorage(defaultConfig).excludeCommits,
    sprints: getUniversalSettingsLocalStorage(defaultConfig).sprints,
  },
);

function sumMergedAndOtherAuthors(mergedAuthors: Author[], otherAuthors: Committer[]) {
  let sum = otherAuthors.length;
  for (const author of mergedAuthors) {
    sum += author.committers.length;
  }
  return sum;
}

function findMissingAuthors(allAuthors: Palette, mergedAuthors: Author[], otherAuthors: Committer[]) {
  const missingAuthors: Author[] = [];
  for (const signature of Object.keys(allAuthors)) {
    missingAuthors.push({
      mainCommitter: signature,
      committers: [{ signature: signature, color: allAuthors[signature] }],
      color: allAuthors[signature],
    });
  }
  _.remove(missingAuthors, (a) => a.mainCommitter === 'other');

  for (const committer of otherAuthors) {
    if (missingAuthors.find((a) => a.mainCommitter === committer.signature)) {
      _.remove(missingAuthors, (a) => a.mainCommitter === committer.signature);
    }
  }

  for (const author of mergedAuthors) {
    for (const committer of author.committers) {
      if (missingAuthors.find((a) => a.mainCommitter === committer.signature)) {
        _.remove(missingAuthors, (a) => a.mainCommitter === committer.signature);
      }
    }
  }

  return missingAuthors;
}
