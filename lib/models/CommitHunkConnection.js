'use strict';

const Connection = require('./Connection.js');
const Commit = require('./Commit.js');
const Hunk = require('./Hunk.js');

const CommitHunkConnection = Connection.define(Commit, Hunk);

module.exports = CommitHunkConnection;
