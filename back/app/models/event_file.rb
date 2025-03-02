# == Schema Information
#
# Table name: event_files
#
#  id         :uuid             not null, primary key
#  event_id   :uuid
#  file       :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string
#
# Indexes
#
#  index_event_files_on_event_id  (event_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class EventFile < ApplicationRecord
  EXTENSION_WHITELIST = %w(pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv)

  mount_base64_file_uploader :file, EventFileUploader
  belongs_to :event

  validates :event, :file, :name, presence: true
  validate :extension_whitelist


  private 

  def extension_whitelist
    if !EXTENSION_WHITELIST.include? self.name.split('.').last.downcase
      self.errors.add(
        :file,
        :extension_whitelist_error,
        message: 'Unsupported file extension'
      )
    end
  end
end
