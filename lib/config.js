'use strict';

const fs = require( 'fs-extra-promise' );
const _ = require( 'lodash' );

const packageJson = require( '../package.json' );
const config = require( 'rc' )( packageJson.name, {
  port: 48763,
  arango: {
    host: 'localhost',
    port: 8529
  }
} );

module.exports = config;

config.update = function() {

  const data = _.pick( config, 'port', 'arango' );

  return fs.writeJsonAsync( config.config, data, { spaces: 2 } )
  .then( function() {
    emit( 'updated', config );
  } );
};

config.on = function( eventName, handler ) {
  listeners[eventName] = listeners[eventName] || [];

  listeners[eventName].push( handler );
};

function emit( eventName ) {

  const args = [].prototype.slice.call( arguments, 1 );

  _.each( listeners[eventName], handler => handler(...args) );
}

const listeners = {};
