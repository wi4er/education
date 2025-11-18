Rails.application.routes.draw do
  resources :articles
  resources :items, defaults: { format: :json }

  devise_for :users,
             controllers: {
               sessions: "users/sessions"
             }

  devise_scope :user do
    get "users", to: "users/sessions#index", defaults: { format: :json }
    get "users/me", to: "users/sessions#me", defaults: { format: :json }
    post "users/sign_in", to: "users/sessions#create", defaults: { format: :json }
    delete "users/sign_out", to: "users/sessions#destroy", defaults: { format: :json }
  end

  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

end
