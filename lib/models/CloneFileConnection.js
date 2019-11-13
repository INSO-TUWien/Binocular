'use strict';

const Connection = require('./Connection.js');
const Clone = require('./Clone.js');
const File = require('./File.js');

const CloneFileConnection = Connection.define(Clone, File);

module.exports = CloneFileConnection;
