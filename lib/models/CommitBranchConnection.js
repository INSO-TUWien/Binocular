'use strict';

const Connection = require('./Connection.js');
const Commit = require('./Commit.js');
const Branch = require('./Branch.js');

const CommitBranchConnection = Connection.define(Commit, Branch);

module.exports = CommitBranchConnection;
