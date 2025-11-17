class ItemsController < ApplicationController
  def index
    render json: {
      status: true,
      data: Item.all
    }
  end
end
