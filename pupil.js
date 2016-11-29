#!/usr/bin/env node

'use strict';

require( './lib/context.js' );

const _ = require( 'lodash' );
const Promise = require( 'bluebird' ); 
const git = require( './lib/git.js' );
const path = require( 'path' );

const { db } = require( './lib/context.js' );
const config = require( './lib/config.js' );

Promise.join(
  git.getRepoPath(),
  db.listDatabases()
)
.bind( {} )
.spread( function( repoPath, dbs ) {
  const name = path.basename( path.dirname(repoPath) );
  this.dbName = config.arango.database || name;

  if( !_.includes(dbs, this.dbName) ) {
    return db.createDatabase( this.dbName );
  }

} )
.then( function() {

  db.useDatabase( this.dbName );

  return db.query( {
    query: 'RETURN @arg0',
    bindVars: { arg0: Date.now() }
  } );
} )
.then( function() {
  console.log( arguments );
} );


// git.getAllCommits( '.' )
// .map( function( commit ) {
//   const header = _.head( _.split(commit.message(), '\n', 2) );
//   console.log( `${commit.id()} ${header}` );
// } );
