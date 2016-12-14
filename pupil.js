#!/usr/bin/env node

'use strict';

require( './lib/context.js' );

const _ = require( 'lodash' );
const Promise = require( 'bluebird' ); 
const git = require( './lib/git.js' );
const path = require( 'path' );

const { app, db, argv } = require( './lib/context.js' );
const config = require( './lib/config.js' );

app.get( '/commits', require('./lib/endpoints/get-commits.js') );

return Promise.resolve( git.getRepoPath() )
.bind( {} )
.then( function( repoPath ) {
  const name = path.basename( path.dirname(repoPath) );
  this.dbName = config.arango.database || name;
  this.repoPath = repoPath;
  return db.ensureDatabase( this.dbName );
} )
.then( function() {
  return db.ensureCollection( 'commits' );
} )
.then( function( commitCollection ) {
  this.commitCollection = commitCollection;

  return git.getAllCommits( this.repoPath );
} )
.map( function( commit ) {
  
  const sha = commit.id().toString();
  return Promise.bind( this )
  .then( () => this.commitCollection.lookupByKeys([sha]) )
  .then( function( c ) {

    if( c.length === 0 ) {
      console.log( 'Persisting', sha );
      return saveCommit( this.commitCollection, commit );
    } else {
      console.log( 'Omitting', sha, '(already present)' );
    }
  } )
  .thenReturn( commit );
} )
.then( function() {
  app.listen( config.port, function() {
    console.log( `Pupil listening on http://localhost:${config.port}` );
    if( argv.ui && argv.open ) {
      opn( `http://localhost:${config.port}/` );
    }
  } );
} );


function saveCommit( collection, commit ) {
  return Promise.props( {
    sha: commit.id().toString(),
    _key: commit.id().toString(),
    committer: commit.committer().toString(),
    date: commit.date(),
    message: commit.message(),
    affectedFiles: getFiles( commit )
  } )
  .then( function( commitData ) {
    return collection.save( commitData );
  } )
}

function getFiles( commit ) {

  return Promise.resolve( commit.getDiff() )
  .then( diffs => _.flatten(diffs) )
  .map( diff => diff.patches() )
  .then( patches => _.flatten(patches) )
  .map( function( patch ) {

    return Promise.props( {
      newPath: patch.newFile().path(),
      oldPath: patch.oldFile().path(),
      hunks: getHunks( patch )
    } );
  } );
}

function getHunks( patch ) {
  return Promise.resolve( patch.hunks() )
  .map( function( hunk ) {
    return {
      newLines: hunk.newLines(),
      oldLines: hunk.oldLines()
    }
  } );
}
