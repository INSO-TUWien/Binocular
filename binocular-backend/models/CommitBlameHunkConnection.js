'use strict';

const Connection = require('./Connection.js').default;
const Commit = require('./Commit.js').default;
const BlameHunk = require('./BlameHunk.js').default;

const CommitBlameHunkConnection = Connection.define(Commit, BlameHunk);

module.exports = CommitBlameHunkConnection;
