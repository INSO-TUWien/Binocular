'use strict';

const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const Git = require( 'nodegit' );
const path = require( 'path' );
const eventToPromise = require( 'event-to-promise' );

function Repository( repo, path ) {
  this.repo = repo;
  this.path = path;
}

Repository.fromPath = function( path ) {
  return Promise.resolve( Git.Repository.open(path || '.') )
  .then( repo => Repository.fromRepo(repo) );
};

Repository.fromRepo = function( repo ) {
  return Promise.resolve( new Repository(repo, repo.path()) );
};

module.exports = Repository;

Repository.prototype.getAllCommits = function() {
    
  return Promise.resolve( this.repo.getReferences(Git.Reference.TYPE.OID) )
  .map( ref => this.getCommitsOfBranch(ref) )
  .then( _ )
  .call( 'flatten' )
  .call( 'uniqBy', c => c.id().toString() )
  .call( 'value' );
};

Repository.prototype.getRoot = function() {
  return path.resolve( this.path, '..' );
};

Repository.prototype.getName = function() {
  return path.basename( path.dirname(this.path) );
};

Repository.prototype.pathFromRoot = function( /* ...args */ ) {
  return path.resolve( this.getRoot(), ...arguments );
};

Repository.prototype.getCommitsOfBranch = function( ref ) {

  if( ref.isTag() ) {
    return [];
  }

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

Repository.prototype.getOriginUrl = function() {
  return Promise.resolve( this.repo.getRemote('origin') )
  .call( 'url' );
};
