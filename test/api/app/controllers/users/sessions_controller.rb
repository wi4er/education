# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]
  respond_to :json
  skip_before_action :verify_authenticity_token, only: :create

  def index
    render json: {
      status: true,
      data: User.all
    }
  end

  def new
    super
  end

  # POST /resource/sign_in
  def create
    # logger = ActiveSupport::TaggedLogging.new(Logger.new(STDOUT))

    user = User.find_by(email: params[:email])

    if user&.valid_password?(params[:password])
      sign_in(user)

      render json: {
        status: true,
        user: {
          id: user.id,
          email: user.email
        }
      }, status: :ok
    else
      render json: {
        status: false,
        error: "Invalid login or password"
      }, status: :unauthorized
    end
  end

  def me
    render json: {
      status: !!current_user,
      user: current_user
    }
  end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end
end
