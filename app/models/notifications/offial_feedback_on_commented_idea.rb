module Notifications
  class OfficialFeedbackOnCommentedIdea < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :admin_feedback
    belongs_to :idea
    belongs_to :project, optional: true

    validates :admin_feedback_id, presence: true
    validates :initiating_user, presence: true
    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'AdminFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on commented idea'
    

    def self.make_notifications_on activity
      admin_feedback = activity.item

      admin_feedback_id = admin_feedback&.id
      idea = admin_feedback&.idea
      idea_id = admin_feedback&.idea_id
      initiator_id = admin_feedback&.user_id
      project_id = idea&.project_id

      if admin_feedback_id && idea_id && recipient_id && initiator_id
        idea.comments.pluck(&:author_id) do |recipient_id|
          if (recipient_id != initiator_id) && (recipient_id != idea.author_id)
            self.create(
              recipient_id: recipient_id,
              initiating_user: User.find(initiator_id),
              idea_id: idea_id,
              admin_feedback_id: admin_feedback_id,
              project_id: project_id
              )
          end
      else
        []
      end.compact
    end

  end
end

