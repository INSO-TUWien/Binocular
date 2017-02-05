'use strict';

const ctx = require( '../context.js' );

const Sequelize = ctx.sequelize.Sequelize;
const File = require( './File.js' );
const User = require( './User.js' );
const Commit = require( './Commit.js' );

const BlameHunk = ctx.sequelize.define( 'BlameHunk', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  startLine: Sequelize.INTEGER,
  lineCount: Sequelize.INTEGER,
  signature: Sequelize.STRING
}, {
  timestamps: false,
  classMethods: {
    deduceUsers: function() {
      return User.findAll()
      .map( function( user ) {
        return BlameHunk.update( { AuthorId: user.id }, {
          where: {
            signature: user.gitSignature
          }
        } );
      } );
    }
  }
} );

BlameHunk.belongsTo( File );
File.hasMany( BlameHunk );

BlameHunk.belongsTo( Commit );
Commit.hasMany( BlameHunk );

File.belongsToMany( Commit, { through: BlameHunk } );
Commit.belongsToMany( File, { through: BlameHunk } );

BlameHunk.belongsTo( User, { as: 'Author' } );
User.hasMany( BlameHunk, { foreignKey: 'AuthorId' } );

module.exports = BlameHunk;
