Seo::Engine.routes.draw do
  get 'sitemap', to: 'application#sitemap', defaults: { format: :xml }
  get 'robots', to: 'application#sitemap', defaults: { format: :txt }
  get 'okcomputer', to: proc { [200, {}, ['']] }
end
