'use strict';

const _ = require( 'lodash' );
const Sequelize = require( 'sequelize' );
const sqlFormatter = require( 'sql-formatter' );
const fs = require( 'fs-extra-promise' );

const log = require( 'debug-log' )( 'db' );
const sqlog = require( 'debug-log' )( 'sql' );

const SQL_MESSAGE = /^Execut(?:ed|ing) \(.*?\): (.*)$/;

const ctx = require( './context.js' );
    
const repoName = ctx.repo.getName();

fs.ensureDirSync( ctx.repo.pathFromRoot('.pupil') );

ctx.sequelize = new Sequelize( repoName, repoName, repoName, {
  dialect: 'sqlite',
  storage: ctx.repo.pathFromRoot( '.pupil', 'db.sqlite' ),
  pool: {
    max: 1,
    min: 1
  },
  logging: sqlFormattingLog
} );

_.each( ['Commit', 'File', 'Issue', 'BlameHunk'], function( name ) {
  ctx.models[name] = require( `./models/${name}.js` );
} );


ctx.sequelize.sync();

function sqlFormattingLog( msg ) {

  const matches = msg.match( SQL_MESSAGE );

  if( matches ) {
    const sql = sqlFormatter.format( matches[1] );

    sqlog( sql );
  } else {
    log( msg );
  }
  
}
