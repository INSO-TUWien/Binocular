'use strict';

const Connection = require('./Connection.js');
const Commit = require('./Commit.js');
const Stakeholder = require('./Stakeholder.js');

const CommitStakeholderConnection = Connection.define(Commit, Stakeholder);

module.exports = CommitStakeholderConnection;
