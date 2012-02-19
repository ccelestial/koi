module HasCrud
  module ActionController
    module CrudAdminAdditions
      def self.included(base)
        base.send :extend, ClassMethods
        base.send :include, InstanceMethods
        base.send :helper_method, :sort_column, :sort_direction, :page_list,
                  :search_fields, :is_searchable?, :is_sortable?, :is_ajaxable?,
                  :per_page
        base.send :respond_to, :html, :js
      end

      module ClassMethods
      end

      module InstanceMethods
        def sort
          order = params[singular_name(:symbol)]
          resource_class.orderable(order)
          render :text => nil
        end

        def create
          create! do |success, failure|
            success.html { redirect_to redirect_path }
          end
        end

        def update
          update! do |success, failure|
            success.html { redirect_to redirect_path }
          end
        end

        def redirect_path
          if params[:commit].eql?("Continue")
            edit_resource_path
          elsif @site_parent || (resource.respond_to?(:resource_nav_item) && resource.resource_nav_item)
            sitemap_nav_items_path
          else
            collection_path
          end
        end

        def per_page
          resource_class.crud.find(:admin, :per_page) || resource_class.options[:paginate]
        end

        def page_list
          resource_class.crud.find(:admin, :page_list) || resource_class.options[:page_list]
        end

      protected

        def singular_name(to_sym=false)
          name = resource_class.to_s.underscore
          to_sym ? name : name.to_sym
        end

        def plural_name(to_sym=false)
          name = singular_name(:symbol).pluralize
          to_sym ? name : name.to_sym
        end

        def is_allowed?(action)
          actions = [:index, :new, :edit, :destroy]
          actions = (resource_class.crud.find(:admin, :actions, :only) ||
                     (actions - Array(resource_class.crud.find(:admin, :actions, :except)).flatten))
          Array(actions).flatten.include? action
        end

        def is_paginated?
          !!per_page
        end

        def is_orderable?
          resource_class.options[:orderable]
        end

        def is_sortable?
          resource_class.options[:sortable]
        end

        def search_fields
          resource_class.options[:searchable]
        end

        def is_searchable?
          !!search_fields
        end

        def is_ajaxable?
          resource_class.options[:ajaxable]
        end

        def collection
          return get_collection_ivar if get_collection_ivar
          if is_orderable?
            set_collection_ivar end_of_association_chain.ordered
          elsif is_searchable?
            set_collection_ivar end_of_association_chain.search_for(params[:search])
                                                        .order(sort_column + " " + sort_direction)
                                                        .scoped
          else
            set_collection_ivar end_of_association_chain.order(sort_column + " " + sort_direction)
                                                        .scoped
          end
          get_collection_ivar
        end

        def create_resource(object)
          @site_parent = params[:site_parent] if params[:site_parent].present?
          result = object.save
          if result
            #FIXME: hacky way to handle associations
            parent.send(plural_name.to_sym) << object if respond_to? :parent
            object.to_navigator!(parent_id: params[:site_parent]) if object.respond_to? :to_navigator
          end
          result
        end

        def update_resource(object, attributes)
          result = object.update_attributes(*attributes)
          if result
            object.to_navigator! if object.respond_to? :to_navigator
          end
          return result
        end

        def sort_column
          resource_class.column_names.include?(params[:sort]) ? params[:sort] : "id"
        end

        def sort_direction
          %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
        end
      end
    end
  end
end
