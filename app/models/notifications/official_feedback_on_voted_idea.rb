module Notifications
  class OfficialFeedbackOnVotedIdea < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :official_feedback
    belongs_to :idea
    belongs_to :project, optional: true

    validates :official_feedback, presence: true
    validates :initiating_user, presence: true
    validates :idea, presence: true


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on voted idea'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      initiator_id = official_feedback.user_id

      if official_feedback.post_type == 'Idea' && initiator_id
        comment_author_ids = User.active
          .joins(:comments).merge(Comment.published)
          .where(comments: {post: official_feedback.post})
          .distinct
          .ids
        voter_ids = User.active
          .joins(:votes).where(votes: {votable: official_feedback.post})
          .distinct
          .ids

        (voter_ids - [initiator_id, *comment_author_ids, official_feedback.post.author_id]).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user_id: initiator_id,
            idea: official_feedback.post,
            official_feedback: official_feedback,
            project_id: official_feedback.post.project_id
            )
        end
      else
        []
      end.compact
    end

  end
end
