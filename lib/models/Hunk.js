'use strict';

const Connection = require('./Connection.js');
const Commit = require('./Commit.js');
const File = require('./File.js');
const Hunk = Connection.define(Commit, File);

module.exports = Hunk;
