'use strict';

const Connection = require('./Connection.js');
const File = require('./File.js');
const Hunk = require('./Hunk.js');

const FileHunkConnection = Connection.define(File, Hunk);

module.exports = FileHunkConnection;
