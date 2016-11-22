#!/usr/bin/env node

'use strict';

const db = require( './lib/context.js' ).db;

db.cypherAsync( { query: 'MATCH (n) DETACH DELETE n' } )
.then( function( results ) {
  console.log( results );
} );
