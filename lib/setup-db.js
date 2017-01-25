'use strict';

const _ = require( 'lodash' );
const Sequelize = require( 'sequelize' );

const ctx = require( './context.js' );
    
const repoName = ctx.repo.getName();

ctx.sequelize = new Sequelize( repoName, repoName, repoName, {
  dialect: 'sqlite',
  storage: ctx.repo.pathFromRoot( '.pupil', 'db.sqlite' ),
  pool: {
    max: 1,
    min: 1
  },
  logging: () => null
} );

_.each( ['Commit', 'File', 'Hunk', 'Issue'], function( name ) {
  ctx.models[name] = require( `./models/${name}.js` );
} );


ctx.sequelize.sync();
