module NLP
  class TasksService
    def initialize(api = nil)
      @api = api || NLP::Api.new
    end

    def cancel task_id
      @api.cancel_task(task_id)
    end

    def status task_id
      @api.status_task(task_id)
    end
  end
end
