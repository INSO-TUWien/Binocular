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

  let myUrl;

  return this.repo.getOriginUrl()
  .bind( this )
  .then( function( url ) {

    myUrl = url;
    
    return this.gitlab.projects.list();
  } )
  .reduce( function( foundProject, project ) {

    if( project.ssh_url_to_repo === myUrl ) {
      return project;
    }

    return foundProject;
  }, null )
  .then( function( project ) {
    return this.gitlab.issues.list( { id: project.id } );
  } )
  .then( function( issues ) {
    console.log( issues );
  } );
};

module.exports = GitLabIndexer;

