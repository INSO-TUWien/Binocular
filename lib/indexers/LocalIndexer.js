'use strict';

const ctx = require( '../context.js' );
const log = require( 'debug-log' )( 'git' );

function LocalIndexer( repo ) {
  this.repo = repo;
  this.stopping = false;
}

LocalIndexer.prototype.index = function() {
  
  let omitCount = 0;
  let persistCount = 0;

  let total;
  return this.repo.getAllCommits()
  .bind( this )
  .tap( cs => log('Processing', cs.length, 'commits') )
  .tap( commits => total = commits.length )
  .reduce( function( t, commit ) {

    if( this.stopping ) {
      return;
    }

    return ctx.models.Commit.persist( commit )
    .spread( function( c, wasCreated ) {
      if( wasCreated ) {
        persistCount++;
      } else {
        omitCount++;
      }

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
