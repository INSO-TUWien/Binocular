
require 'grpc'
require 'api/language.service_services_pb'
require 'service/registration'

module Binocular
  module Service
    class LanguageService < Binocular::Comm::LanguageDetectionService::Service
      def initialize(config, register, rpc_handler)
        @register = register
        @rpc_handler  = rpc_handler
        @config = config

        @server_address = "#{config.data.dig('languageService','address')}:#{config.data.dig('languageService','port')}"
        @rpc_handler.add_http2_port(@server_address, :this_port_is_insecure)
        @rpc_handler.handle(self)
        @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
        @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
      end

      def listen
        @logger.info("Start language service listening on #{@server_address}")
        @rpc_handler.run_till_terminated_or_interrupted([1, 'int', 'SIGQUIT'])
        @logger.info("Stopped language service...")
      end

      def disconnect(token, _call)
        unless @register.token == token
          @register.disconnect
        end
      end
    end
  end
end