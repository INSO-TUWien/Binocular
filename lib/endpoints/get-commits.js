'use strict';

const { db } = require( '../context.js' );

module.exports = function( req, res ) {
  
  return db.query( {
    query: 'FOR c IN commits RETURN c'
  } )
  .call( 'all' )
  .then( function( result ) {
    res.json( result );
  } );
};
