'use strict';

const _ = require( 'lodash' );
const log = require( 'debug-log' )( 'ws' );

/**
 * Used to track progress of indexing operations.
 * Keeps an array of commits that is currently being processed at all times, sorted by commit date.
 * Before starting, the total number of commits must be set by calling `setCommitCount`.
 */
function ProgressReporter( io ) {
  
  this.commits = [];
  this.commitCount = 0;
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
  this.dirty = true;
};

ProgressReporter.prototype.beginCommit = function( commit ) {

  const data = _.defaults( { progress: 0 }, extractCommitData(commit) );
  const i = _.sortedIndexBy( this.commits, data, c => c.date );

  this.commits.splice( i, 0, data );
  this.dirty = true;
  this.report();
};

ProgressReporter.prototype.finishCommit = function( commit ) {

  const data = extractCommitData( commit );
  const i = _.sortedIndexBy( this.commits, data, c => c.date );

  this.commits[i].progress = 1;
  this.report();
};

ProgressReporter.prototype.getProgressReport = function() {

  if( !this.dirty ) {
    return this.lastProgressReport;
  }

  if( this.commits.length === 0 ) {
    return makePlaceholders( this.commitCount );
  }

  if( this.commits.length === 1 ) {
    const leftCount = Math.floor( this.commitCount/2 );
    const rightCount = this.commitCount - leftCount - 1;

    return [...makePlaceholders(leftCount), this.commits[0], ...makePlaceholders(rightCount)];
  }

  const first = _.first( this.commits );
  const last = _.last( this.commits );

  const toDistribute = this.commitCount - this.commits.length;
  const span = last.date.getTime() - first.date.getTime();
  const d = span / toDistribute;

  const report = [first];

  let nextPlaceholder = d;

  let i = 1;
  let nextCommit = this.commits[i];

  while( report.length < this.commitCount - 1 ) {

    if( !nextCommit || nextCommit === last || nextPlaceholder < nextCommit.date.getTime() ) {
      report.push( { progress: 0 } );
      nextPlaceholder += d;
    } else {
      report.push( nextCommit );
      i++;
      nextCommit = this.commits[i];
    }
  }

  report.push( last );

  this.lastProgressReport = report;

  return report;
};

module.exports = ProgressReporter;

function extractCommitData( nodegitCommit ) {
  return {
    date: nodegitCommit.date(),
    sha: nodegitCommit.id()
  };
}

function makePlaceholders( n ) {
  return _.map( new Array(n), () => ({ progress: 0 }) );
}
