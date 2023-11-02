'use strict';

const Connection = require('./Connection');
const Commit = require('./Commit');
const Module = require('./Module');

module.exports = Connection.define(Commit, Module);
