'use strict';

import { createAction } from 'redux-actions';
import _ from 'lodash';

export const addRef = createAction('CF_ADD_REF');
export const removeRef = createAction('CF_REMOVE_REF');
export const setRefs = createAction('CF_SET_REFS');

export default function*() {
}
