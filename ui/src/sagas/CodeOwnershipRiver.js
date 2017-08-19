'use strict';

import { createAction } from 'redux-actions';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE', i => i);
