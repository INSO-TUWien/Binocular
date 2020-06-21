
require 'grpc'
require 'api/language.service_services_pb'
require 'service/registration'

module Binocular
  module Service
    class LanguageService < Binocular::Comm::LanguageDetectionService::Service
      
      # initialises all needed data
      # @param [Binocular::Config] config contains the merged config file data
      # @param [Binocular::Service::Registration] register contains the gateway communication service
      # @param [GRPC::RpcServer] rpc_service contains the grpc server
      def initialize(config, register, rpc_service)
        @register = register
        @rpc_service  = rpc_service
        @config = config

        @server_address = "0.0.0.0:#{config.data.dig('languageService','port')}"
        @rpc_service.add_http2_port(@server_address, :this_port_is_insecure)
        @rpc_service.handle(self)
        @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
        @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
      end

      # start the language detection service to listen for grpc requests
      def listen
        @logger.info("Start language service listening on #{@server_address}")
        @rpc_service.run_till_terminated_or_interrupted([1, 'int', 'SIGQUIT'])
        @logger.info("Stopped language service...")
      end

      def close
        @rpc_service.stop
      end

      # disconnects this service if the token is equal
      # @param [Binocular::Comm::UnregisterRequest] request contains the token that has to be equal to the register token received from the gateway once
      def disconnect(request, _unused_call)
        if @register.token == request.token
          @register.disconnect
          return Binocular::Comm::UnregisterResponse.new
        end
        raise GRPC::BadStatus.new(GRPC::Core::StatusCodes::INVALID_ARGUMENT, "The provided token does not match with the one provided by the gateway!")
      end
    end
  end
end