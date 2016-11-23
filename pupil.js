#!/usr/bin/env node

'use strict';

require( './lib/context.js' );

const _ = require( 'lodash' );
const git = require( './lib/git.js' );

git.getAllCommits( '.' )
.map( function( commit ) {
  const header = _.head( _.split(commit.message(), '\n', 2) );
  console.log( `${commit.id()} ${header}` );
} );
