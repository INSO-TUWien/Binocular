'use strict';

const Connection = require('./Connection').default;
const Commit = require('./Commit.js').default;
const BlameHunk = require('./BlameHunk.js').default;

const CommitBlameHunkConnection = new Connection(Commit, BlameHunk);

module.exports = CommitBlameHunkConnection;
