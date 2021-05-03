# frozen_string_literal: true

module Binocular
  module Service
    # Basic interface
    module IService
      def start
        raise 'Interface not implemented!'
      end

      def stop
        raise 'Interface not implemented!'
      end
    end

    # Interface for registration
    module IRegistrationService
      include IService

      def disconnect
        raise 'Interface not implemented!'
      end

      def token
        raise 'Interface not implemented!'
      end
    end

    module ILanguageService
      include IService
    end
  end
end
