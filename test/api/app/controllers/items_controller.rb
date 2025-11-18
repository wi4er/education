class ItemsController < ApplicationController
  respond_to :json
  skip_before_action :verify_authenticity_token

  def index
    render json: {
      status: true,
      data: Item.all
    }
  end

  def show
    render json: {
      status: true,
      data: Item.find(params[:id])
    }
  end

  def create
    @item = Item.new(
      name: params[:name],
      description: params[:description],
      price: params[:price]
    )

    if @item.save
      render json: {
        status: true,
        data: {
          name: @item.name,
          description: @item.description,
          price: @item.price
        }
      }
    end
  end

  def update
    @item = Item.find(params[:id])

    if @item.update(
      name: params[:name],
      description: params[:description],
      price: params[:price]
    )
      render json: {
        status: true,
        data: {
          name: @item.name,
          description: @item.description,
          price: @item.price
        }
      }
    end
  end

  def destroy
    @item = Item.find(params[:id])

    if @item.destroy
      render json: {
        status: true
      }
    end
  end
end
