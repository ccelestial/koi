class AddPrefixToTranslation < ActiveRecord::Migration[5.0]
  def up
    add_column   :translations, :prefix, :string
    remove_index :translations, :key
    add_index    :translations, [:locale, :prefix, :key], unique: true
  end

  def down
    remove_column :translations, :prefix
    remove_index  :translations, [:locale, :prefix, :key]
    add_index     :translations, :key, unique: true
  end
end
