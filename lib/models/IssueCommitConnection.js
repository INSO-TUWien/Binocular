'use strict';

const Connection = require('./Connection.js');
const Issue = require('./Issue.js');
const Commit = require('./Commit.js');

module.exports = Connection.define(Commit, Issue);
