'use strict';

const packageJson = require( '../package.json' );
const config = require( 'rc' )( packageJson.name, {
  port: 48763,
  arango: {
    host: 'localhost',
    port: 8529,
    user: 'root',
    password: 'gtYgnXIcUu0gtYjNMrgs'
  }
} );

module.exports = config;
