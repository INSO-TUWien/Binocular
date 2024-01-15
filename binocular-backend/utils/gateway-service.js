import * as grpc from '@grpc/grpc-js';
import path from 'path';
import crypto from 'crypto';
import * as protoLoader from '@grpc/proto-loader';
import IllegalArgumentError from '../errors/IllegalArgumentError.js';
import debug from 'debug';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = debug('service:gateway');

const commPath = path.resolve(__dirname, '../..', 'services', 'grpc', 'comm');

const RegistrationPackageDefinition = protoLoader.loadSync(path.join(commPath, 'registration.service.proto'), {
  enums: String,
  defaults: true,
});

const RegistrationComm = grpc.loadPackageDefinition(RegistrationPackageDefinition).binocular.comm;
const ipParser = /^ipv[46]:(.*?):\d+$/;

class GatewayService {
  constructor() {
    this.register = {};

    let _reindexing = false;

    this.isIndexing = () => {
      return _reindexing;
    };

    this.startIndexing = () => {
      _reindexing = true;
    };

    this.stopIndexing = () => {
      _reindexing = false;
    };
  }

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

    serviceTypesRegistration.bind(this)();
    createRegistrationHandler.bind(this)();
  }

  /**
   * start the registration service
   *
   * @returns {Promise<void>}
   */
  async start() {
    this.server.bindAsync(`0.0.0.0:${this.config.port}`, grpc.ServerCredentials.createInsecure(), (e, port) => {
      console.log(`Gateway is running at http://0.0.0.0:${port}`);
      return this.server.start();
    });
  }

  /**
   * generate a new token depending on the config secret
   *
   * @param value contains the value that has to be hashed
   * @returns {string} returns the created token
   */
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
    return Promise.all([...this.services.map(this.disconnectService), new Promise((resolve) => this.server.tryShutdown(resolve))])
      .then(() => (this.services.length = 0))
      .catch((error) => {
        console.error(`The following error occurred during gateway shutdown: ${error ? error.toString() : 'Unknown error!'}`);
      });
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

    return new Promise((resolve, reject) =>
      service.comm.disconnect({ token: service.token }, (error, response) => (error ? reject(error) : resolve(response))),
    );
  }

  getServicesByType(type) {
    return this.services.filter((srv) => srv.type === type);
  }

  *getServiceByType(type) {
    const services = this.services.filter((srv) => srv.type === type);
    if (services.length < 1 || !this.register[type]) {
      return null;
    }
    // adjust balancer if needed
    const balancer = this.register[type].loadingBalancer % services.length;
    this.register[type].loadingBalancer = this.register[type].loadingBalancer + (1 % services.length);
    return yield services[balancer];
  }

  getServiceByToken(token) {
    const serviceList = this.services.filter((srv) => srv.token === token);
    return serviceList && serviceList.length > 0 ? serviceList : null;
  }

  addServiceHandler(type, service) {
    if (!this.register[type]) {
      throw new IllegalArgumentError(`the type "${type}" does not exist!`);
    }

    if (this.register[type].handler === null && typeof service === 'function') {
      this.register[type].handler = service;
    }
  }
}

export default GatewayService;

/**
 * add all service types to the registration handler
 */
function serviceTypesRegistration() {
  const serviceTypes = RegistrationComm.ServiceType.type;
  if (!serviceTypes) {
    return;
  }
  const types = serviceTypes.value || [];
  types.slice(1).forEach((type) => {
    if (type && type.name) {
      this.register[type.name] = { loadingBalancer: 0, handler: null, counter: 0 };
    }
  });
}

/**
 * add all specified grpc service server calls
 */
function createRegistrationHandler() {
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
      return this.services.find((srv) => srv.token === params.request.token)
        ? callback(null, {})
        : callback({ code: status.INVALID_ARGUMENT, details: 'Heartbeat failed!' });
    },
    disconnect: (params, callback) => {
      // client implementation
      return callback({
        code: status.UNIMPLEMENTED,
        details: 'Client side implementation!',
      });
    },
  });
}

/**
 * add a new service to the gateway
 *
 * @param params contains the grpc request parameters
 * @returns {{token: *}}
 */
function registration(params) {
  if (!params.request.type) {
    throw { code: status.INVALID_ARGUMENT, message: 'Valid service type has to be specified!' };
  }

  if (!params.request.client) {
    throw { code: status.INVALID_ARGUMENT, message: 'Valid client has to be specified!' };
  }

  const service = createConnection.bind(this)(params);

  if (service.exist) {
    throw { code: status.ALREADY_EXISTS, message: 'This service has already been added!' };
  }
  delete service.exist;

  this.services.push(service);

  // setup client to communicate with remote service
  if (typeof this.register[service.type].handler === 'function') {
    this.register[service.type].handler(service);
  }
  this.register[service.type].counter++;

  log(`${service.type} disconnected from ${service.address}[${service.domain}] with the token "${service.token}"`);
  console.log(`${service.type} connected to current gateway!`);

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
    throw { code: status.NOT_FOUND, message: 'This service does not exist!' };
  }

  let unregister;
  this.services = this.services.filter((srv) => !(srv && srv.token === service.token && (unregister = srv)));

  if (unregister) {
    delete unregister.comm;
    this.register[unregister.type].counter--;
    log(`${unregister.type} connected from ${unregister.address}[${service.domain}] with the token "${unregister.token}"`);
    console.log(`${unregister.type} disconnected from current gateway!`);
  }
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
    throw { code: status.FAILED_PRECONDITION, message: 'cannot fetch a valid ip address!' };
  }

  const service = {
    address: address ? address[1] : params.call.getPeer(),
    domain: params.domain,
    client: params.request.client,
    type: params.request.type,
  };

  service.token = params.request.token ? params.request.token : this.generateToken(JSON.stringify(service));

  service.exist = !!this.services.find(
    (srv) => srv.address === service.address && srv.domain === service.domain && srv.token === service.token,
  );

  return service;
}
