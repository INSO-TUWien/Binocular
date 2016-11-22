'use strict';

const Promise = require( 'bluebird' );
const { db } = require( '../lib/context.js' );

describe('should correctly parse the config', function() {

  beforeEach( function() {
    return db.cypherAsync( { query: 'MATCH (n) DETACH DELETE n' } );
  } );

  it( 'should work', function() {
    return Promise.resolve();
  } );

} );
