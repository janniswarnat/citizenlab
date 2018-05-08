class IdeaPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      elsif user
        project_ids = Pundit.policy_scope(user, Project).pluck(:id)
        scope.where(project_id: project_ids, publication_status: ['published', 'closed'])
      else
        scope
          .left_outer_joins(:project)
          .where(publication_status: ['published', 'closed'])
          .where(projects: {visible_to: 'public', publication_status: ['published', 'archived']})
      end
    end
  end

  def images_index?
    show?
  end

  def files_index?
    show?
  end

  def create?
    pcs = ParticipationContextService.new
    disabled_reason = pcs.posting_disabled_reason(record.project)

    record.draft? ||
    (user&.active? && (user.admin? || user.project_moderator?(record.project_id))) ||
    (
      user&.active? && (
        record.author_id == user.id &&
        !disabled_reason &&
        ProjectPolicy.new(user, record.project).show?
      )
    )
  end

  def show?
    (user&.active? && (user.admin? || user.project_moderator?(record.project_id))) || record.draft? || (
      ProjectPolicy.new(user, record.project).show? &&
      %w(draft published closed).include?(record.publication_status)
    )
  end

  def by_slug?
    show?
  end

  def update?
    record.draft? || (user&.active? && (record.author_id == user.id || user.admin? || user.project_moderator?(record.project_id)))
  end

  def destroy?
    update?
  end

  def get_activities?
    true
  end

  def permitted_attributes
    shared = [
      :publication_status,
      :project_id,
      :author_id,
      :location_description,
      location_point_geojson: [:type, coordinates: []],
      title_multiloc: I18n.available_locales,
      body_multiloc: I18n.available_locales,
      topic_ids: [],
      area_ids: []
    ]
    if user&.admin?
      [:idea_status_id] + shared + [phase_ids: []]
    else
      shared
    end
  end


end
