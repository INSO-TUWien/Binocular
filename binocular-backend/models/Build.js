'use strict';

import _ from 'lodash';
import Model from './Model';
import { aql } from 'arangojs';

const Build = new Model('Build', {
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

Build.persist = function (_buildData) {
  const buildData = _.clone(_buildData);
  if (_buildData.id) {
    buildData.id = _buildData.id.toString();
  }

  return Build.ensureById(buildData.id, buildData, { ignoreUnknownAttributes: true });
};

Build.deleteShaRefAttributes = async function () {
  return Build.rawDb.query(
    aql`
    FOR b IN builds
    REPLACE b WITH UNSET(b, "sha", "ref") IN builds`,
  );
};

export default Build;
