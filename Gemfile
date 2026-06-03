source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# Exclude problematic versions of cocoapods and activesupport that causes build failures.
# Upgraded for Ruby 4.0 compatibility — old CocoaPods 1.15.x uses `kconv` which was removed.
gem 'cocoapods', '>= 1.16.2'
gem 'activesupport', '>= 6.1.7.5', '!= 7.1.0'

# Ruby 3.4.0 / 4.0 removed some libraries from the standard library.
gem 'bigdecimal'
gem 'logger'
gem 'benchmark'
gem 'mutex_m'
