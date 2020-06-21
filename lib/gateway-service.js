const grpc = require('grpc');
const path = require('path');
const crypto = require('crypto');
const protoLoader = require('@grpc/proto-loader');
const _ = require('lodash');

const PackageDefinition = protoLoader.loadSync(path.resolve(__dirname, '..', 'services', 'grpc', 'comm', 'registration.service.proto'), {
  enums: String
});
const RegistrationService = grpc.loadPackageDefinition(PackageDefinition);
const ipParser = /^ipv[46]:(.*?):\d+$/;

class GatewayService {
  constructor() {}

  /**
   * setup and start grpc service to handle requests
   *
   * @param config
   * @returns {Promise<void>}
   */
  async configure(config) {
    if (this.server) {
      await this.stop();
    }
    this.stopping = false;
    this.server = new grpc.Server();
    this.services = [];
    this.config = config;

    const registerHandler = (requestHandler, callback) => {
      try {
        return callback(null, registration.bind(this)(requestHandler));
      } catch (error) {
        return callback(error);
      }
    };

    const unregisterHandler = (requestHandler, callback) => {
      try {
        return callback(null, unregister.bind(this)(requestHandler));
      } catch (error) {
        return callback(error);
      }
    };

    this.server.addService(RegistrationService.binocular.comm.RegistrationService.service, {
      register: registerHandler,
      unregister: unregisterHandler,
      disconnect: (requestHandler, callback) => {
        // client implementation
        return callback({
          code: grpc.status.UNIMPLEMENTED,
          details: 'Client side implementation!'
        });
      }
    });

    const port = this.server.bind(`0.0.0.0:${config.port}`, grpc.ServerCredentials.createInsecure());
    console.log(`Gateway is running at http://0.0.0.0:${port}`);
    this.server.start();
  }

  generateToken(value) {
    return crypto.createHmac('sha256', this.config.token).update(value).digest('hex');
  }

  isStopping() {
    return this.stopping;
  }

  async stop() {
    this.stopping = true;
    return new Promise(resolve => this.server.tryShutdown(resolve));
  }

  async disconnectService(service) {}

  getServicesByType(type) {
    return this.services.filter(srv => srv.type === type);
  }

  getServiceByToken(token) {
    const serviceList = this.services.filter(srv => srv.token === token);
    return serviceList && serviceList.length > 0 ? serviceList : null;
  }
}

module.exports = GatewayService;

/**
 * add a new service to the gateway
 *
 * @param params contains the grpc request parameters
 * @returns {{token: *}}
 */
function registration(params) {
  if (!params.request.type) {
    throw { code: grpc.status.INVALID_ARGUMENT, message: 'Valid service type has to be specified!' };
  }

  const service = createConnection.bind(this)(params);

  if (service.exist) {
    throw { code: grpc.status.ALREADY_EXISTS, message: 'This service has already been added!' };
  }
  delete service.exist;

  this.services.push(service);

  return { token: service.token };
}

/**
   * removes a service from the gateway
   *
   * @param params contains the grpc request parameters
   */
function unregister(params) {
  const service = createConnection.bind(this)(params);

  if (!service.exist) {
    throw { code: grpc.status.NOT_FOUND, message: 'This service does not exist!' };
  }

  this.services = this.services.filter(srv => srv.signature !== service.signature && srv.type !== service.type);
}

/**
   * create connection for service handling
   *
   * @param params contains registration service request
   * @returns {{address: (*), domain, client:{}, token}}
   */
function createConnection(params) {
  const address = ipParser.exec(params.call.getPeer());

  if (address && address.length < 2) {
    throw { code: grpc.status.FAILED_PRECONDITION, message: 'cannot fetch a valid ip address!' };
  }

  const service = {
    address: address ? address[1] : params.call.getPeer(),
    domain: params.domain,
    client: params.request.client,
    type: params.request.type
  };

  service.token = params.request.token ? params.request.token : this.generateToken(JSON.stringify(service));

  service.exist = !!this.services.find(
    srv => srv.address === service.address && srv.domain === service.domain && srv.token === service.token
  );

  return service;
}
