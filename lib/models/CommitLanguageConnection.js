'use strict';

const Connection = require('./Connection');
const Commit = require('./Commit');
const Language = require('./Language');

module.exports = Connection.define(Commit, Language);
