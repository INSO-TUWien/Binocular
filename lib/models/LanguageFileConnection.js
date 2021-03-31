'use strict';

const Connection = require('./Connection');
const Language = require('./Language');
const File = require('./File');

module.exports = Connection.define(Language, File);
