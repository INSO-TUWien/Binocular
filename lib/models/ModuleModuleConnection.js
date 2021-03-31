'use strict';

const Connection = require('./Connection');
const Module = require('./Module');

module.exports = Connection.define(Module, Module);
