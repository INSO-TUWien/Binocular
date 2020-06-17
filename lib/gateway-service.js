const grpc = require('grpc');
const path = require('path');

const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, '..', 'services', 'grpc', 'comm', 'registration.service.proto'));
const registrationService = grpc.loadPackageDefinition(packageDefinition);

class GatewayService {
  constructor() {}

  async configure(config) {
    this.server = new grpc.Server();

    this.server.addService(registrationService.comm.RegistrationService.service, {
      register: (requestHandler, callback) => {
        return callback(null, { reply: `Hi ${requestHandler.request.greeting}!` });
      },
      unregister: (requestHandler, callback) => {
        return callback(null, { reply: `Hi ${requestHandler.request.greeting}!` });
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

  isStopping() {
    return this.stopping;
  }

  async stop() {
    this.stopping = true;
    return new Promise(resolve => this.server.tryShutdown(resolve()));
  }
}

module.exports = GatewayService;
