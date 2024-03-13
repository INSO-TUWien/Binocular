'use strict';

const Connection = require('./Connection.js').default;
const BlameHunk = require('./BlameHunk.js').default;
const Stakeholder = require('./Stakeholder.js').default;

const BlameHunkStakeholderConnection = new Connection(BlameHunk, Stakeholder);

module.exports = BlameHunkStakeholderConnection;
