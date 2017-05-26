'use strict';

const Model = require('./Model.js');
const Stakeholder = Model.define('Stakeholder', {
  attributes: ['gitlabId', 'gitlabName', 'gitlabUrl', 'gitSignature']
});

module.exports = Stakeholder;
