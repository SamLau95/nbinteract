guard 'jekyll-plus', serve: true do
  watch /Guardfile/
  watch /_config.yml/
  directories %w(docs)
  watch /.*/
  ignore /^_site/
end

guard 'livereload' do
  directories %w(docs)
  watch /.*/
end
