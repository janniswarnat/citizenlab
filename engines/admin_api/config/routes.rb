AdminApi::Engine.routes.draw do
  resources :tenants do
    get :settings_schema, on: :collection
    get :templates, on: :collection
  end

  resources :projects, only: [:index] do
    get :template_export, on: :collection
    post :template_import, on: :collection
  end
  
end
