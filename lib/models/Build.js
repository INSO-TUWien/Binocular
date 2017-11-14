'use strict';

const _ = require('lodash');
const Model = require('./Model.js');

const Build = Model.define('Build', {
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
    'coverage'
  ],
  keyAttribute: 'id'
});

Build.persist = function(_buildData) {
  const buildData = _.clone(_buildData);
  if (_buildData.id) {
    buildData.id = _buildData.id.toString();
  }

  return Build.ensureById(buildData.id, buildData, { ignoreUnknownAttributes: true });
};

module.exports = Build;
