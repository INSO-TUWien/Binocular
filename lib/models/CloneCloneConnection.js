'use strict';

const Connection = require('./Connection.js');
const Clone = require('./Clone.js');

const CloneCloneConnection = Connection.define(Clone, Clone);

module.exports = CloneCloneConnection;
