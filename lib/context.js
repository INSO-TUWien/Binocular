'use strict';

const express = require( 'express' );
const cors = require( 'cors' );
const bodyParser = require( 'body-parser' );
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

const cfg = require( './config.js' ).get();
const Db = require( './db.js' );
const app = express();

app.use( cors() );
app.use( bodyParser.json() );

const db = new Db( cfg.arango );

const context = { db, app, argv };

if( argv.ui ) {
  app.use( express.static('ui') );
  app.use( '/assets', express.static('ui/gen') );
}


module.exports = context;
