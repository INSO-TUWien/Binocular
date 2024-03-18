'use strict';

import _ from 'lodash';
import Model from './Model';
import { aql } from 'arangojs';

class Build extends Model {
  constructor() {
    super('Build', {
      attributes: [
        'id',
        'sha',
        'beforeSha',
        'ref',
        'status',
        'tag',
        'yamlErrors',
        'user',
        'createdAt',
        'updatedAt',
        'startedAt',
        'finishedAt',
        'committedAt',
        'duration',
        'jobs',
        'coverage',
        'webUrl',
      ],
      keyAttribute: 'id',
    });
  }
  persist(_buildData) {
    const buildData = _.clone(_buildData);
    if (_buildData.id) {
      buildData.id = _buildData.id.toString();
    }

    return this.ensureById(buildData.id, buildData, { ignoreUnknownAttributes: true });
  }

  deleteShaRefAttributes() {
    return this.rawDb.query(
      aql`
    FOR b IN builds
    REPLACE b WITH UNSET(b, "sha", "ref") IN builds`,
    );
  }
}

export default new Build();
