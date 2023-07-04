'use strict';

const Connection = require('./Connection');
const CommitBlameHunk = require('./CommitBlameHunkConnection');
const Stakeholder = require('./Stakeholder');

module.exports = Connection.define(CommitBlameHunk, Stakeholder);
