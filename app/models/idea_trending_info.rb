class IdeaTrendingInfo < ApplicationRecord

  belongs_to :idea

  validates :last_activity_at, presence: true
  validates :mean_last_activity_at, presence: true
  validates :idea, presence: true

  before_validation :update_info, on: :create
  after_touch :update_info


  TREND_NUM_UPVOTES = 5
  TREND_NUM_COMMENTS = 5
  TREND_SINCE_ACTIVITY = 30 * 24 * 60 * 60 # 30 days


  def update_info
  	last_upvotes_at = idea.upvotes.where.not(user: idea.author)
                                  .order(created_at: :desc)
                                  .limit(TREND_NUM_UPVOTES)
                                  .map(&:created_at)  
    last_comments_at = idea.comments.where.not(author: idea.author)
                                    .order(created_at: :desc)
                                    .limit(TREND_NUM_COMMENTS)
                                    .map(&:created_at)                              

  	self.last_activity_at = [(last_upvotes_at.first || idea.published_at || Time.now), 
  		                     (last_comments_at.first || idea.published_at || Time.now)].max
    self.mean_last_activity_at = mean_fill_published [mean_fill_published(last_upvotes_at, n=TREND_NUM_UPVOTES), 
    	                                              mean_fill_published(last_comments_at, n=TREND_NUM_COMMENTS)]
  end


  private

  def mean_fill_published ats, n=nil
  	unless n
  		n = ats.size
  	end
  	ats = ats.take n
  	frac = (ats.size / n.to_f)
  	Time.at(frac * mean(ats.map(&:to_i)) + (1 - frac) * (idea.published_at || Time.now).to_i)
  end

  def mean arr
    if arr.size == 0
      0
    else
      arr.inject{ |sum, el| sum + el }.to_f / arr.size
    end
  end

end
