#!/usr/bin/env node

'use strict';

const ctx = require( './lib/context.js' );

const opn = require( 'opn' );
const Promise = require( 'bluebird' );

const Repository = require( './lib/git.js' );
const { app, argv } = require( './lib/context.js' );
const config = require( './lib/config.js' );
const LocalIndexer = require( './lib/indexers/LocalIndexer.js' );
const GitLabIndexer = require( './lib/indexers/GitLabIndexer.js' );

app.get( '/commits', require('./lib/endpoints/get-commits.js') );
app.get( '/config', require('./lib/endpoints/get-config.js') );
app.post( '/config', require('./lib/endpoints/update-config.js') );

const port = config.get().port;

app.listen( port, function() {
  console.log( `Pupil listening on http://localhost:${port}` );
  if( argv.ui && argv.open ) {
    opn( `http://localhost:${port}/` );
  }
} );

let localIndexer, gitlabIndexer;

Repository.fromPath()
.then( function( repo ) {
  ctx.repo = repo;

  require( './lib/setup-db.js' );

  localIndexer = new LocalIndexer( repo );
  gitlabIndexer = new GitLabIndexer( repo );

  return guessGitLabApiUrl( repo );
} )
.delay( 2500 )
.then( function( url ) {

  config.setSource( ctx.repo.pathFromRoot('.pupilrc') );
  config.ensure( 'gitlab.url', url );

  config.on( 'updated', reIndex );

  return reIndex();

  function reIndex() {

    gitlabIndexer.configure( config.get().gitlab );

    return Promise.join(
      localIndexer.index()/* ,
      gitlabIndexer.index()
      */
    )
    .then( () => ctx.models.Commit.deduceUsers() )
    .then( () => ctx.models.Issue.deduceUsers() )
    .then( () => ctx.models.BlameHunk.deduceUsers() )
    .catch( e => e.name === 'Gitlab401Error', function() {
      console.warn( 'Unable to access GitLab API. Please configure a valid private access token in the UI.' );
    } );
  }
} )
.then( function() {
  return guessGitLabApiUrl( ctx.repo );
} );


function guessGitLabApiUrl( repo ) {
  return repo.getOriginUrl()
  .then( function( url ) {
    const match = url.match( /git@(.*):(.*)\/(.*)\.git/ );
    if( match ) {
      return `https://${match[1]}`;
    } else {
      return 'https://gitlab.com';
    }
  } );
}
