'use strict';

const ctx = require( '../context.js' );
const log = require( 'debug-log' )( 'git' );

function LocalIndexer( repo, reporter ) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

LocalIndexer.prototype.index = function() {
  
  let omitCount = 0;
  let persistCount = 0;

  let total;
  return this.repo.getAllCommits()
  .bind( this )
  .tap( function( commits ) {
    total = commits.length;
    this.reporter.setCommitCount( total );
    log( 'Processing', commits.length, 'commits' );
  } )
  .reduce( function( t, commit ) {

    if( this.stopping ) {
      return;
    }

    this.reporter.beginCommit( commit );

    return ctx.models.Commit.persist( commit )
    .bind( this )
    .spread( function( c, wasCreated ) {
      if( wasCreated ) {
        persistCount++;
      } else {
        omitCount++;
      }

      this.reporter.finishCommit( commit );

      log( `${omitCount + persistCount}/${total} commits processed` );
    } );
  }, null )
  .tap( function() {
    log( 'Persisted %d new commits (%d already present)', persistCount, omitCount );
  } );
};

LocalIndexer.prototype.stop = function() { 
  this.stopping = true;
};


module.exports = LocalIndexer;
