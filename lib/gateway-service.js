const grpc = require('grpc');
const path = require('path');
const crypto = require('crypto');
const protoLoader = require('@grpc/proto-loader');
const _ = require('lodash');

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, '..', 'services', 'grpc', 'comm', 'registration.service.proto'));
const registrationService = grpc.loadPackageDefinition(packageDefinition);
const ipParser = /^ipv[46]:(.*?):\d+$/;

class GatewayService {
  constructor() {}

  async configure(config) {
    if (this.server) {
      await this.stop();
    }
    this.stopping = false;
    this.server = new grpc.Server();
    this.services = [];
    this.config = config;

    const register = (requestHandler, callback) => {
      return Promise.resolve(registration.bind(this)(requestHandler))
        .then(result => callback(null, result))
        .catch(error => callback(error));
    };

    this.server.addService(registrationService.comm.RegistrationService.service, {
      register,
      unregister: (requestHandler, callback) => {
        return callback(null, { signature: requestHandler.request.token });
      },
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

  generateSignature(value) {
    return crypto.createHmac('sha256', this.config.token).update(value).digest('hex');
  }

  isStopping() {
    return this.stopping;
  }

  async stop() {
    this.stopping = true;
    return new Promise(resolve => this.server.tryShutdown(resolve()));
  }
}

/**
 * add a new service to the gateway
 *
 * @param params contains the grpc request parameters
 * @returns {Promise<{signature: *}>}
 */
async function registration(params) {
  const address = ipParser.exec(params.call.getPeer());

  if (address && address.length < 2) {
    throw { code: grpc.status.FAILED_PRECONDITION, message: 'cannot fetch a valid ip address!' };
  }

  const service = {
    address: address ? address[1] : params.call.getPeer(),
    domain: params.domain,
    signature: this.generateSignature(params.request.token)
  };

  if (_.find(this.services, service)) {
    throw { code: grpc.status.ALREADY_EXISTS, message: 'This service has already been added!' };
  }

  this.services.push(service);

  return { signature: service.signature };
}

module.exports = GatewayService;
