'use strict';

const Promise = require( 'bluebird' );
const neo4j = require( 'neo4j' );

const cfg = require( './config.js' );

Promise.promisifyAll( neo4j.GraphDatabase.prototype );
Promise.promisifyAll( neo4j.Node.prototype );

const context = {
  db: new neo4j.GraphDatabase( cfg.neo4j )
};

module.exports = context;
