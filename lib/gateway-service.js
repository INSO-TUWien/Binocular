const grpc = require('grpc');
const path = require('path');
const crypto = require('crypto');
const protoLoader = require('@grpc/proto-loader');
const IllegalArgumentError = require('./errors/IllegalArgumentError');
const commPath = path.resolve(__dirname, '..', 'services', 'grpc', 'comm');

const RegistrationPackageDefinition = protoLoader.loadSync(path.join(commPath, 'registration.service.proto'), {
  enums: String,
  defaults: true
});

const LanguageDetectorPackageDefinition = protoLoader.loadSync(path.join(commPath, 'language.service.proto'), {
  enums: String
});
const RegistrationComm = grpc.loadPackageDefinition(RegistrationPackageDefinition).binocular.comm;
const LanguageComm = grpc.loadPackageDefinition(LanguageDetectorPackageDefinition).binocular.comm;
const LanguageDetectionService = LanguageComm.LanguageDetectionService;
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

    this.server.addService(RegistrationComm.RegistrationService.service, {
      register: registerHandler,
      unregister: unregisterHandler,
      pulse: (params, callback) => {
        // client implementation
        return this.services.find(srv => srv.token === params.request.token)
          ? callback(null, {})
          : callback({
              code: grpc.status.INVALID_ARGUMENT,
              details: 'Heartbeat failed!'
            });
      },
      disconnect: (params, callback) => {
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

  /**
   * notify and disconnect from all services and stop gateway
   *
   * @returns {Promise<Promise|Promise<number>>}
   */
  async stop() {
    this.stopping = true;
    return Promise.all([...this.services.map(this.disconnectService), new Promise(resolve => this.server.tryShutdown(resolve))]).then(
      () => (this.services.length = 0)
    );
  }

  /**
   * sends the service a disconnect notification so that it can try to reconnect
   *
   * @param service contains a valid service
   * @returns {Promise<*>}
   */
  async disconnectService(service) {
    if (!service || !service.comm || typeof service.comm.disconnect !== 'function') {
      throw new IllegalArgumentError('Requires valid service to send disconnect to the service!');
    }

    return new Promise(resolve => service.comm.disconnect({ token: service.token }, resolve));
  }

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

  if (!params.request.client) {
    throw { code: grpc.status.INVALID_ARGUMENT, message: 'Valid client has to be specified!' };
  }

  const service = createConnection.bind(this)(params);

  if (service.exist) {
    throw { code: grpc.status.ALREADY_EXISTS, message: 'This service has already been added!' };
  }
  delete service.exist;

  // setup client to communicate with language detection service
  if (service.type === 'LanguageDetectionService') {
    service.comm = new LanguageDetectionService(`${service.client.address}:${service.client.port}`, grpc.credentials.createInsecure());
  }

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
