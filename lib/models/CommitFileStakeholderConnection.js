'use strict';

const Connection = require('./Connection');
const CommitFile = require('./CommitFileConnection');
const Stakeholder = require('./Stakeholder');

module.exports = Connection.define(CommitFile, Stakeholder);
