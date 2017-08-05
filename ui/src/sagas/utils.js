'use strict';

import { createAction } from 'redux-actions';
import { put } from 'redux-saga/effects';

export function fetchFactory(fn, requestActionCreator, receiveActionCreator, errorActionCreator) {
  return function*(...args) {
    yield put(requestActionCreator());
    try {
      const result = yield* fn(...args);
      yield put(receiveActionCreator(result));
    } catch (e) {
      if (errorActionCreator) {
        yield put(errorActionCreator(e));
      } else {
        throw e;
      }
    }
  };
}

export function timestampedActionFactory(action) {
  return createAction(action, id => id, () => ({ receivedAt: new Date() }));
}
