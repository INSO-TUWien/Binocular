'use strict';

import { createAction } from 'redux-actions';

export const setColor = createAction('SET_COLOR', (color, key) => {
  return { color, key };
});

export default function* () {}
