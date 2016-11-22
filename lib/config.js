'use strict';

const packageJson = require( '../package.json' );
const config = require( 'rc' )( packageJson.name, {
  port: 87643,
  neo4j: {
    url: 'http://localhost:7474/',
    auth: {
      username: 'neo4j'
    }
  }
} );

module.exports = config;
