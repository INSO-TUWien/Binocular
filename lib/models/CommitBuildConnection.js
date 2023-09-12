'use strict';

const Connection = require('./Connection');
const Commit = require('./Commit');
const Build = require('./Build');

module.exports = Connection.define(Commit, Build);
