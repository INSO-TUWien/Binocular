'use strict';

const Connection = require('./Connection.js');
const Clone = require('./Clone.js');
const Commit = require('./Commit.js');

const CloneCommitConnection = Connection.define(Clone, Commit);

module.exports = CloneCommitConnection;
