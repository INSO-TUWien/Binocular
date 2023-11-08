'use strict';

import ServiceProviderMock from './serviceProviderMock';

class GatewayMock {
  constructor() {
    this.serviceProvider = new ServiceProviderMock();
  }

  getServiceByType() {
    return this.serviceProvider;
  }
}

export default GatewayMock;
