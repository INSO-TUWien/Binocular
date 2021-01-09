'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import getCommitData from './getCommitData.js';
import getIssueData from './getIssueData.js';
import getBuildData from './getBuildData.js';
import getBounds from './getBounds.js';
import chroma from 'chroma-js';
import getLanguageData from './getLanguageData';
import getModuleData from './getModuleData';
import generateColorPattern from '../../../utils/colors';

export const setResolution = createAction('SET_LANGUAGE_MODULE_RIVER_RESOLUTION');
export const setShowIssues = createAction('SET_LANGUAGE_MODULE_RIVER_SHOW_ISSUES');
export const setSelectedAuthors = createAction('SET_LANGUAGE_MODULE_RIVER_SELECTED_AUTHORS');
export const setShowCIChart = createAction('SET_LANGUAGE_MODULE_RIVER_SHOW_CI');
export const setShowIssueChart = createAction('SET_LANGUAGE_MODULE_RIVER_SHOW_ISSUE');
export const setShowChangesChart = createAction('SET_LANGUAGE_MODULE_RIVER_SHOW_CHANGES_CHART');

export const requestLanguageModuleRiverData = createAction('REQUEST_LANGUAGE_MODULE_RIVER_DATA');
export const receiveLanguageModuleRiverData = timestampedActionFactory('RECEIVE_LANGUAGE_MODULE_RIVER_DATA');
export const receiveLanguageModuleRiverDataError = createAction('RECEIVE_LANGUAGE_MODULE_RIVER_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_LANGUAGE_MODULE_RIVER_VIEWPORT');

export default function*() {
  // fetch data once on entry
  yield* fetchLanguageModuleRiverData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchLanguageModuleRiverData);
}

/**
 * Fetch data for languageModuleRiver, this still includes old functions that were copied over.
 */
export const fetchLanguageModuleRiverData = fetchFactory(
  function*() {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.languageModuleRiver.state.config.viewport || [0, null];

    const firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    const lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);

    return yield Promise.join(
      getCommitData([firstSignificantTimestamp, lastSignificantTimestamp]),
      getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      getBuildData([firstSignificantTimestamp, lastSignificantTimestamp]),
      getLanguageData(),
      getModuleData()
    )
      .spread((commits, issues, builds, languages, modules) => {
        const palette = getPalette(commits, 100);

        return {
          otherCount: 0,
          commits,
          committers,
          palette,
          issues,
          builds,
          languages,
          modules,
          firstSignificantTimestamp,
          lastSignificantTimestamp
        };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestLanguageModuleRiverData,
  receiveLanguageModuleRiverData,
  receiveLanguageModuleRiverDataError
);

/**
 *
 * @param commits
 * @param maxNumberOfColors
 * @param maxAuthors
 * @param maxLanguages
 * @param maxModules
 * @returns {any}
 */
function getPalette(commits, maxNumberOfColors, maxAuthors = 15, maxLanguages = 15, maxModules = 40) {
  const max = { authors: maxAuthors, languages: maxLanguages, modules: maxModules };

  const colors = generateColorPattern(Math.min(maxNumberOfColors, Object.keys(max).reduce((sum, count) => sum + count, 0)));

  const totals = calculateTotals(commits);

  // reorganize all attributes referring to their total changes
  const orderedList = Object.keys(totals).reduce(
    (attributes, attribute) =>
      Object.assign(attributes, {
        [attribute]: Object.keys(totals[attribute])
          .map(key => [key, totals[attribute][key]])
          .sort((a, b) => b[1] - a[1])
          .map(item => ({ name: item[0], changes: item[1] }))
      }),
    {}
  );

  // associate colors with attribute elements and add others
  return Object.keys(totals).reduce(
    (attributes, attribute) => {
      const elementCount = Math.min(orderedList[attribute].length, max[attribute]);
      const offset = attributes.offset + elementCount;
      attributes[attribute] = colors.slice(attributes.offset, offset).map((color, i, colorPalette) => ({
        key: i < colorPalette.length - 1 ? orderedList[attribute][i].name : 'others',
        color
      }));
      attributes.offset = offset;
      return attributes;
    },
    { offset: 0 }
  );
}

/**
 *
 * @param commits
 * @returns {{languages: {}, modules: {}, authors: {}}}
 */
function calculateTotals(commits) {
  const totals = { authors: {}, languages: {}, modules: {} };

  const attributes = (attribute, key, changes, source) =>
    source.forEach(commit => {
      attribute[key(commit)] = (attribute[key(commit)] || 0) + changes(commit).stats.additions + changes(commit).stats.deletions;
    });

  attributes(totals.authors, commit => commit.signature, commit => commit, commits);
  attributes(
    totals.languages,
    commit => commit.language.name,
    commit => commit,
    commits.reduce((changes, commit) => [...changes, ...commit.languages.data], [])
  );

  attributes(
    totals.modules,
    commit => commit.module.path,
    commit => commit,
    commits.reduce((changes, commit) => [...changes, ...commit.modules.data], [])
  );
  return totals;
}
