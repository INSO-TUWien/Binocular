'use strict';

const Promise = require( 'bluebird' );
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
const Db = require( './db.js' );
const app = express();

const db = new Db( cfg.arango );

const context = { db, app };

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
