'use strict';

const ctx = require( '../context.js' );

const Sequelize = ctx.sequelize.Sequelize;

const User = ctx.sequelize.define( 'User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  gitlabId: Sequelize.INTEGER,
  gitlabName: Sequelize.STRING,
  gitlabUrl: Sequelize.STRING,
  gitSignature: Sequelize.STRING
}, {
  timestamps: true,
  createdAt: false,
  updatedAt: 'cachedAt',

  classMethods: {
  }
} );

module.exports = User;
