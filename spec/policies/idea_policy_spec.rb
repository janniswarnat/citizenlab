require 'rails_helper'

describe IdeaPolicy do
  subject { IdeaPolicy.new(user, idea) }
  let(:scope) { IdeaPolicy::Scope.new(user, Idea) }

  context "on idea in a public project" do 
    let(:project) { create(:continuous_project) }
    let!(:idea) { create(:idea, project: project) }

    context "for a visitor" do
      let(:user) { nil }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who is not the idea author" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who didn't complete registration who is the idea author" do
      let(:user) { idea.author.update(registration_completed_at: nil); idea.author }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end


    context "for a user who is the idea author" do
      let(:user) { idea.author }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should     permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "on idea in a private admins project" do 
    let(:project) { create(:private_admins_project)}
    let!(:idea) { create(:idea, project: project) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "for a visitor on an idea in a private groups project" do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should not index the idea" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the idea"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a user on an idea in a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group])}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the idea"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group])}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin on an idea in a private groups project" do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }

    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end

  end

  context "on idea in a draft project" do 
    let(:project) { create(:project, publication_status: 'draft')}
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end