'use strict';

const Connection = require('./Connection.js');
const Issue = require('./Issue.js');
const Commit = require('./Commit.js');

const IssueCommitConnection = Connection.define(Issue, Commit);

module.exports = IssueCommitConnection;
