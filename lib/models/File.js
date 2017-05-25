'use strict';

const Model = require('./Model.js');
const File = Model.define('File', { attributes: ['path'] });

module.exports = File;
