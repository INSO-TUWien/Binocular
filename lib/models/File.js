'use strict';

const ctx = require( '../context.js' );

const Sequelize = ctx.sequelize.Sequelize;

const File = ctx.sequelize.define( 'File', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  path: Sequelize.STRING
}, {
  timestamps: false,

  classMethods: {
    ensure: function( path ) {
      return File.findOne( { where: { path } } )
      .then( function( file ) {
        if( !file ) {
          return File.create( { path } );
        }

        return file;
      } );
    }
  }
} );

module.exports = File;
