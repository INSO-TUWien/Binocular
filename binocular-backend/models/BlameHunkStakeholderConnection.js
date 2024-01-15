'use strict';

const Connection = require('./Connection.js').default;
const BlameHunk = require('./BlameHunk.js').default;
const Stakeholder = require('./Stakeholder.js').default;

const BlameHunkStakeholderConnection = Connection.define(BlameHunk, Stakeholder);

module.exports = BlameHunkStakeholderConnection;
