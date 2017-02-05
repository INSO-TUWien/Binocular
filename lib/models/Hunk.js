'use strict';

const ctx = require( '../context.js' );

const Sequelize = ctx.sequelize.Sequelize;
const File = require( './File.js' );

const Hunk = ctx.sequelize.define( 'Hunk', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  oldLineCount: Sequelize.INTEGER,
  newLineCount: Sequelize.INTEGER
}, {
  timestamps: false
} );

Hunk.belongsTo( File );
File.hasMany( Hunk );

module.exports = Hunk;
