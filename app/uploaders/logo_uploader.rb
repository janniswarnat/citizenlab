class LogoUploader < BaseImageUploader
  
  def store_dir
    tenant = Tenant.find_by(host: model.host)
    "uploads/#{tenant.id}/logo/#{model.id}"
  end

  version :small do
    process resize_to_limit: [nil,40]
  end

  version :medium do
    process resize_to_limit: [nil,80]
  end

  version :large do
    process resize_to_limit: [nil,160]
  end

end
