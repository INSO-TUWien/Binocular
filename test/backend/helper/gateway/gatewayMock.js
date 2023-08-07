'use strict';

const ServiceProviderMock = require('./serviceProviderMock');

class GatewayMock {
  constructor() {
    this.serviceProvider = new ServiceProviderMock();
  }

  getServiceByType() {
    return this.serviceProvider;
  }
}

module.exports = GatewayMock;
