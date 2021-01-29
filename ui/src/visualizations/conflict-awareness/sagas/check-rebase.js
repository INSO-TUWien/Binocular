'use strict';

import { endpointUrl } from '../../../utils';

/**
 * Retrieves the parent and the forks of the base project (if available).
 * @returns {*} the parent and the forks
 */
export default function getParentAndForks() {
  return fetch(endpointUrl('check/rebase'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {}
  }).then((resp) => resp.json());
}
