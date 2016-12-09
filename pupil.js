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
    db.ensureEdgeCollection( 'commit-parents' )
  );
} )
.spread( function( commitCollection, parentsCollection ) {
  this.commitCollection = commitCollection;
  this.parentsCollection = parentsCollection;
  
  
  return db.ensureGraph( 'commit-network', {
    edgeDefinitions: [ {
      collection: 'commit-parents',
      from: ['commits'],
      to: ['commits']
    } ]
  } );
} )
.then( function( network ) {
  this.network = network;

  return git.getAllCommits( this.repoPath );
} )
.map( function( commit ) {
  
  const sha = commit.id().toString();
  return Promise.bind( this )
  .then( () => this.commitCollection.lookupByKeys([sha]) )
  .then( function( c ) {
    if( c.length === 0 ) {
      console.log( 'Persisting', sha );
      return this.commitCollection.save( {
        sha: commit.id().toString(),
        _key: commit.id().toString(),
        message: commit.message()
      } );
    } else {
      console.log( 'Omitting', sha, '(already present)' );
    }
  } )
  .thenReturn( commit );
} )
.map( function( commit ) {

  return Promise.bind( this )
  .then( () => commit.parents() )
  .map( function( parentOid ) {
    const parent = parentOid.toString();

    this.parentsCollection.save( {}, `commits/${commit.id().toString()}`, `commits/${parent}` );
  } );
} );
