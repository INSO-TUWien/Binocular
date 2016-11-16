'use strict';

const packageJson = require('../package.json');
const config = require('rc')(packageJson.name, {
  port: 87643
});

module.exports = config;
