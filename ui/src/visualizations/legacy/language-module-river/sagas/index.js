'use strict';

import { createAction } from 'redux-actions';
import { throttle, fork, takeEvery } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import getCommitData from './getCommitData.js';
import getBuildData from './getBuildData.js';
import getBounds from './getBounds.js';
import getLanguageData from './getLanguageData';
import getModuleData from './getModuleData';
import generateColorPattern from '../../../../utils/colors';
import { nextPrime } from '../../../../utils/math';
import fetchRelatedCommits from './fetchRelatedCommits.js';

export const setResolution = createAction('SET_LANGUAGE_MODULE_RIVER_RESOLUTION');
export const setChartAttribute = createAction('SET_LANGUAGE_MODULE_RIVER_CHART_ATTRIBUTE');
export const setSelectedAuthors = createAction('SET_LANGUAGE_MODULE_RIVER_SELECTED_AUTHORS');
export const setSelectedLanguages = createAction('SET_LANGUAGE_MODULE_RIVER_SELECTED_LANGUAGES');
export const setSelectedModules = createAction('SET_LANGUAGE_MODULE_RIVER_SELECTED_MODULES');
export const setHighlightedIssue = createAction('SET_LANGUAGE_MODULE_RIVER_HIGHLIGHTED_ISSUE');

export const requestLanguageModuleRiverData = createAction('REQUEST_LANGUAGE_MODULE_RIVER_DATA');
export const receiveLanguageModuleRiverData = timestampedActionFactory('RECEIVE_LANGUAGE_MODULE_RIVER_DATA');
export const receiveLanguageModuleRiverDataError = createAction('RECEIVE_LANGUAGE_MODULE_RIVER_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchLanguageModuleRiverData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport sprints to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);
  yield fork(watchHighlightedIssue);
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

function* watchHighlightedIssue() {
  yield takeEvery('SET_LANGUAGE_MODULE_RIVER_HIGHLIGHTED_ISSUE', function* (a) {
    return yield fetchRelatedCommits(a.payload);
  });
}

/**
 * Fetch data for languageModuleRiver, this still includes old functions that were copied over from dashboard.
 */
export const fetchLanguageModuleRiverData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const firstSignificantTimestamp = Math.min(firstCommitTimestamp, firstIssueTimestamp);
    const lastSignificantTimestamp = Math.max(lastCommitTimestamp, lastIssueTimestamp);

    return yield Promise.all([
      getCommitData([firstSignificantTimestamp, lastSignificantTimestamp]),
      getBuildData(),
      getLanguageData(),
      getModuleData(),
    ])
      .then((results) => {
        const commits = results[0];
        const builds = results[1];
        const languages = results[2];
        const modules = results[3];

        const attributes = organizeAttributes(commits, 100);

        return {
          commits,
          committers,
          attributes,
          builds,
          languages,
          modules,
          firstSignificantTimestamp,
          lastSignificantTimestamp,
        };
      })
      .catch(function (e) {
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
function organizeAttributes(commits, maxNumberOfColors, maxAuthors = 15, maxLanguages = 15, maxModules = 60) {
  const max = { authors: maxAuthors, languages: maxLanguages, modules: maxModules };

  // using prime allows the algorithm to create a mostly observable unique color pattern
  const colors = generateColorPattern(
    Math.min(nextPrime(maxNumberOfColors), nextPrime(Object.keys(max).reduce((sum, key) => sum + max[key], 0)))
  );

  const totals = calculateTotals(commits);

  // reorganize all attributes referring to their total sprints
  const orderedList = Object.keys(totals).reduce(
    (attributes, attribute) =>
      Object.assign(attributes, {
        [attribute]: Object.keys(totals[attribute])
          .map((key) => [key, totals[attribute][key]])
          .sort((a, b) => b[1] - a[1])
          .map((item) => ({ name: item[0], changes: item[1] })),
      }),
    {}
  );

  // associate colors with attribute elements and add others
  return Object.keys(totals).reduce(
    (attributes, attribute) => {
      const elementCount = Math.min(orderedList[attribute].length, max[attribute]);
      const offset = attributes.offset + elementCount;
      const overflow = orderedList[attribute].length - elementCount;
      const hasOverflow = overflow > 0;
      const others = orderedList[attribute].slice(elementCount - 1);
      attributes[attribute] = {
        colors: colors.slice(attributes.offset, offset).map((color, i, colorPalette) => ({
          key: hasOverflow && i >= colorPalette.length - 1 ? 'others' : orderedList[attribute][i].name,
          color,
        })),
        // store all ordered values of a given attribute
        order: hasOverflow ? orderedList[attribute].slice(0, elementCount - 1) : orderedList[attribute],
        overflow,
        // contains all others
        others: others.map((data) => data.name),
      };
      // if overflow exists sum all overflowing values together
      if (hasOverflow) {
        attributes[attribute].order[elementCount - 1] = {
          name: 'others',
          changes: others.reduce((sum, element) => sum + element.changes, 0),
        };
      }
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
    source.forEach((commit) => {
      attribute[key(commit)] = (attribute[key(commit)] || 0) + changes(commit).stats.additions + changes(commit).stats.deletions;
    });

  attributes(
    totals.authors,
    (commit) => commit.signature,
    (commit) => commit,
    commits
  );
  attributes(
    totals.languages,
    (commit) => commit.language.name,
    (commit) => commit,
    commits.reduce((changes, commit) => [...changes, ...commit.languages.data], [])
  );

  attributes(
    totals.modules,
    (commit) => commit.module.path,
    (commit) => commit,
    commits.reduce((changes, commit) => [...changes, ...commit.modules.data], [])
  );
  return totals;
}
