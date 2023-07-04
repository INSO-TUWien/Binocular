'use strict';

const Connection = require('./Connection');
const Commit = require('./Commit');
const File = require('./File');

module.exports = Connection.define(Commit, File);
