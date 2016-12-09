#!/usr/bin/env node

'use strict';

require( './lib/context.js' );

const _ = require( 'lodash' );
const Promise = require( 'bluebird' ); 
const git = require( './lib/git.js' );
const path = require( 'path' );

const { app, db, argv } = require( './lib/context.js' );
const config = require( './lib/config.js' );

app.listen( config.port, function() {
  console.log( `Pupil listening on http://localhost:${config.port}` );
  if( argv.ui && argv.open ) {
    opn( `http://localhost:${config.port}/` );
  }
} );
