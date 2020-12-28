'use strict';

import { endpointUrl } from '../../../utils';

/**
 * Retrieves the parent and the forks of the base project (if available).
 * @returns {*} the parent and the forks
 */
export default function getParentAndForks() {
  return fetch(endpointUrl('parent/fork'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => resp.json());
}
