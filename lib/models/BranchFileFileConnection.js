'use strict';

const Connection = require('./Connection');
const BranchFile = require('./BranchFileConnection');
const File = require('./File');

module.exports = Connection.define(BranchFile, File);
