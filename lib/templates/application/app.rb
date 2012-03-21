# Setup rvm
create_file '.rvmrc', <<-END
rvm use ruby-1.9.2-p290@koi-gem --create
END

# Nested fields
gem 'awesome_nested_fields'     , :git => 'git://github.com/katalyst/awesome_nested_fields.git'

# Koi Config
gem 'koi_config'                , :git => 'git://github.com/katalyst/koi_config.git'

# Koi CMS
gem 'koi'                       , :git => 'git://github.com/katalyst/koi.git'

gem_group :development do
  # Ruby debugger
  gem 'ruby-debug19'            , :require => 'ruby-debug'
  # Engineyard
  gem 'engineyard'
  # Console
  gem 'powder'
end

application(nil, :env => 'development') do
  "config.action_mailer.default_url_options = { :host => 'localhost:3000' }"
end

# Create Version File
create_file 'VERSION', <<-END
1.0.0
END

# Setup database yml
run 'rm config/database.yml'
create_file 'config/database.yml', <<-END
development:
  adapter: mysql2
  encoding: utf8
  reconnect: false
  host: localhost
  database: #{@app_name}_development
  pool: 5
  username: root
  password: katalyst

test:
  adapter: mysql2
  encoding: utf8
  reconnect: false
  host: localhost
  database: #{@app_name}_test
  pool: 5
  username: root
  password: katalyst
END

# Setup seed
run 'rm db/seeds.rb'
create_file 'db/seeds.rb', <<-END
Koi::Engine.load_seed
END

# Setup seed
run 'rm app/controllers/application_controller.rb'
create_file 'app/controllers/application_controller.rb', <<-END
class ApplicationController < ActionController::Base
  protect_from_forgery

  layout :layout_by_resource

protected

  # FIXME: Hack to set layout for admin devise resources
  def layout_by_resource
    if devise_controller? && resource_name == :admin
      "koi/devise"
    else
      "application"
    end
  end

  # FIXME: Hack to redirect back to admin after admin login
  def after_sign_in_path_for(resource_or_scope)
    resource_or_scope.is_a?(Admin) ? koi_engine.root_path : super
  end

  # FIXME: Hack to redirect back to admin after admin logout
  def after_sign_out_path_for(resource_or_scope)
    resource_or_scope == :admin ? koi_engine.root_path : super
  end
end
END

run 'bundle install'


# Install Migrations
rake 'koi:install:migrations'

route "mount Koi::Engine => '/admin', as: 'koi_engine'"

run 'rm public/index.html'

rake 'db:drop'
rake 'db:create'

# Generate Devise Config
generate('devise:install')

route "root to: 'pages#index'"

route 'resources :pages'

create_file 'config/navigation.rb', <<-END
# -*- coding: utf-8 -*-
# Configures your navigation
SimpleNavigation.register_renderer :sf_menu => SfMenuRenderer
SimpleNavigation::Configuration.run do |navigation|
end
END

create_file 'app/renderers/sf_menu_renderer.rb', <<-END
class SfMenuRenderer < SimpleNavigation::Renderer::List
  def render(item_container)
    item_container.dom_class = options.delete(:dom_class) if options.has_key?(:dom_class)
    item_container.dom_id = options.delete(:dom_id) if options.has_key?(:dom_id)
    item_container.items.each { |i| p i.html_options = { link: options[:link] } } if options.has_key?(:link)
    super
  end
end
END

# Setup Date Time formats
create_file 'config/Initializers/datetime_formats.rb', <<-END
Time::DATE_FORMATS[:pretty] = lambda { |time| time.strftime("%a, %b %e at %l:%M") + time.strftime("%p").downcase }
Date::DATE_FORMATS[:default] = "%d %b %Y"
Time::DATE_FORMATS[:default] = "%a, %b %e at %l:%M %p"
Time::DATE_FORMATS[:short] = "%d.%m.%Y"
END

create_file 'config/Initializers/koi.rb', <<-END
# FIXME: Explicity require all main app controllers
Dir.glob("app/controllers/admin/**/*.rb").each { |c| require c }

Koi::Menu.items = {
  'Pages' => '/admin/pages',
  'Admins' => '/admin/site_users'
}
END

rake 'db:migrate'
rake 'db:seed'

# Setup up Git
run 'rm .gitignore'
file '.gitignore', <<-END
# Ignore bundler config
/.bundle

# Ignore the default SQLite database.
/db/*.sqlite3

# Ignore all logfiles and tempfiles.
/log/*.log
/tmp

# Ignore database yaml file
/config/database.yml

# Mac DS Store
.DS_Store

# System
public/system/**/*

# Ignore SASS cache files
.sass-cache/

# Ignore compiled assets
/public/assets
END

git :init
git :add => '.'
git :commit => "-m 'Initial Commit'"
