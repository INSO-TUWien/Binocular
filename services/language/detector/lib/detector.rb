# frozen_string_literal: true

require 'rugged'
require 'json'
require 'linguist'
require 'config/config'
require 'service/registration'
require 'service/language_service'
require 'logger'
require 'grpc'

module Binocular
  module Service
    class Detector
      def initialize(config, registration_service, language_service)
        @config = config
        @registration_service = registration_service
        @language_service = language_service
        @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
        @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
      end

      def listen
        begin
          begin
            @registration_service.listen
            @language_service.listen
          rescue GRPC::BadStatus
            error = $!
            @logger.error("The GRPC call failed with the following error #{error.code} and meessage: #{error.details}")
          end
        rescue SystemExit, Interrupt
          # ignored for graceful shutdown
        end

      end
      def stop
        begin
          @logger.info("stopping service...")
          @registration_service.close
          @registration_service.unregister
          @logger.info("service stopped!")
        rescue GRPC::BadStatus
          error = $!
          @logger.warn("The GRPC call failed with the following error #{error.code} and meessage: #{error.details}")
        end
      end
    end
  end
end