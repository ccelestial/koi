class AddSlugToAssets < ActiveRecord::Migration
  def change
    add_column :assets, :slug, :string
  end
end
