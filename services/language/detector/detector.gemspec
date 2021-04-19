# frozen_string_literal: true

require File.expand_path('lib/version', __dir__)

Gem::Specification.new do |s|
  s.name    = 'binocular-language-detector'
  s.version = ENV['GEM_VERSION'] || Binocular::Service::VERSION
  s.summary = 'Binocular language detection service'
  s.description = 'We use this library at Binocular to detect blob languages.'

  s.authors  = 'THMv1TU'
  s.homepage = 'https://github.com/INSO-TUWien/Binocular'
  s.license  = 'MIT'
  s.metadata = {
      'github_repo' => 'https://github.com/INSO-TUWien/Binocular.git'
  }

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  s.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^((test|spec|features|.bundle)/|binocular-language-detector.*\.gem)}) }
  end
  s.bindir        = 'bin'
  s.executables   = s.files.grep(%r{^bin/}) { |f| File.basename(f) }
  s.require_paths = %w[lib lib/api]

  s.add_dependency 'charlock_holmes', '~> 0.7.7'
  s.add_dependency 'escape_utils',    '~> 1.2.0'
  s.add_dependency 'github-linguist', '~> 7.12.2'
  s.add_dependency 'hash-deep-merge', '~> 0.1.1'
  s.add_dependency 'mini_mime',       '~> 1.0'
  s.add_dependency 'rugged',          '~> 0.25.1'
  s.add_dependency 'grpc',            '~> 1.28.0'
  s.add_dependency 'grpc-tools',      '~> 1.28.0'
  s.add_dependency 'concurrent-ruby', '~> 1.1.6'

  s.add_development_dependency 'bundler', '~> 2.1.4'
  s.add_development_dependency 'color-proximity', '~> 0.2.1'
  s.add_development_dependency 'minitest', '~> 5.0'
  s.add_development_dependency 'rake', '~> 13.0.1'
end
