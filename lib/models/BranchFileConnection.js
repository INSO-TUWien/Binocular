'use strict';

const Connection = require('./Connection');
const Branch = require('./Branch');
const File = require('./File');

module.exports = Connection.define(Branch, File);
