'use strict';

export function endpointUrl( suffix ) {
  return getBaseUrl() + suffix;
}

export function getBaseUrl() {
  return `${window.location.protocol}//${window.location.host}/api/`;
}
