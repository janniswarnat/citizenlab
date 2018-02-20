require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "User Custom Field Options" do

  before do
    header "Content-Type", "application/json"
    @custom_field = create(:custom_field_select)
    @custom_field_options = create_list(:custom_field_option, 3, custom_field: @custom_field)
  end


  get "web_api/v1/users/custom_fields/:custom_field_id/custom_field_options" do
    let (:custom_field_id) { @custom_field.id }
    
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of custom fields per page"
    end
    
    
    example_request "List custom field options for field" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end
  end

  get "web_api/v1/users/custom_fields/:custom_field_id/custom_field_options/:id" do
    let(:id) { @custom_field_options.first.id }

    example_request "Get one custom field option by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  context "when authenticated as admin" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/users/custom_fields/:custom_field_id/custom_field_options" do
      with_options scope: :custom_field_option do
        parameter :key, "A unique internal name for the option. Only letters, numbers and underscores allowed. Can't be changed afterwards", required: true
        parameter :title_multiloc, "The title of the field as shown to users, in multiple locales", required: true
        parameter :is_default, "Whether this option is selected by default. Defaults to false", required: false
        parameter :ordering, "Optional integer that is used to sort the options", required: false
      end

      ValidationErrorHelper.new.error_fields(self, CustomFieldOption)

      let(:custom_field_id) { @custom_field.id }
      let(:custom_field_option) { build(:custom_field_option, custom_field: @custom_field) }

      describe do
        let(:key) { custom_field_option.key }
        let(:title_multiloc) { custom_field_option.title_multiloc }
        let(:is_default) { custom_field_option.is_default }
        let(:ordering) { custom_field_option.ordering }

        example_request "Create a custom field option" do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:key)).to match key
          expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data,:attributes,:is_default)).to match is_default
          expect(json_response.dig(:data,:attributes,:ordering)).to match ordering
        end
      end

      describe do
        let(:key) { "No spaces allowed" }
        let(:title_multiloc) { {'en' => ""} }

        example_request "[error] Create an invalid custom field option" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :key)).to eq [{error: 'invalid', value: key}]
          expect(json_response.dig(:errors, :title_multiloc)).to eq [{error: 'blank'}]
        end
      end

    end

    patch "web_api/v1/users/custom_fields/:custom_field_id/custom_field_options/:id" do
      with_options scope: :custom_field_option do
        parameter :title_multiloc, "The title of the option as shown to users, in multiple locales", required: false
        parameter :is_default, "Whether this option is selected by default.", required: false
        parameter :ordering, "Optional integer that is used to sort the options", required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:id) { create(:custom_field_option, custom_field: @custom_field).id }
      let(:title_multiloc) { {"en" => "New title"} }
      let(:is_default) { true }
      let(:ordering) { 8 }

      example_request "Update a custom field option" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:is_default)).to match is_default
        expect(json_response.dig(:data,:attributes,:ordering)).to match ordering
      end
    end


    delete "web_api/v1/users/custom_fields/:custom_field_id/custom_field_options/:id" do
      let(:custom_field_option) { create(:custom_field_option, custom_field: @custom_field) }
      let(:id) { custom_field_option.id }

      example_request "Delete a custom field option" do
        expect(response_status).to eq 200
        expect{CustomFieldOption.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

  end

end