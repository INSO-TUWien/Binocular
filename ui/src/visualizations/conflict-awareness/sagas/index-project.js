'use strict';

import { endpointUrl } from '../../../utils';

/**
 * Triggers the indexing of the specific project of the owner.
 * @returns {*}
 */
export default function indexProject(owner, project) {
  return fetch(endpointUrl('index'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ owner: owner, project: project }),
  }).then((resp) => resp.json());
}
