'use strict';

/* jshint expr: true */

const _ = require( 'lodash' );
const sinon = require( 'sinon' );
const chai = require( 'chai' );

const ProgressReporter = require( '../lib/progress-reporter.js' );

const expect = chai.expect;
const fake = require( './fake.js' );

describe( 'ProgressReporter', function() {
  let p, on;

  beforeEach( function() {
    on = sinon.spy();
    p = new ProgressReporter( { on } );
  } );

  it( 'should put a single commit into the middle of the report', function() {
    p.setCommitCount( 5 );

    const c = new FakeCommit( 7 );
    p.beginCommit( c );

    expectReport( p, [null, null, c, null, null] );
  } );

  it( 'should keep two commits at opposite ends of the report', function() {

    p.setCommitCount( 5 );

    const c6 = new FakeCommit( 6 );
    p.beginCommit( c6 );
    expectReport( p, [null, null, c6, null, null] );

    const c7 = new FakeCommit( 7 );
    p.beginCommit( c7 );
    expectReport( p, [c6, null, null, null, c7] );
  } );

  it( 'should correctly distribute commits based on their value in the report', function() {

    p.setCommitCount( 11 );

    const c1 = new FakeCommit( 1 );
    p.beginCommit( c1 );
    expectReport( p, [null, null, null, null, null, c1, null, null, null, null, null] );

    const c5 = new FakeCommit( 5 );
    p.beginCommit( c5 );
    expectReport( p, [c1, null, null, null, null, null, null, null, null, null, c5] );

    const c2 = new FakeCommit( 2 );
    p.beginCommit( c2 );
    expectReport( p, [c1, null, null, null, c2, null, null, null, null, null, c5] );

    const c11 = new FakeCommit( 11 );
    p.beginCommit( c11 );
    expectReport( p, [c1, null, c2, null, null, c5, null, null, null, null, c11] );

  } );

  it( 'should handle larger amounts of commits correctly', function() {

    const COUNT = 10000;

    p.setCommitCount( COUNT );
    
    const ordered = _.range( COUNT ).map( n => new FakeCommit(n) );
    const shuffled = fake.shuffle( _.clone(ordered) );

    _.each( shuffled, function( c ) {
      p.beginCommit( c );
    } );

    expectReport( p, ordered );
  } );

  it( 'should correctly handle completion for commits', function() {

    p.setCommitCount( 5 );

    const c1 = new FakeCommit( 1 );
    p.beginCommit( c1 );
    expectReport( p, [null, null, c1, null, null] );

    const c6 = new FakeCommit( 6 );
    p.beginCommit( c6 );
    expectReport( p, [c1, null, null, null, c6] );
    
    const c3 = new FakeCommit( 3 );
    p.beginCommit( c3 );
    expectReport( p, [c1, null, c3, null, c6] );
    expect( p.getProgressReport()[2] ).to.have.property( 'progress', 0 );

    p.finishCommit( c3 );
    expectReport( p, [c1, null, c3, null, c6] );
    expect( p.getProgressReport()[2] ).to.have.property( 'progress', 1 );
  } );
} );

function expectReport( p, array ) {

  const report = p.getProgressReport();
  expect( report ).to.have.length( array.length );

  _.each( array, function( c, i ) {

    if( c ) {
      expect( report[i] ).to.have.property( 'sha', c.sha );
    } else {
      expect( report[i] ).to.deep.equal( { progress: 0 } );
    }
  } );

}

function FakeCommit( n ) {
  this._date = new FakeDate( n );
  this.sha = fake.hex( 16 );
}

FakeCommit.prototype.date = function() {
  return this._date;
};

FakeCommit.prototype.id = function() {
  return this.sha;
};

function FakeDate( n ) {
  this.n = n;
}

FakeDate.prototype.getTime = function() {
  return this.n;
};

FakeDate.prototype.valueOf = function() {
  return this.n;
};

