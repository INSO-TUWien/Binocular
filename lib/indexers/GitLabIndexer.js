'use strict';

const gitlab = require( 'node-gitlab' );

const ctx = require( '../context.js' );

function GitLabIndexer( repo ) {
  this.repo = repo;
}

GitLabIndexer.prototype.configure = function( config ) {
  this.gitlab = gitlab.createPromise( { url: config.url, privateToken: config.token } );
};

GitLabIndexer.prototype.index = function() {

  const Issue = ctx.models.Issue;
  let myUrl;
  let omitCount = 0;
  let persistCount = 0;

  return this.repo.getOriginUrl()
  .bind( this )
  .then( function( url ) {

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

    return Issue.persist( issue )
    .spread( function( issue, wasCreated ) {
      if( wasCreated ) {
        persistCount++;
      } else {
        omitCount++;
      }
    } );
    
  } )
  .tap( function() {
    console.log( 'Persisted %d new issues (%d already present)', persistCount, omitCount );
  } );
};

module.exports = GitLabIndexer;

