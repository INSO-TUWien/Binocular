'use strict';

const express = require( 'express' );
const socketIo = require( 'socket.io' );
const http = require( 'http' );
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

const app = express();
const httpServer = http.Server( app );
const io = socketIo( httpServer, { path: '/wsapi' } );

app.use( bodyParser.json() );

const context = {
  app,
  argv,
  httpServer,
  targetPath: argv._[0] || '.',
  models: {},
  io
};

if( argv.ui ) {
  app.use( express.static('ui') );
  app.use( '/assets', express.static('ui/gen') );
}


module.exports = context;
