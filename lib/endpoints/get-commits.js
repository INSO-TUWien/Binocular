'use strict';

const { models } = require( '../context.js' );

module.exports = function( req, res ) {

  const Commit = models.Commit;
  const File = models.File;
  const Hunk = models.Hunk;

  return Commit.findAll( {
    order: ['date'],
    include: [ {
      model: File,
      include: [Hunk]
    } ]
  } )
  .then( function( result ) {
    res.json( result );
  } );
};
