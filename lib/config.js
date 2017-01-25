'use strict';

const fs = require( 'fs-extra-promise' );
const _ = require( 'lodash' );
const Promise = require( 'bluebird' );

const packageJson = require( '../package.json' );

let config = loadConfig();
let source;

module.exports = {

  get: () => config,

  update: function( newConfig ) {
    const data = _.pick( newConfig, 'port', 'arango', 'gitlab' );

    console.log( 'Writing new config to', source );
    console.log( newConfig );
    return fs.writeJsonAsync( source, data, { spaces: 2 } )
    .then( function() {
      delete require.cache.rc;

      config = loadConfig();
    } )
    .then( function() {
      return emit( 'updated', config )
      .catch( e => console.log(e) );
    } )
    .then( () => config );
    
  },

  ensure: function( key, value ) {
    if( !_.has(config, key) ) {
      _.set( config, key, value );
    }
  },

  on: function( eventName, handler ) {
    listeners[eventName] = listeners[eventName] || [];
    listeners[eventName].push( handler );
  },

  setSource: function( newSource ) {
    source = newSource;
  }
};


function emit( eventName ) {

  const args = [].slice.call( arguments, 1 );

  return Promise.map( listeners[eventName], handler => handler(...args) );
}

function loadConfig() {
  const config = require( 'rc' )( packageJson.name, {
    port: 48763
  } );
  
  return config;
}

const listeners = {};
