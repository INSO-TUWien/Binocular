'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, throttle } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';
import Promise from 'bluebird';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import { graphQl } from '../../../../utils';
import getBounds from '../../dashboard/sagas/getBounds';

export const setCategory = createAction('SET_CATEGORY');
export const setSplitCommits = createAction('SET_SPLIT_COMMITS');
export const setIssueField = createAction('SET_ISSUE_FIELD');

export const requestHotspotDialsData = createAction('REQUEST_HOTSPOT_DIALS_DATA');
export const receiveHotspotDialsData = timestampedActionFactory('RECEIVE_HOTSPOT_DIALS_DATA');
export const receiveHotspotDialsDataError = createAction('RECEIVE_HOTSPOT_DIALS_DATA_ERROR');

export default function* () {
  yield fetchHotspotDialsData();
  yield fork(watchSetCategory);
  yield fork(watchSetResolution);
  yield fork(watchRefreshRequests);
  yield fork(watchMessages);
  yield fork(watchRefresh);
  yield fork(watchSetIssueField);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
}

const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchHotspotDialsData);
}
export function* watchSetCategory() {
  yield takeEvery('SET_CATEGORY', fetchHotspotDialsData);
}

export function* watchSetResolution() {
  yield takeEvery('SET_RESOLUTION', fetchHotspotDialsData);
}

export function* watchSetIssueField() {
  yield takeEvery('SET_ISSUE_FIELD', fetchHotspotDialsData);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchHotspotDialsData);
}

export const fetchHotspotDialsData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const state = yield select();

    const config = state.visualizations.hotspotDials.state.config;

    const viewport = state.visualizations.hotspotDials.state.config.viewport || [0, null];

    let firstSignificantTimestamp = Math.max(viewport[0], firstCommitTimestamp);
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : lastCommitTimestamp;
    const universalSettings = state.visualizations.newDashboard.state.config;

    const timeSpan = universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();

    let universalSettingsCategory = 'hour';

    switch (universalSettings.chartResolution) {
      case 'years':
        universalSettingsCategory = 'month';
        break;
      case 'months':
        universalSettingsCategory = 'dayOfMonth';
        break;
      case 'weeks':
        universalSettingsCategory = 'dayOfWeek';
        break;
      case 'days':
        universalSettingsCategory = 'hour';
        break;
    }

    const categories = {
      hour: {
        offset: 0,
        count: 24,
        postProcess: (histogram) => {
          for (let i = 0; i < 12; i++) {
            histogram[i].count += histogram[i + 12].count;
          }
          histogram.splice(12, 12);
        },
        label: (cat) => (cat === 0 ? '12' : cat.toString()),
        detailedLabel: (cat) =>
          cat === 0 ? '12:00 PM - 12:59 PM (and 0:00 AM - 0:59 AM)' : `${cat}:00 AM - ${cat}:59 AM (and ${cat}:00 PM - ${cat}:59 PM)`,
      },
      dayOfWeek: {
        offset: 0,
        count: 7,
        postProcess: (id) => id,
        label: (cat) => moment().set('day', cat).format('dddd'),
        detailedLabel: (cat) => moment().set('day', cat).format('dddd'),
      },
      month: {
        offset: 1,
        count: 12,
        postProcess: (id) => id,
        label: (cat) =>
          moment()
            .set('month', cat - 1)
            .format('MMMM'),
        detailedLabel: (cat) =>
          moment()
            .set('month', cat - 1)
            .format('MMMM'),
      },
      dayOfMonth: {
        offset: 0,
        count: 31,
        postProcess: (id) => id,
        label: (cat) => moment().set('day', cat).format('DD'),
        detailedLabel: (cat) => moment().set('day', cat).format('DD'),
      },
    };

    const category = categories[universalSettingsCategory];
    return yield Promise.resolve(
      graphQl.query(
        `query($granularity: DateGranularity!, $dateField: String!, $since: Timestamp, $until: Timestamp) {
           commitDateHistogram(granularity: $granularity, since: $since, until: $until) {
             category
             count
           }
           goodCommits: commitDateHistogram(granularity: $granularity, buildFilter: successful, since: $since, until: $until) {
             category
             count
           }
           badCommits: commitDateHistogram(granularity: $granularity, buildFilter: failed, since: $since, until: $until) {
             category
             count
           }
           issueDateHistogram(granularity: $granularity, dateField: $dateField, since: $since, until: $until) {
             category
             count
           }
         }`,
        {
          granularity: universalSettingsCategory,
          dateField: config.issueField,
          since: firstSignificantTimestamp,
          until: lastSignificantTimestamp,
        }
      )
    )
      .then((resp) => [resp.commitDateHistogram, resp.goodCommits, resp.badCommits, resp.issueDateHistogram])
      .map((histogram) => {
        histogram = _(histogram)
          .filter((c) => c.category !== null)
          .sortBy('category')
          .value();

        for (let i = 0; i < category.count; i++) {
          if (!histogram[i] || histogram[i].category !== i + category.offset) {
            histogram.splice(i, 0, { category: i + category.offset, count: 0 });
          }

          histogram[i].label = category.label(histogram[i].category);
          histogram[i].detailedLabel = category.detailedLabel(histogram[i].category);
        }

        category.postProcess(histogram);

        const maximum = _.maxBy(histogram, 'count').count;
        return {
          maximum,
          categories: histogram,
        };
      })
      .spread((commits, goodCommits, badCommits, issues) => {
        commits.categories = commits.categories.filter((c) => c.label !== undefined);
        goodCommits.categories = goodCommits.categories.filter((gc) => gc.label !== undefined);
        badCommits.categories = badCommits.categories.filter((bc) => bc.label !== undefined);
        issues.categories = issues.categories.filter((i) => i.label !== undefined);
        return {
          commits: {
            maximum: badCommits.maximum + goodCommits.maximum,
            categories: _.zipWith(badCommits.categories, goodCommits.categories, (a, b) => ({
              category: a.category,
              count: a.count + b.count,
              badCount: a.count,
              goodCount: b.count,
              label: a.label,
              detailedLabel: a.detailedLabel,
            })),
          },
          issues,
        };
      });
  },
  requestHotspotDialsData,
  receiveHotspotDialsData,
  receiveHotspotDialsDataError
);
