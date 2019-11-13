'use strict';

const _ = require('lodash');
const Model = require('./Model.js');

const Clone = Model.define('Clone', {
  attributes: [
    'id',
    'fingerprint',
    'sourcecode',
    'numlines',
    'startline',
    'clonetype',
    'path',
    'origin',
    'revisions'
  ]
});

Clone.persist = function(_cloneData) {
  const cloneData = _.clone(_cloneData);
  if (_cloneData.id) {
    cloneData.id = _cloneData.id.toString();
  }

  return Clone.ensureById(cloneData.id, cloneData, { ignoreUnknownAttributes: true });
};

module.exports = Clone;
