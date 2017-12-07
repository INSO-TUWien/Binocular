'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';
import Promise from 'bluebird';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';
import { graphQl } from '../../../utils';

export const setCategory = createAction('SET_CATEGORY', cat => cat);

export const requestHotspotDialsData = createAction('REQUEST_HOTSPOT_DIALS_DATA');
export const receiveHotspotDialsData = timestampedActionFactory('RECEIVE_HOTSPOT_DIALS_DATA');
export const receiveHotspotDialsDataError = createAction('RECEIVE_HOTSPOT_DIALS_DATA_ERROR');

export default function*() {
  yield fetchHotspotDialsData();
  yield fork(watchSetCategory);
}

export function* watchSetCategory() {
  yield takeEvery('SET_CATEGORY', fetchHotspotDialsData);
}

export const fetchHotspotDialsData = fetchFactory(
  function*() {
    const { hotspotDialsConfig } = yield select();

    const categories = {
      hour: {
        offset: 0,
        count: 24,
        postProcess: histogram => {
          for (let i = 0; i < 12; i++) {
            histogram[i].count += histogram[i + 12].count;
          }
          histogram.splice(12, 12);
        },
        label: cat => (cat === 0 ? '12' : cat.toString()),
        detailedLabel: cat =>
          cat === 0
            ? '12:00 PM - 12:59 PM (and 0:00 AM - 0:59 AM)'
            : `${cat}:00 AM - ${cat}:59 AM (and ${cat}:00 PM - ${cat}:59 PM)`
      },
      dayOfWeek: {
        offset: 0,
        count: 7,
        postProcess: id => id,
        label: cat => moment().set('day', cat).format('dddd'),
        detailedLabel: cat => moment().set('day', cat).format('dddd')
      },
      month: {
        offset: 1,
        count: 12,
        postProcess: id => id,
        label: cat => moment().set('month', cat - 1).format('MMMM'),
        detailedLabel: cat => moment().set('month', cat - 1).format('MMMM')
      }
    };

    const category = categories[hotspotDialsConfig.category];

    return yield Promise.resolve(
      graphQl.query(
        `query($granularity: DateGranularity!) {
           commitDateHistogram(granularity: $granularity) {
             category
             count
           }
           issueDateHistogram(granularity: $granularity) {
             category
             count
           }
         }`,
        { granularity: hotspotDialsConfig.category }
      )
    )
      .then(resp => [resp.commitDateHistogram, resp.issueDateHistogram])
      .map(histogram => {
        histogram = _.sortBy(histogram, 'category');

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
          categories: histogram
        };
      })
      .spread((commits, issues) => ({ commits, issues }));
  },
  requestHotspotDialsData,
  receiveHotspotDialsData,
  receiveHotspotDialsDataError
);
