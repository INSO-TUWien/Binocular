'use strict';

const ctx = require( '../context.js' );
const Commit = require( './Commit.js' );

const Sequelize = ctx.sequelize.Sequelize;

const File = ctx.sequelize.define( 'File', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  newPath: Sequelize.STRING,
  oldPath: Sequelize.STRING
}, {
  timestamps: false
} );

File.belongsTo( Commit );
Commit.hasMany( File );

module.exports = File;
