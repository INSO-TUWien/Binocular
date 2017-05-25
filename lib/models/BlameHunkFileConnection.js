'use strict';

const Connection = require('./Connection.js');
const BlameHunk = require('./BlameHunk.js');
const File = require('./File.js');

const BlameHunkFileConnection = Connection.define(BlameHunk, File);

module.exports = BlameHunkFileConnection;
