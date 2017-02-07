'use strict';

const _ = require( 'lodash' );
const Sequelize = require( 'sequelize' );
const sqlFormatter = require( 'sql-formatter' );
const fs = require( 'fs-extra-promise' );

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
  logging: () => null // sqlLog
} );

_.each( ['Commit', 'File', 'Issue', 'BlameHunk'], function( name ) {
  ctx.models[name] = require( `./models/${name}.js` );
} );


ctx.sequelize.sync();

const SQL_MESSAGE = /^Execut(?:ed|ing) \(.*?\): (.*)$/;

function sqlLog( msg ) {

  const matches = msg.match( SQL_MESSAGE );

  if( matches ) {
    const message = sqlFormatter.format( matches[1] );

    console.log( message );
  } else {
    console.log( msg );
  }
  
}
