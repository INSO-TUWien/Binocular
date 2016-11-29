'use strict';

const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const Git = require( 'nodegit' );
const eventToPromise = require( 'event-to-promise' );

const getCommitsOfBranch = function( ref ) {
  return Promise.resolve( Git.Commit.lookup(this.repo, ref.target()) )
  .bind( {} )
  .then( function( commit ) {

    const history = [commit];
    const emitter = commit.history( Git.Revwalk.SORT.NONE );

    emitter.on( 'commit', function( ancestor ) {
      history.push( ancestor );
    } );

    emitter.start();

    return eventToPromise( emitter, 'end' )
    .then( () => history );
  } );
};

module.exports = {
  getAllCommits: function( repoPath ) {
    
    return Promise.resolve( Git.Repository.open( repoPath ) )
    .bind( {} )
    .then( function( repo ) {
      this.repo = repo;
      return repo.getReferences( Git.Reference.TYPE.OID );
    } )
    .map( getCommitsOfBranch )
    .then( _ )
    .call( 'flatten' )
    .call( 'uniqBy', c => c.id().toString() )
    .call( 'value' );
  },
  
  getRepoPath: function() {
    return Git.Repository.open( '.' )
    .then( repo => repo.path() );
  }
};


