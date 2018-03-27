'use strict';

const Connection = require('./Connection.js');
const Commit = require('./Commit.js');

const CommitCommitConnection = Connection.define(Commit, Commit);

module.exports = CommitCommitConnection;
