'use strict';

const Model = require('./Model.js');
const Language = Model.define('Language', { attributes: ['name', 'shortName'] });

module.exports = Language;
