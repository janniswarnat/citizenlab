require 'rails_helper'

describe IdeaCustomFieldPolicy do
  subject { IdeaCustomFieldPolicy.new(user, idea_custom_field) }
  let(:scope) { IdeaCustomFieldPolicy::Scope.new(user, CustomField) }

  let(:custom_form) { create(:custom_form) }
  let!(:project) { create(:project, custom_form: custom_form) }
  let!(:idea_custom_field) { create(:custom_field, resource: custom_form) }

  context "for a mortal user with access to the project" do
    let(:user) { create(:user) }

      it { should     permit(:schema)    }
      it { should_not permit(:show)    }
      it { should_not permit(:upsert_by_code)  }

      it "should not index the custom field" do
        expect(scope.resolve.size).to eq 0
      end
  end

  context "for a mortal user without access to the project" do
    let(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, custom_form: custom_form) }

      it { should_not permit(:schema)    }
      it { should_not permit(:show)    }
      it { should_not permit(:upsert_by_code)  }

      it "should not index the custom field" do
        expect(scope.resolve.size).to eq 0
      end
  end

  context "for a moderator of the field's project" do
    let(:user) { create(:moderator, project: project) }

      it { should     permit(:schema)    }
      it { should     permit(:show)    }
      it { should     permit(:upsert_by_code)  }

      it "should index the custom field" do
        expect(scope.resolve.size).to eq 1
      end
  end

  context "for a moderator of another project" do
    let(:user) { create(:moderator) }

      it { should     permit(:schema)    }
      it { should_not permit(:show)    }
      it { should_not permit(:upsert_by_code)  }

      it "should not index the custom field" do
        expect(scope.resolve.size).to eq 0
      end
  end

  context "for an admin" do
    let(:user) { create(:admin) }

      it { should     permit(:schema)    }
      it { should     permit(:show)    }
      it { should     permit(:upsert_by_code)  }

      it "should index the custom field" do
        expect(scope.resolve.size).to eq 1
      end
  end
end