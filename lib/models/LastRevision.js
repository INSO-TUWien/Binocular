'use strict';

const Model = require('./Model.js');
const LastRevision = Model.define('LastRevision', { attributes: ['sha'] });

module.exports = LastRevision;
