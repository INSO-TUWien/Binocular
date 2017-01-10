#!/usr/bin/env node

'use strict';

require( './lib/context.js' );

const Promise = require( 'bluebird' ); 
const git = require( './lib/git.js' );
const path = require( 'path' );
const opn = require( 'opn' );

const { app, argv } = require( './lib/context.js' );
const config = require( './lib/config.js' );
const Indexer = require( './lib/RepositoryIndexer.js' );

app.get( '/commits', require('./lib/endpoints/get-commits.js') );
app.get( '/config', require('./lib/endpoints/get-config.js') );
app.post( '/config', require('./lib/endpoints/update-config.js') );

const port = config.get().port;

app.listen( port, function() {
  console.log( `Pupil listening on http://localhost:${port}` );
  if( argv.ui && argv.open ) {
    opn( `http://localhost:${port}/` );
  }
} );

Promise.resolve( git.getRepoPath() ) .bind( {} )
.then( function( repoPath ) {

  const indexer = new Indexer( repoPath );
  const name = path.basename( path.dirname(repoPath) );
  this.dbName = config.get().arango.database || name;

  config.setSource( path.resolve(repoPath, '../.pupilrc') );
  config.on( 'updated', reIndex );

  reIndex();

  function reIndex() {
    return indexer.index()
    .catch( e => e.statusCode === 401, function() {
      console.warn( 'Unable to access database, please provide correct credentials in configuration UI.' );
    } );
  }
} );

