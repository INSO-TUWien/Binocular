'use strict';

const config = require( '../config.js' );

module.exports = function( req, res )  {
  res.json( config );
};
