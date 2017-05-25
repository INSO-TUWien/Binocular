'use strict';

const Connection = require('./Connection.js');
const Commit = require('./Commit.js');
const BlameHunk = require('./BlameHunk.js');

const CommitBlameHunkConnection = Connection.define(Commit, BlameHunk);

module.exports = CommitBlameHunkConnection;
