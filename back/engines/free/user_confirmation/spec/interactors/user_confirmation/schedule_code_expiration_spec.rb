require 'rails_helper'

RSpec.describe UserConfirmation::ScheduleCodeExpiration do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  context 'when the email confirmation code is correct' do
    before do
      context[:user] = create(:user_with_confirmation)
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'enqueues a code expiration job' do
      expect { result }.to enqueue_job(UserConfirmation::ExpireConfirmationCodeJob)
    end
  end
end
