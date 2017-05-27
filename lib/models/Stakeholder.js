'use strict';

const Model = require('./Model.js');
const Stakeholder = Model.define('Stakeholder', {
  attributes: ['gitSignature', 'gitlabId', 'gitlabName', 'gitlabAvatarUrl', 'gitlabWebUrl']
});

module.exports = Stakeholder;
