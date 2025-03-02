require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::FirstIdeaPublished, type: :model do
  describe "FirstIdeaPublished Campaign default factory" do
    it "is valid" do
      expect(build(:first_idea_published_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
  	let(:campaign) { create(:first_idea_published_campaign) }
    let(:user) { create(:user) }
    let(:idea) { create(:idea, author: user) }
    let(:activity) { create(:activity, item: idea, action: 'first_published_by_user', user: user) }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command.dig(:event_payload, :post_title_multiloc)).to eq(idea.title_multiloc)
  	end
  end
end
