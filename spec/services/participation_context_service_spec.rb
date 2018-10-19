require "rails_helper"

describe ParticipationContextService do
  let(:service) { ParticipationContextService.new }

  describe "get_participation_context" do

    it "returns the project for a continuous project" do
      project = build(:continuous_project)
      expect(service.get_participation_context(project)).to eq project
    end

    it "returns the active phase for a timeline project" do
      random_title = SecureRandom.uuid
      project = create(:project_with_current_phase, 
        current_phase_attrs: {title_multiloc: {'en' => random_title} }
        )
      expect(service.get_participation_context(project)&.title_multiloc.dig('en')).to eq random_title
    end

    it "returns nil for a timeline project without an active phase" do
      project = create(:project_with_past_phases)
      expect(service.get_participation_context(project)).to eq nil
    end

    it "returns nil for a timeline project that's archived" do
      project = create(:project_with_current_phase, publication_status: 'archived')
      expect(service.get_participation_context(project)).to eq nil
    end

    it "returns nil for a continuous project that's archived" do
      project = create(:continuous_project, publication_status: 'archived')
      expect(service.get_participation_context(project)).to eq nil
    end
  end

  describe "posting_disabled_reason" do
    it "returns nil when posting is allowed" do
      project = create(:project_with_current_phase, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'posting')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.posting_disabled_reason(project, user)).to be_nil
    end

    it "returns `posting_disabled` when posting is disabled" do
      project = create(:project_with_current_phase, current_phase_attrs: {posting_enabled: false})
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'posting_disabled'
    end

    it "returns `not_permitted` when posting is not permitted" do
      project = create(:project_with_current_phase, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'posting')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'not_permitted'
    end

    it "return `not_ideation` when we're not in an ideation context" do
      project = create(:project_with_current_phase, 
        with_permissions: true, 
        current_phase_attrs: {participation_method: 'information'}
        )
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'not_ideation'
    end

    it "returns `project_inactive` when the timeline is over" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:continuous_project, publication_status: 'archived')
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe "commenting_disabled_reasons" do

    context "for timeline projects" do
      it "returns nil when the idea is in the current phase and commenting is allowed" do
        project = create(:project_with_current_phase, with_permissions: true, phases_config: {
          sequence: 'xxcxx'
        })
        idea = create(:idea, project: project, phases: [project.phases[2]] )
        expect(service.commenting_disabled_reason(idea, create(:user))).to be_nil
      end

      it "returns nil when the idea is not in the current phase, commenting is allowed in the current phase and was allowed in the last phase the idea was part of" do
        project = create(:project_with_current_phase, with_permissions: true, phases_config: {
          sequence: "xxcxx"
        })
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to be_nil
      end

      it "returns `commenting_disabled` when the idea is in the current phase and commenting is disabled" do
        project = create(:project_with_current_phase, 
          current_phase_attrs: {commenting_enabled: false},
        )
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'commenting_disabled'
      end

      it "returns `not_permitted` when the idea is in the current phase and commenting is not permitted" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'commenting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'commenting_disabled' when the idea is not in the current phase, commenting is allowed but was not allowed in the last phase the idea was part of" do
        project = create(:project_with_current_phase, 
          current_phase_attrs: {commenting_enabled: false},
        )
        project.phases[1].update(commenting_enabled: false)
        idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'commenting_disabled'
      end

      it "returns 'not_permitted' when the idea is not in the current phase, commenting is permitted but was not permitted in the last phase the idea was part of" do
        project = create(:project_with_current_phase, with_permissions: true)
        phase = project.phases[1]
        permission = phase.permissions.find_by(action: 'commenting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'project_inactive'
      end
    end

    context "continuous project" do
      it "returns 'commenting_disabled' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, commenting_enabled: false)
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'commenting_disabled'
      end

      it "returns 'not_permitted' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'commenting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns nil when commenting is permitted in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason(idea, create(:user))).to be_nil
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, publication_status: 'archived')
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'project_inactive'
      end
    end
  end


  describe "voting_disabled_reasons" do

    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context "timeline project" do
      it "returns nil when voting is enabled in the current phase with unlimited voting" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.voting_disabled_reason(idea, user)).to be_nil
      end

      it "returns `not_in_active_context` when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:not_in_active_context]
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: {voting_enabled: false})
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_disabled]
      end

      it "returns 'not_permitted' if it's in the current phase and voting is not permitted" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'voting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:not_permitted]
      end

      it "returns `voting_limited_max_reached` when it's in the current phase and the user reached his limit" do
        project = create(:project_with_current_phase, with_permissions: true, current_phase_attrs: {
          voting_method: 'limited', 
          voting_limited_max: 3
        })
        phase = project.phases[2]
        ideas = create_list(:idea, 3, project: project, phases: [phase])
        ideas.each{|idea| create(:vote, votable: idea, user: user)}
        idea = create(:idea, project: project, phases: [phase])
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_limited_max_reached]
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:project_inactive]
      end

    end

    context "continuous project" do
      it "returns nil when voting is enabled in the current project with unlimited voting" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to be_nil
      end

      it "returns 'voting_disabled' if voting is disabled" do
        project = create(:continuous_project, voting_enabled: false)
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_disabled]
      end

      it "returns 'not_permitted' if voting is not permitted" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        permission = project.permissions.find_by(action: 'voting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:not_permitted]
      end

      it "returns 'voting_limited_max_reached' when the user reached his limit" do
        project = create(:continuous_project, 
          voting_method: 'limited', voting_limited_max: 3, 
          with_permissions: true
          )
        ideas = create_list(:idea, 3, project: project)
        ideas.each{|idea| create(:vote, votable: idea, user: user)}
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_limited_max_reached]
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, with_permissions: true, publication_status: 'archived')
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to eq 'project_inactive'
      end
    end
  end

  describe "cancelling_votes_disabled_reasons" do

    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context "timeline project" do
      it "returns nil when voting is enabled in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to be_nil
      end

      it "returns `not_in_active_context` when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:not_in_active_context]
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: {voting_enabled: false})
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it "returns 'not_permitted' if it's in the current phase and voting is not permitted" do
        project = create(:project_with_current_phase, 
          with_permissions: true, 
          current_phase_attrs: {voting_permitted: false} 
          )
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:not_permitted]
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:project_inactive]
      end
    end

    context "continuous project" do
      it "returns nil when voting is enabled in the current project with unlimited voting" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to be_nil
      end

      it "returns 'voting_disabled' if voting is disabled" do
        project = create(:continuous_project, voting_enabled: false)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it "returns 'not_permitted' if voting is not permitted" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        permission = project.permissions.find_by(action: 'voting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:not_permitted]
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, publication_status: 'archived')
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:project_inactive]
      end
    end
  end

  describe "taking_survey_disabled_reason" do
    it "returns nil when taking the survey is allowed" do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.taking_survey_disabled_reason(project, user)).to be_nil
    end

    it "returns `not_permitted` when taking the survey is not permitted" do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.taking_survey_disabled_reason(project, create(:user))).to eq 'not_permitted'
    end

    it "returns `not_survey` when the active context is not a survey" do
      project = create(:project_with_current_phase, 
        with_permissions: true, 
        current_phase_attrs: {participation_method: 'ideation'}
        )
      expect(service.taking_survey_disabled_reason(project, create(:user))).to eq 'not_survey'
    end

    it "returns `project_inactive` when the timeline has past" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.taking_survey_disabled_reason(project, create(:user))).to eq 'project_inactive'
    end

    it "returns `project_inactive` when the continuous project is archived" do
      project = create(:continuous_project, with_permissions: true, publication_status: 'archived')
      expect(service.taking_survey_disabled_reason(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe "future_posting_enabled_phase" do
    it "returns the first upcoming phase that has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {posting_enabled: false},
          y: {posting_enabled: true},
          c: {posting_enabled: false}
        }
      )
      expect(service.future_posting_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns the first upcoming phase that has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {posting_permitted: false},
          y: {posting_permitted: true},
          c: {posting_permitted: false}
        }
      )
      expect(service.future_posting_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns nil if no next phase has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {posting_permitted: false},
        }
      )
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil if no next phase has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {posting_enabled: false},
        }
      )
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe "future_voting_enabled_phase" do
    it "returns the first upcoming phase that has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {voting_enabled: false},
          y: {voting_enabled: true},
          c: {voting_enabled: false}
        }
      )
      expect(service.future_voting_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns the first upcoming phase that has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {voting_permitted: false},
          y: {voting_permitted: true},
          c: {voting_permitted: false}
        }
      )
      expect(service.future_voting_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns nil if no next phase has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {voting_enabled: false},
        }
      )
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil if no next phase has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {voting_permitted: false},
        }
      )
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe "future_commenting_enabled_phase" do
    it "returns the first upcoming phase that has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {commenting_enabled: false},
          y: {commenting_enabled: true},
          c: {commenting_enabled: false}
        }
      )
      expect(service.future_commenting_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns the first upcoming phase that has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {commenting_permitted: false},
          y: {commenting_permitted: true},
          c: {commenting_permitted: false}
        }
      )
      expect(service.future_commenting_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns nil if no next phase has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {commenting_enabled: false},
        }
      )
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil if no next phase has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {commenting_permitted: false},
        }
      )
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end
  end
end