'use strict';

import { createAction } from 'redux-actions';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);
import { put, select, takeEvery, fork, throttle } from 'redux-saga/effects';
