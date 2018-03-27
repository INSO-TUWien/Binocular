'use strict';

const Connection = require('./Connection.js');
const Issue = require('./Issue.js');
const Stakeholder = require('./Stakeholder.js');

const IssueStakeholderConnection = Connection.define(Issue, Stakeholder);

module.exports = IssueStakeholderConnection;
