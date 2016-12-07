#!/usr/bin/env node

'use strict';

require( './lib/context.js' );

const _ = require( 'lodash' );
const Promise = require( 'bluebird' ); 
const git = require( './lib/git.js' );
const path = require( 'path' );

const { db } = require( './lib/context.js' );
const config = require( './lib/config.js' );

return Promise.resolve( git.getRepoPath() )
.bind( {} )
.then( function( repoPath ) {
  const name = path.basename( path.dirname(repoPath) );
  this.dbName = config.arango.database || name;
  this.repoPath = repoPath;

  return db.ensureDatabase( this.dbName );
} )
.then( function() {

  return Promise.join(
    db.ensureCollection( 'commits' ),
    git.getAllCommits( this.repoPath )
  );
} )
.spread( function( collection, commits ) {
  return Promise.map( commits, function( commit ) {
    return collection.save( {
      sha: commit.id().toString(),
      message: commit.message()
    } );
  } );
} );

// git.getAllCommits( '.' )
// .map( function( commit ) {
//   const header = _.head( _.split(commit.message(), '\n', 2) );
//   console.log( `${commit.id()} ${header}` );
// } 
