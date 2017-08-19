'use strict';

const Model = require('./Model.js');
const Hunk = Model.define('Hunk', {
  attributes: ['newLines', 'newStart', 'oldLines', 'oldStart']
});

module.exports = Hunk;
