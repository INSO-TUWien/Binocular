'use strict';

const ctx = require( '../context.js' );

function LocalIndexer( repo ) {
  this.repo = repo;
}

LocalIndexer.prototype.index = function() {
  
  let omitCount = 0;
  let persistCount = 0;


  return this.repo.getAllCommits()
  .bind( this )
  .map( function( commit ) {

    return ctx.models.Commit.persist( commit )
    .spread( function( c, wasCreated ) {
      if( wasCreated ) {
        persistCount++;
      } else {
        omitCount++;
      }
    } );
  } )
  .tap( function() {
    console.log( 'Persisted %d new commits (%d already present)', persistCount, omitCount );
  } );
};


module.exports = LocalIndexer;
