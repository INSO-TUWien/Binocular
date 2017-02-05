'use strict';

const ctx = require( '../context.js' );

const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const Sequelize = ctx.sequelize.Sequelize;
const User = require( './User.js' );

const Commit = ctx.sequelize.define( 'Commit', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  message: Sequelize.STRING,
  signature: Sequelize.STRING,
  date: Sequelize.DATE
}, {
  timestamps: true,
  createdAt: false,
  updatedAt: 'cachedAt',

  instanceMethods: {
    persistFiles: function( nCommit ) {

      const Hunk = ctx.models.Hunk;

      return Promise.resolve( nCommit.getDiff() )
      .bind( this )
      .then( diffs => _.flatten(diffs) )
      .map( diff => diff.patches() )
      .then( patches => _.flatten(patches) )
      .map( function( patch ) {

        return this.createFile( {
          newPath: patch.newFile().path(),
          oldPath: patch.oldFile().path()
        } )
        .bind( {} )
        .then( function( file ) {

          return Promise.map( patch.hunks(), hunk => ({
            FileId: file.id,
            newLineCount: hunk.newLines(),
            oldLineCount: hunk.oldLines()
          }) );

        } )
        .then( function( hunkData ) {
          return Hunk.bulkCreate( hunkData );
        } );
      } );
      
    }
  },

  classMethods: {
    persist: function( nCommit ) {

      const sha = nCommit.id().toString();
      
      return Commit.findById( sha )
      .then( function( instance ) {
        if( !instance ) {

          return Commit.create( {
            id: sha,
            signature: nCommit.committer().toString(),
            date: nCommit.date(),
            message: nCommit.message()
          } )
          .tap( function( commit ) {
            return commit.persistFiles( nCommit );
          } )
          .then( commit => [commit, true] );
        }

        return [ instance, false ];
      } );
    },

    /**
     * Assign users to all commits that do not already have users assigned. If a commit with an unknown signature is
     * found, a new user is created for it.
     **/
    deduceUsers: function() {

      // walk through all commits
      return Commit.findAll( {
        where: { CommitterId: null }
      } )
      .map( function( commit ) {

        // try to get an already existing user with that signature
        return User.findOne( { where: { gitSignature: commit.signature } } )
        .then( function( user ) {
          if( !user ) {
            // user does not exist => create
            return User.create( { gitSignature: commit.signature } );
          }

          return user;
        } )
        .then( function( user ) {
          // assign the commit to the user
          return commit.update( { CommitterId: user.id } );
        } );
      }, { concurrency: 1 } );
    }
  }
} );

Commit.belongsTo( User, { as: 'Committer' } );
User.hasMany( Commit, { foreignKey: 'CommitterId' } );

module.exports = Commit;
