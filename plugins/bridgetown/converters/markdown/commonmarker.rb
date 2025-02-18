class Bridgetown::Converters::Markdown::Commonmarker
  def initialize(config)
    require "commonmarker"
    @config = config
  rescue LoadError
    STDERR.puts 'You are missing a library required for Markdown. Please run:'
    STDERR.puts '  $ [sudo] gem install commonmarker'
    raise RuntimeError.new("Missing dependency: commonmarker")
  end

  def convert(content)
    CommonMarker.render_html(content)
  end
end
