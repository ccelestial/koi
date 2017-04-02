# desc "Explaining what the task does"
# task :koi do
#   # Task goes here
# end

# react_on_rails compilation tasks
# https://shakacode.gitbooks.io/react-on-rails/content/docs/additional-reading/rails-engine-integration.html
# Rake.application.remove_task('react_on_rails:assets:compile_environment')
Rake.application.instance_variable_get('@tasks').delete('react_on_rails:assets:compile_environment')
task 'react_on_rails:assets:compile_environment' do
  path = File.join(Koi::Engine.root, 'client')
  sh "cd #{path} && #{ReactOnRails.configuration.npm_build_production_command}"
end