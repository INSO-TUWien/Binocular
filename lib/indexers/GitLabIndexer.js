'use strict';

const Promise = require( 'bluebird' );
const _ = require( 'lodash' );
const gitlab = require( 'node-gitlab' );

const config = require( '../config.js' );
const { db } = require( '../context.js' );

function GitLabIndexer( repo ) {
  this.repo = repo;
}

GitLabIndexer.prototype.configure = function( config ) {
  this.gitlab = gitlab.createPromise( { url: config.url, privateToken: config.token } );
};

GitLabIndexer.prototype.index = function() {

  const dbName = config.get().arango.database || this.repo.getName();
  let myUrl, issueCollection;
  let omitCount = 0;
  let persistCount = 0;

  return Promise.join(
    this.repo.getOriginUrl(),
    db.ensureDatabase( dbName ).then( () => db.ensureCollection('issues') )
  )
  .bind( this )
  .spread( function( url, collection ) {

    issueCollection = collection;
    myUrl = url;
    
    return this.gitlab.projects.list();
  } )
  .reduce( function( foundProject, project ) {

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if( project.ssh_url_to_repo === myUrl ) { 
      return project;
    }

    return foundProject;
  }, null )
  .then( function( project ) {
    return this.gitlab.issues.list( { id: project.id } );
  } )
  .map( function( issue ) {
    const key = issue.id.toString();
    return Promise.bind( this )
    .then( () => issueCollection.lookupByKeys([key]) )
    .then( function( c ) {
      if( c.length === 0 ) {
        persistCount++;
        issue._key = key;
        return issueCollection.save( issue );
      }

      omitCount++;
    } );
  } )
  .tap( function() {
    console.log( 'Persisted %d new issues (%d already present)', persistCount, omitCount );
  } );
};

module.exports = GitLabIndexer;

