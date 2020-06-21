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
  class Detector
    # @param [Binocular::Config] config contains the merged config file data
    # @param [Binocular::Service::Registration] registration_service contains the gateway communication service
    # @param [Binocular::Service::LanguageService] language_service contains the language
    #                                              that holds the grpc communication for language detection
    def initialize(config, registration_service, language_service)
      @config = config
      @registration_service = registration_service
      @language_service = language_service
      @logger = Logger.new(config.data.dig('languageService','logger', 'file'))
      @logger.level = Logger::Severity.const_get(config.data.dig('languageService','logger', 'level'))
    end

    # start gateway communication and language server
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

    # stop all services and stops the detection service
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