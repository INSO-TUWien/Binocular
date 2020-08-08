require 'grpc'
require 'api/registration.service_services_pb'
require 'concurrent'
require 'logger'
require 'service/i_service'

module Binocular
  module Service
    class RegistrationService
      include Binocular::Service::IRegistrationService
      # initialises all needed data
      # @param [Binocular::Config] config contains the merged config file data
      # @param [GRPC::RpcServer] rpc_service contains the grpc server
      def initialize(config, rpc_service)
        @config = config
        @rpc_service = rpc_service
        @server_address = "#{config.data.dig('gateway','address')}:#{config.data.dig('gateway','port')}"
        @stub = Binocular::Comm::RegistrationService::Stub.new(@server_address, :this_channel_is_insecure)
        @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
        @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
        @token_mutex = Concurrent::ReentrantReadWriteLock.new
        @stop_mutex = Concurrent::ReentrantReadWriteLock.new
        @stop_mutex.with_write_lock {@stop = false}
        @token_mutex.with_write_lock {@token = nil}
        @semaphore = Concurrent::Semaphore.new(0)
      end

      def token
        @token_mutex.with_read_lock{@token}
      end

      # start listening service to connect to the gateway if it is available
      def start
        @stop_mutex.with_write_lock {@stop = false}
        Thread.new {
          until @stop_mutex.with_read_lock{@stop} do
            begin
              if @token_mutex.with_read_lock{@token.nil?}
                @logger.info("try to register to the server #{@server_address}")
                register
              else
                begin
                  heartbeat
                rescue GRPC::BadStatus
                  @logger.info("losing the connection to the gateway listen on #{@server_address}")
                  raise $!
                end
              end
              # hold until registration revoked
              @semaphore.try_acquire(1, @config.data.dig('gateway','heartbeat'))
              # drain all additionals
              @semaphore.acquire(@semaphore.available_permits)
            rescue GRPC::BadStatus
              error = $!
              # skip if error.code is connection refused
              if !error.nil? && error.code != 14
                @logger.error("The GRPC call failed with the following error #{error.code} and meessage: #{error.details}")
                # shutdown registration service
                self.stop
                # shutdown language service
                @rpc_service.stop
              else
                # wait until retry
                sleep(@config.data.dig('gateway','reconnect'))
              end
            end
          end
        }
      end

      # called if the gateway disconnects from this service
      def disconnect
        @token_mutex.with_write_lock {@token = nil}
        @logger.info("disconnected from the gateway listening on #{@server_address}")
        @semaphore.release
      end

      # stops the gateway connection service
      def stop
        @stop_mutex.with_write_lock {@stop = true}
        @semaphore.release
        unregister
      end

      private

      # try to connect to the gateway
      def register
        unless @token_mutex.with_read_lock{@token.nil?}
          return
        end

        client = Binocular::Comm::Client.new(address: @config.data.dig('languageService','address'), port: @config.data.dig('languageService','port'))
        request = Binocular::Comm::RegistrationRequest.new(client: client, type: Binocular::Comm::ServiceType::LanguageDetection)
        response = @stub.register(request)
        @token_mutex.with_write_lock {@token = response.token}
        @logger.info("register to the gateway listening on #{@server_address}")
      end

      # disconnect from the gateway
      def unregister
        token = @token_mutex.with_read_lock{@token}
        if token.nil?
          return
        end

        request = Binocular::Comm::UnregisterRequest.new(token: @token)
        begin
          @stub.unregister(request)
          @token_mutex.with_write_lock {@token = nil}
          @logger.info("unregister from the gateway listening on #{@server_address}")
          @semaphore.release
        rescue
          @token_mutex.with_write_lock {@token = nil}
          @semaphore.release
          raise $!
        end
      end

      # check gateway connection
      def heartbeat
        token = @token_mutex.with_read_lock{@token}
        if token.nil?
          return
        end

        request = Binocular::Comm::HeartbeatRequest.new(token: token)
        begin
          @stub.pulse(request)
          @logger.debug("heartbeat from the gateway listening on #{@server_address}")
        rescue GRPC::BadStatus
          error = $!
          # skip if error.code is connection refused
          if !error.nil? && error.code == 14
            @token_mutex.with_write_lock {@token = nil}
          end
          raise $!
        end
      end
    end
  end
end
