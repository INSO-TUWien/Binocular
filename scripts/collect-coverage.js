#!/usr/bin/env node

'use strict';

const serverCoverage = require( '../coverage/server/coverage.json' );
const uiCoverage = require( '../coverage/ui/coverage-final.json' );
const _ = require( 'lodash' );

let totalStatements = 0;
let coveredStatements = 0;

const stats = {
  s: { total: 0, covered: 0 },
  b: { total: 0, covered: 0 },
  f: { total: 0, covered: 0 }
};

_.each( [serverCoverage, uiCoverage], function( coverage) {

  _.each( coverage, function( info, file ) {

    collect( 's', info );
    collect( 'b', info );
    collect( 'f', info );
  } )
} );

console.log( 'Overall coverage:' );
console.log( 'Statements:', format(stats.s) );
console.log( 'Branches:', format(stats.b) );
console.log( 'Functions:', format(stats.f) );

function format( stats ) {
  return (Math.round( (stats.covered / stats.total) * 10000 ) / 100) + '%';
}


function collect( type, info ) {
  _.each( info[type], function( v ) {

    if( Array.isArray(v) ) {
      _.each( v, function( v ) {
        stats[type].total++;
        stats[type].covered += v;
      } );
    } else {
      stats[type].total++;
      stats[type].covered += v;
    }
  } );
}

// _.map( [serverCoverage, uiCoverage], function( coverage ) {
  
//   const totalCoverage = _.reduce( coverage, function( total, info, file ) {

//     return {
//       s: total.s + collectSingle( info.s ),
//       b: total.b + collectSingle( info.b ),
//       f: total.f + collectSingle( info.f )
//     }
//   }, { s: 0, b: 0, f: 0 } );

  
//   const n = _.keys( coverage ).length;
//   totalCoverage.s = totalCoverage.s / n;
//   totalCoverage.b = totalCoverage.b / n;
//   totalCoverage.f = totalCoverage.f / n;

//   console.log( `Statements: ${totalCoverage.s}` );
//   console.log( `Branches: ${totalCoverage.b}` );
//   console.log( `Functions: ${totalCoverage.f}` );
  
// } );

// function collectSingle( coverageData ) {
//   const total = _.reduce( coverageData, function( total, v ) {
//     return total + v;
//   }, 0 );

//   return total / _.keys(coverageData).length;
// }
