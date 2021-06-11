# frozen_string_literal: true

module Insights
  module WebApi::V1
    class InputsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      def show
        render json: serialize(input), status: :ok
      end

      def index
        # index is not policy scoped, instead the view is authorized.
        inputs = Insights::InputsFinder.new(view, index_params).execute
        render json: serialize(inputs)
      end

      private

      def index_params
        @index_params ||= params.permit(
          :search,
          :category,
          page: %i[number size]
        )
      end

      def assignment_service
        @assignment_service ||= Insights::CategoryAssignmentsService.new
      end

      # @return [Insights::View]
      def view
        @view ||= authorize(
          View.includes(:scope).find(params.require(:view_id)),
          :show?
        )
      end

      def input
        @input ||= authorize(
          view.scope.ideas.find(params.require(:id))
        )
      end

      def serialize(inputs)
        options = {
          include: %i[categories suggested_categories source],
          fields: { idea: [:title_multiloc, :body_multiloc] },
          params: fastjson_params
        }

        InputSerializer.new(inputs, options)
      end
    end
  end
end
