module HasNavigation

  def has_navigation options = {}
    send :include, Rails.application.routes.url_helpers # Include url helpers to generate default path.
    send :include, HasNavigation::Model                 # Include class & instance methods.

    has_one :resource_nav_item, as: :navigable, dependent: :destroy
  end

  module Model
    extend ActiveSupport::Concern

    module ClassMethods
    end

    def to_navigator options = {}
      options.merge! navigable: self

      title          = respond_to?(:title) ? title : "#{ self.class } - #{ self.id }"
      url            = polymorphic_path self
      admin_url      = edit_polymorphic_path [:admin, self] rescue koi_engine.edit_polymorphic_path self
      setting_prefix = settings_prefix if respond_to? :settings_prefix

      resource_nav_item = self.resource_nav_item.blank? ? ResourceNavItem.new : self.resource_nav_item
      resource_nav_item.attributes = options.merge title: title, url: url, admin_url: admin_url, setting_prefix: setting_prefix
      resource_nav_item
    end

    def to_navigator! options = {}
      navigator = to_navigator options
      return true if navigator.parent_id.blank?
      navigator.save ? navigator : false
    end
  end

end
