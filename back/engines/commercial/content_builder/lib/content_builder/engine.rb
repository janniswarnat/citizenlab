# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module ContentBuilder
  class Engine < ::Rails::Engine
    isolate_namespace ContentBuilder

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      require 'content_builder/feature_specification'
      AppConfiguration::Settings.add_feature ::ContentBuilder::FeatureSpecification
    end
  end
end
