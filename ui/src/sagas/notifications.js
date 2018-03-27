'use strict';

import { createAction } from 'redux-actions';
import { delay } from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';

let nextId = 0;

export const removeNotification = createAction('REMOVE_NOTIFICATION');
export const addNotification = createAction(
  'ADD_NOTIFICATION',
  (message, type = 'success', duration = 2000) => ({
    id: nextId++,
    type,
    message,
    duration
  })
);

export function* watchNotifications() {
  yield takeEvery('ADD_NOTIFICATION', function*(action) {
    yield delay(action.payload.duration || 2000);
    yield put(removeNotification(action.payload.id));
  });
}

export function notification(message, type = 'success') {
  return { id: nextId++, type, message };
}
