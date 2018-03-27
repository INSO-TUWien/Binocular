'use strict';

const Connection = require('./Connection.js');
const BlameHunk = require('./BlameHunk.js');
const Stakeholder = require('./Stakeholder.js');

const BlameHunkStakeholderConnection = Connection.define(BlameHunk, Stakeholder);

module.exports = BlameHunkStakeholderConnection;
