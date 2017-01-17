'use strict';

const BACKEND_PORT = 48763;

export function endpointUrl( suffix ) {
  return getBaseUrl() + suffix;
}

export function getBaseUrl() {
  return window.location.protocol + '//' + window.location.host.split( ':' )[0] + `:${BACKEND_PORT}/`;
}
