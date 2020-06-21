require 'pathname'
require 'json'
require 'hash_deep_merge'

module Binocular
  class Config

    # merge all config files together
    def initialize(files)
      @data = defaults.to_hash
      files&.each do |file|
        config = JSON.parse(File.read(file))
        @data.deep_merge!(config)
      end
    end

    # @return [Hash] read access
    attr_reader :data

    private

    # @return [Hash] default settings
    def defaults
      {
        'gateway' => {
          'address' => '127.0.0.1',
          'port' => 48_764,
          'timeout' => 30,
          'reconnect' => 60,
          'heartbeat' => 300,
          'logger' => {
              'level' => 'INFO',
              'file' => STDOUT
          }
        },
        'languageService' => {
            'address' => '127.0.0.1',
            'port' => 48_765,
            'timeout' => 30,
            'logger' => {
                'level' => 'INFO',
                'file' => STDOUT
            }
        }
      }
    end

    # @param [String] create and initialises the configuration, referring to nodejs rc json
    # @return [Config]
    def self.create_config(appname, path)
      root = Pathname.new('/')
      home = Pathname.new(ENV['HOME'])
      path = Pathname.new(path).expand_path
      Config.new(get_config_path(home, root, appname, path))
    end

    # check in path for existing files
    def self.get_config_path(home, root, appname, path)
      unless appname.nil?
        [travel(appname, path),
         home.join(".#{appname}rc"),
         home.join(".#{appname}", 'config'),
         home.join('.config', appname),
         home.join('.config', appname, 'config'),
         root.join('etc', ".#{appname}rc"),
         root.join('etc', ".#{appname}", 'config')].flatten.keep_if(&:exist?)
      end
    end

    # search until root dir for the app rc file
    def self.travel(appname, path)
      path = Pathname.new(path)
      files = config_path(appname, path)
      if files.nil?
        travel(appname, path.parent) else files end
    end

    # check if rc file exists
    def self.config_path(appname, path)
      path = Pathname.new(path)
      [path.join(".#{appname}rc"),
       path.join(".#{appname}", 'config')].keep_if(&:exist?)
    end
  end
end
