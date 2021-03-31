'use strict';

const Connection = require('./Connection');
const Module = require('./Module');
const File = require('./File');

module.exports = Connection.define(Module, File);
