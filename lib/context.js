'use strict';

const Promise = require( 'bluebird' );
const neo4j = require( 'neo4j' );
const express = require( 'express' );
const opn = require( 'opn' );
const argv = require( 'yargs' )
      .option( 'ui', {
        default: true,
        alias: 'u'
      } )
      .option( 'open', {
        alias: 'o',
        default: true
      } )
     .help( 'h' ).alias( 'help', 'h' )
     .argv;

const cfg = require( './config.js' );
const app = express();

Promise.promisifyAll( neo4j.GraphDatabase.prototype );
Promise.promisifyAll( neo4j.Node.prototype );


const context = {
  db: new neo4j.GraphDatabase( cfg.neo4j ),
  app
};

if( argv.ui ) {
  app.use( express.static('ui') );
  app.use( '/assets', express.static('ui/gen') );
}

app.listen( cfg.port, function() {
  console.log( `Pupil listening on http://localhost:${cfg.port}` );
  if( argv.ui && argv.open ) {
    opn( `http://localhost:${cfg.port}/` );
  }
} );

module.exports = context;
