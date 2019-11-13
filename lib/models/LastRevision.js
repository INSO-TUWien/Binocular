'use strict';

const Model = require('./Model.js');
const LastRevision = Model.define('LastRevision', {
  attributes: ['id', 'sha'],
  keyAttribute: 'id'
});

module.exports = LastRevision;
