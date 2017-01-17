'use strict';

const Promise = require( 'bluebird' );
const _ = require( 'lodash' );

const config = require( '../config.js' );
const { db } = require( '../context.js' );

function LocalIndexer( repo ) {
  this.repo = repo;
}

LocalIndexer.prototype.index = function() {
  
  const dbName = config.get().arango.database || this.repo.getName();
  let omitCount = 0;
  let persistCount = 0;

  return db.ensureDatabase( dbName )
  .bind( this )
  .then( () => db.ensureCollection('commits') )
  .then( function( commitCollection ) {
    this.commitCollection = commitCollection;

    return this.repo.getAllCommits();
  } )
  .map( function( commit ) {

    const sha = commit.id().toString();

    return Promise.bind( this )
    .then( () => this.commitCollection.lookupByKeys([sha]) )
    .then( function( c ) {

      if( c.length === 0 ) {
        persistCount++;
        return saveCommit( this.commitCollection, commit );
      } else {
        omitCount++;
      }
    } )
    .thenReturn( commit );
  } )
  .tap( function() {
    console.log( 'Persisted %d new commits (%d already present)', persistCount, omitCount );
  } );
};

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
  } );
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
    };
  } );
}

module.exports = LocalIndexer;
