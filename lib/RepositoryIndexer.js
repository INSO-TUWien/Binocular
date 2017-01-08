'use strict';

const path = require( 'path' );
const Promise = require( 'bluebird' );
const _ = require( 'lodash' );

const config = require( './config.js' );
const { db } = require( './context.js' );
const git = require( './git.js' );

function RepositoryIndexer( repoPath ) {
  this.repoPath = repoPath;
}

RepositoryIndexer.prototype.index = function() {
  
  const name = path.basename( path.dirname(this.repoPath) );
  const dbName = config.arango.database || name;

  return db.ensureDatabase( dbName )
  .bind( { repoPath: this.repoPath } )
  .then( () => db.ensureCollection('commits') )
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

module.exports = RepositoryIndexer;
