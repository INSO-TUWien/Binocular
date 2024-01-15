'use strict';

import { createAction } from 'redux-actions';
import { call, put } from 'redux-saga/effects';

export function fetchFactory(fn: any, requestActionCreator: any, receiveActionCreator: any, errorActionCreator: any): any {
  return function* (...args: any[]) {
    yield put(requestActionCreator());
    let result: { [key: string]: any } | null = null;
    try {
      result = yield call(fn, ...args);
      yield put(receiveActionCreator(result));
    } catch (e) {
      if (errorActionCreator) {
        console.error(e);
        yield put(errorActionCreator(e));
      } else {
        throw e;
      }
    }
  };
}

export function timestampedActionFactory(action: any) {
  return createAction(
    action,
    (id) => id,
    () => ({ receivedAt: new Date() }),
  );
}

export function mapSaga(actionCreator: any) {
  return function* () {
    yield put(actionCreator());
  };
}
