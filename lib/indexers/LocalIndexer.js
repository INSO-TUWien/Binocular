'use strict';

const ctx = require( '../context.js' );

function LocalIndexer( repo ) {
  this.repo = repo;
}

LocalIndexer.prototype.index = function() {
  
  let omitCount = 0;
  let persistCount = 0;


  let total;
  return this.repo.getAllCommits()
  .bind( this )
  .tap( commits => total = commits.length )
  .map( function( commit ) {

    return ctx.models.Commit.persist( commit )
    .spread( function( c, wasCreated ) {
      if( wasCreated ) {
        persistCount++;
      } else {
        omitCount++;
      }

      console.log( `${omitCount + persistCount}/${total} commits processed` );
    } );
  } )
  .tap( function() {
    console.log( 'Persisted %d new commits (%d already present)', persistCount, omitCount );
  } );
};


module.exports = LocalIndexer;
