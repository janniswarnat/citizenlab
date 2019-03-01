class Project < ApplicationRecord
  include ParticipationContext
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top
  mount_base64_uploader :header_bg, ProjectHeaderBgUploader

  DESCRIPTION_PREVIEW_JSON_SCHEMA = ERB.new(File.read(Rails.root.join('config', 'schemas', 'project_description_preview.json_schema.erb'))).result(binding)

  has_many :ideas, dependent: :destroy
  has_many :votes, through: :ideas
  
  has_many :projects_topics, dependent: :destroy
  has_many :topics, through: :projects_topics
  has_many :areas_projects, dependent: :destroy
  has_many :areas, through: :areas_projects
  has_many :groups_projects, dependent: :destroy
  has_many :groups, through: :groups_projects

  has_many :phases, -> { order(:start_at) }, dependent: :destroy
  has_many :events, -> { order(:start_at) }, dependent: :destroy
  has_many :pages, dependent: :destroy
  has_many :project_images, -> { order(:ordering) }, dependent: :destroy
  has_many :text_images, as: :imageable, dependent: :destroy
  has_many :project_files, -> { order(:ordering) }, dependent: :destroy
  has_many :notifications, foreign_key: :project_id, dependent: :nullify

  has_one :project_sort_score

  VISIBLE_TOS = %w(public groups admins)
  PROCESS_TYPES = %w(timeline continuous)
  INTERNAL_ROLES = %w(open_idea_box)
  PUBLICATION_STATUSES = %w(draft published archived)

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :description_preview_multiloc, multiloc: {presence: false}
  validates :slug, presence: true, uniqueness: true, format: {with: SlugService.new.regex }
  validates :visible_to, presence: true, inclusion: {in: VISIBLE_TOS}
  validates :description_preview_multiloc, json: { 
    schema: DESCRIPTION_PREVIEW_JSON_SCHEMA, 
    message: ->(errors) { errors.map{|e| {fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message]} } },
    options: {
      errors_as_objects: true
    }
  }
  validates :process_type, presence: true, inclusion: {in: PROCESS_TYPES}
  validates :internal_role, inclusion: {in: INTERNAL_ROLES, allow_nil: true}
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}

  before_validation :set_process_type, on: :create
  before_validation :generate_slug, on: :create
  before_validation :set_visible_to, on: :create
  before_validation :sanitize_description_multiloc, if: :description_multiloc
  before_validation :sanitize_description_preview_multiloc, if: :description_preview_multiloc
  before_validation :set_publication_status, on: :create
  before_validation :strip_title


  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    subquery = Project.unscoped.all
      .joins(:areas)
      .where(areas: {id: uniq_area_ids})
      .group(:id)
      .having("COUNT(*) = ?", uniq_area_ids.size)

    where(id: subquery)
  end)

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    subquery = Project.unscoped.all
      .joins(:topics)
      .where(topics: {id: uniq_topic_ids})
      .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)

    where(id: subquery)
  end)

  scope :is_participation_context, -> {
    where.not(process_type: 'timeline')
  }

  def continuous?
    self.process_type == 'continuous'
  end

  def timeline?
    self.process_type == 'timeline'
  end

  def archived?
    publication_status == 'archived'
  end

  def published?
    publication_status == 'published'
  end

  def draft?
    publication_status == 'draft'
  end

  def project
    self
  end

  def allocated_budget
    Idea.from(ideas.select('budget * baskets_count as allocated_budget')).sum(:allocated_budget)
  end

  def finished?
    timeline? && (phases.maximum(:end_at) < Time.now)
  end


  private

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, self.title_multiloc.values.first
  end

  def sanitize_description_multiloc
    self.description_multiloc = SanitizationService.new.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
  end

  def sanitize_description_preview_multiloc
    self.description_preview_multiloc = SanitizationService.new.sanitize_multiloc(
      self.description_preview_multiloc,
      %i{decoration link}
    )
  end

  def set_visible_to
    self.visible_to ||= 'public'
  end

  def set_process_type
    self.process_type ||= 'timeline'
  end

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

end
