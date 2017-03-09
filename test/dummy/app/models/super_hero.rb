class SuperHero < ActiveRecord::Base

  has_crud ajaxable: true,
           searchable: [:id, :name, :gender, :powers],
           orderable: false, settings: true,
           paginate: false

  # FIXME: Refactored from has
  has_many :images, as: :attributable
  accepts_nested_attributes_for :images, allow_destroy: true

  has_and_belongs_to_many :powers

  dragonfly_accessor :image
  dragonfly_accessor  :file

  scope :alphabetical, -> { order("name DESC") }

  default_scope -> { alphabetical }

  Gender = ["Male", "Female", "Robot"]
  Popularities = {
    popular: "Popular",
    unpopular: "Unpopular",
    hated: "Hated",
  }

  enum popularity: Popularities.keys

  validates :name, :description, presence: true

  crud.config do
    map image_uid: :image
    map file_uid:  :file

    fields image:                { type: :image },
           file:                 { type: :file },
           document_upload:      { type: :uploader, types: "pdf, xls, xlsx, doc, docx", max_size: 10 },
           document_upload_id:   { type: :uploader },
           image_upload:         { type: :uploader, croppable: true, ratio: "2/1" },
           image_upload_id:      { type: :uploader },
           gender:               { type: :select, data: Gender, size: :small },
           is_alive:             { type: :boolean },
           url:                  { type: :disabled, wrapper_data: { show: "super_hero_is_alive" } },
           last_location_seen:   { type: :latlng },
           powers:               { type: :multiselect_association },
           images:               { type: :inline },
           published_at:         { type: :date, size: :small },
           telephone:            { type: :readonly },
           popularity:           { type: :select, data: Popularities.invert }

    index  fields: [:name, :description, :published_at, :gender, :is_alive, :url,
                    :telephone]

    form   fields: [:name, :description, :published_at, :gender, :is_alive, :url,
                    :telephone]

    config :admin do
      actions only: [:show, :edit, :new, :destroy, :index]
      csv     except: [:image_name, :file_name]
      index   fields: [:created_at, :updated_at, :name, :gender, :is_alive, :image, :file],
              filters: [:is_alive, :gender, :created_at, :birthdate, :powers, :popularity]
              # order:  { name: :asc }
      form    fields: [:name, :description, :published_at, :gender, :is_alive, :url,
                       :last_location_seen, :telephone, :image, :file,
                       :image_upload, :document_upload, :powers, :popularity]
      show    fields: [:name, :description, :published_at, :gender, :is_alive, :url,
                       :last_location_seen, :telephone, :image, :file,
                       :image_upload_id, :document_upload_id, :powers]
      reportable true
      charts [{
        span:     :created_at,
        field:    :id,
        strategy: :count,
        colour:   '#f60',
        name:     'New Super Heros Created',
        renderer: 'bar'
      },{
        span:     :created_at,
        field:    :id,
        strategy: :sum,
        colour:   'black',
        name:     'Sum of Super Heros Created IDs with name Bob',
        scope:    :bob
      }]

      overviews [{
        span:     :created_at,
        name:     'Total Super Heros Created',
        period:   :all_time
      },{
        field:    :id,
        name:     'Super Heros Created in the Last Month',
        prefix:   '$'
      }, {
        period:   :weekly,
        field:    :id,
        name:     'Super Heros Created in the Last Week',
        postfix:  '%'
      }]
    end
  end

  def self.bob
    where(name: 'Bob')
  end

  def self.except_these_groups
    ["Tags", "SEO"]
  end

  def except_these_groups
    ["SEO"]
  end

  def cropped_image_upload
    begin
      if image_upload_crop.blank?
        Asset.find(image_upload_id).data
      else
        Asset.find(image_upload_id).data.thumb(image_upload_crop)
      end
    rescue ActiveRecord::RecordNotFound
      ""
    end
  end

  def to_s
    name
  end


  #
  # TO BE PULLED INTO has_crud/active_record.rb, probably in a module of its own, maybe Filterable
  #
  scope :filter, ->(params) {
    build_filter_conditions(params)
  }

  scope :filter_boolean, ->(attr, value) { where(:"#{attr}" => value) }
  scope :filter_select, ->(attr, values = []) {
    # strip values of blank strings
    values = values.reject(&:blank?)
    # if field is enum, get integers that represent the values
    if defined_enums.keys.include?(attr)
      # e.g. values = statuses.values_at('open', 'closed')
      values = send(attr.pluralize).values_at(*values)
    end
    # build query, e.g. where('my_table.my_attr = ? OR my_table.my_attr = ?', val1, val2)
    clause = values.map{ |v| "#{table_name}.#{attr} = ?" }.join(' OR ')
    where(clause, *values)
  }

  # expects hash of { before: datetime, after: datetime }
  scope :filter_datetime, ->(attr, values = {}) {
    current_scope.tap do |scope|
      scope.merge! after_datetime(attr, values[:after]) if values[:after].present?
      scope.merge! before_datetime(attr, values[:before]) if values[:before].present?
    end
  }

  scope :filter_multiselect_association, ->(attr, values = []) {
    # basically
    #   joins(:powers).where(powers: { id: values })
    # but using a subquery to avoid duplicate record issues
    query = joins(attr.to_sym)
              .where(attr => { id: values.reject(&:blank?) })
              .select(:id)
              .to_sql
    where("#{table_name}.id in (#{query})")
  }

  scope :after_datetime, ->(attr, datetime) {
    where("#{table_name}.#{attr} > ?", DateTime.parse(datetime))
  }

  scope :before_datetime, ->(attr, datetime) {
    where("#{table_name}.#{attr} < ?", DateTime.parse(datetime))
  }

  class << self

    def build_filter_conditions(params)
      params.each do |attr, value|
        field_definition = field_definitions[attr]
        field_type       = field_definition[:type] if field_definition.present?

        if can_filter_by?(field_type)
          current_scope.merge! send(filter_scope_name(field_type), attr, value)
        else
          current_scope.merge! guess_filter_scope(attr, value)
        end
      end

      current_scope
    end

    def guess_filter_scope(attr, value)
      case guess_field_type_for_filter(attr)
      when "boolean"
        filter_boolean(attr, value)
      when 'datetime'
        filter_datetime(attr, value)
      when 'date'
        filter_datetime(attr, value)
      when 'multiselect_association'
        filter_multiselect_association(attr, value)
      else
        all
      end
    end

    def guess_field_type_for_filter(attr)
      type = ''
      # if attr is a regular column
      if column_names.include?(attr)
        sql_type = columns_hash[attr.to_s].sql_type
        if sql_type.include?('timestamp')
          type = 'datetime'
        else
          type = sql_type
        end
      # else if it's a has_and_belongs_to_many association
      elsif reflect_on_all_associations(:has_and_belongs_to_many).any?{ |a| a.name == attr.to_sym }
        type = 'multiselect_association'
      end
      type
    end

    def can_filter_by?(field_type)
      respond_to?(filter_scope_name(field_type), true) # `true` here ensures that it'll search for private methods
    end

    def filter_scope_name(field_type)
      "filter_#{field_type}"
    end

  end


end
