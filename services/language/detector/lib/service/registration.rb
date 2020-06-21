require 'grpc'
require 'api/registration.service_services_pb'
require 'concurrent'
require 'logger'


module Binocular
  module Service
    class Registration

      # initialises all needed data
      # @param [Binocular::Config] config contains the merged  config file data
      def initialize(config)
        @config = config
        @server_address = "#{config.data.dig('gateway','address')}:#{config.data.dig('gateway','port')}"
        @stub = Binocular::Comm::RegistrationService::Stub.new(@server_address, :this_channel_is_insecure)
        @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
        @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
      end

      attr_reader :token

      # start listening service to connect to the gateway if it is available
      def listen
        @connector = Concurrent::TimerTask.new(run_now: true) do
          @logger.debug("registration tick")

          # if connection already exist
          unless @token.nil?
            return
          end

          @logger.info("try to register to the server #{@server_address}")
          begin
            register
          rescue GRPC::BadStatus
            error = $!
            # skip if error.code is connection refused
            if error.nil? || error.code != 14
              raise error
            end
          end
        end
        unless @connector.nil?
          @connector.execute
        end
        nil
      end

      # called if the gateway disconnects from this service
      def disconnect
        @token = nil
      end

      # stops the gateway connection service
      def close
        @connector = nil
      end

      # try to connect to the gateway
      def register
        unless @token.nil?
          return
        end

        client = Binocular::Comm::Client.new(address: @config.data.dig('languageService','address'), port: @config.data.dig('languageService','port'))
        request = Binocular::Comm::RegistrationRequest.new(client: client, type: Binocular::Comm::ServiceType::LanguageService)
        response = @stub.register(request)
        @token = response.token
        @logger.info("register to the gateway listening on #{@server_address}")
      end

      # disconnect from the gateway
      def unregister
        if @token.nil?
          return
        end

        request = Binocular::Comm::UnregisterRequest.new(token: @token)
        begin
          @stub.unregister(request)
          @token = nil
          @logger.info("unregister from the gateway listening on #{@server_address}")
        rescue
          @token = nil
          raise $!
        end
      end
    end
  end
end