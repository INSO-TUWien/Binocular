'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import getFilesAndLinks from './getFilesAndLinks.js';

export const requestFilesAndLinks = createAction('REQUEST_FILES_AND_LINKS');
export const receiveFilesAndLinks = timestampedActionFactory('RECEIVE_FILES_AND_LINKS');
export const receiveFilesAndLinksError = createAction('RECEIVE_FILES_AND_LINKS_ERROR');

export default function*() {
  // fetch data once on entry
  yield* fetchFilesAndLinks();
}

export const fetchFilesAndLinks = fetchFactory(
  function*() {
    return yield Promise.join(
      getFilesAndLinks()
    )
      .spread((filesAndLinks) => {
        return {
          filesAndLinks: filesAndLinks
        };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestFilesAndLinks,
  receiveFilesAndLinks,
  receiveFilesAndLinksError
);
