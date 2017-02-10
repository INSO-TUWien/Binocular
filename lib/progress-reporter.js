'use strict';

const _ = require( 'lodash' );
const log = require( 'debug-log' )( 'ws' );

/**
 * Used to track progress of indexing operations.
 * Keeps an array of commits that is currently being processed at all times, sorted by commit date.
 * Before starting, the total number of commits must be set by calling `setCommitCount`.
 */
function ProgressReporter( io ) {
  
  this.commitsProcessed = 0;
  this.issuesProcessed = 0;
  this.commitCount = 0;
  this.issueCount = 0;
  this.dirty = true;

  this.sockets = [];

  io.on( 'connection', socket => {
    log( 'Client connected' );
    this.sockets.push( socket );


    socket.on( 'disconnect', () => {
      log( 'Client disconnected' );
      _.pull( this.sockets, socket );
    } );

    this.report();
  } );
}

ProgressReporter.prototype.report = _.throttle( function() {
  const report = this.getProgressReport();
  _.each( this.sockets, socket => socket.emit('action', { type: 'message', report }) );
}, 100 );

ProgressReporter.prototype.setCommitCount = function( n ) {
  this.commitCount = n;
  this.commitsProcessed = 0;
  this.dirty = true;
};

ProgressReporter.prototype.setIssueCount = function( n ) {
  this.issueCount = n;
  this.issuesProcessed = 0;
  this.dirty = true;
};

ProgressReporter.prototype.finishCommit = function() {

  this.commitsProcessed++;
  this.report();
};

ProgressReporter.prototype.finishIssue = function() {
  this.issuesProcessed++;
  this.report();
};

ProgressReporter.prototype.getProgressReport = function() {

  if( !this.dirty ) {
    return this.lastProgressReport;
  }

  this.lastProgressReport = {
    commits: {
      total: this.commitCount,
      processed: this.commitsProcessed
    },
    issues: {
      total: this.issueCount,
      processed: this.issuesProcessed
    }
  };


  return this.lastProgressReport;
};

module.exports = ProgressReporter;
