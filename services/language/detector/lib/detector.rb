# frozen_string_literal: true

require 'rugged'
require 'json'
require 'linguist'
require 'config/config'
require 'service/i_service'
require 'logger'
require 'grpc'

module Binocular
  class Detector
    include Binocular::Service::IService
    # @param [Binocular::Config] config contains the merged config file data
    # @param [Binocular::Service::IRegistrationService] registration_service contains the gateway communication service
    # @param [Binocular::Service::ILanguageService] language_service contains the service
    #                                              that holds the grpc communication for language detection
    def initialize(config, registration_service, language_service)
      @config = config
      @registration_service = registration_service
      @language_service = language_service
      @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
      @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
    end

    # start gateway communication and language server
    def start
      begin
        begin
          @registration_service.start
          @language_service.start
        rescue GRPC::BadStatus
          error = $!
          @logger.error("The GRPC call failed with the following error #{error.code} and meessage: #{error.details}")
        end
      rescue SystemExit, Interrupt
        # ignored for graceful shutdown
      end
    end

    # stop all services and stops the detection service
    def stop
      begin
        @logger.info("stopping service...")
        @registration_service.stop
        @language_service.stop
        @logger.info("service stopped!")
      rescue GRPC::BadStatus
        error = $!
        @logger.warn("The GRPC call failed with the following error #{error.code} and meessage: #{error.details}")
      end
    end
  end
end
