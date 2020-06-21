require 'pathname'
require 'json'
require 'hash-deep-merge'

module Binocular
  class Config
    def initialize(files)
      @config = defaults
      files&.each do |file|
        config = JSON.parse(File.read(file))
        @config.deep_merge(config)
      end
    end

    # @return [Hash]
    attr_reader :config

    private

    # @return []
    def defaults
      {
        'gateway' => {
          'address' => '127.0.0.1',
          'port' => 48_764
        }
      }
    end

    # @param [String] appname
    # @return [Config]
    def self.create_config(appname, path)
      root = Pathname.new('/')
      home = Pathname.new(ENV['HOME'])
      path = Pathname.new(path).expand_path
      Config.new(get_config_path(home, root, appname, path))
    end

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

    def self.travel(appname, path)
      path = Pathname.new(path)
      files = config_path(appname, path)
      if files.nil?
        travel(appname, path.parent) else files end
    end

    def self.config_path(appname, path)
      path = Pathname.new(path)
      [path.join(".#{appname}rc"),
       path.join(".#{appname}", 'config')].keep_if(&:exist?)
    end
  end
end
