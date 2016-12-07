'use strict';

const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const arangojs = require( 'arangojs' );
const ArangoError = require( 'arangojs/lib/error.js' ).default;

const ERR_UNKNOWN_COLLECTION = 1203;

const Db = function( config ) {
  
  this.arango = arangojs( `http://${config.host}:${config.port}` );
  this.arango.useBasicAuth( config.user, config.password );
};

Db.prototype.ensureDatabase = function( name ) {
  return Promise.resolve( this.arango.listDatabases() )
  .bind( this )
  .then( function( dbs ) {
    if( !_.includes(dbs, name) ) {
      return db.createDatabase( name );
    }
  } )
  .tap( function() {
    this.arango.useDatabase( name );
  } );
};

Db.prototype.ensureCollection = function( name ) {
  const collection = this.arango.collection( name );

  return Promise.resolve( collection.get() )
  .catch( e => e.isArangoError && e.errorNum === ERR_UNKNOWN_COLLECTION, function( e ) {
    return collection.create();
  } )
  .thenReturn( collection );
}

module.exports = Db;
