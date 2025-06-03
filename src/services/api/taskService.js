const taskService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'due_date', 'priority', 'category', 'completed', 'created_at'];
      
      const params = {
        fields: allFields,
        orderBy: [
          {
            fieldName: "CreatedOn",
            SortType: "DESC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('task', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(task => ({
        id: task.Id,
        title: task.title || task.Name || '',
        description: task.description || '',
        dueDate: task.due_date || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        completed: task.completed || false,
        tags: task.Tags ? task.Tags.split(',').filter(tag => tag.trim()) : [],
        createdAt: task.created_at || task.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'due_date', 'priority', 'category', 'completed', 'created_at'];
      
      const params = {
        fields: allFields
      };

      const response = await apperClient.getRecordById('task', id, params);
      
      if (!response || !response.data) {
        return null;
      }

      const task = response.data;
      return {
        id: task.Id,
        title: task.title || task.Name || '',
        description: task.description || '',
        dueDate: task.due_date || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        completed: task.completed || false,
        tags: task.Tags ? task.Tags.split(',').filter(tag => tag.trim()) : [],
        createdAt: task.created_at || task.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      return null;
    }
  },

  async create(taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields for creation
      const params = {
        records: [
          {
            Name: taskData.title || '',
            title: taskData.title || '',
            description: taskData.description || '',
            due_date: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
            priority: taskData.priority || 'medium',
            category: taskData.category || '',
            completed: taskData.completed || false,
            created_at: new Date().toISOString(),
            Tags: Array.isArray(taskData.tags) ? taskData.tags.join(',') : ''
          }
        ]
      };

      const response = await apperClient.createRecord('task', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const created = successfulRecords[0].data;
          return {
            id: created.Id,
            title: created.title || created.Name || '',
            description: created.description || '',
            dueDate: created.due_date || '',
            priority: created.priority || 'medium',
            category: created.category || '',
            completed: created.completed || false,
            tags: created.Tags ? created.Tags.split(',').filter(tag => tag.trim()) : [],
            createdAt: created.created_at || created.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error('Failed to create task');
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async update(id, taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields for update
      const params = {
        records: [
          {
            Id: id,
            Name: taskData.title || '',
            title: taskData.title || '',
            description: taskData.description || '',
            due_date: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
            priority: taskData.priority || 'medium',
            category: taskData.category || '',
            completed: taskData.completed || false,
            Tags: Array.isArray(taskData.tags) ? taskData.tags.join(',') : ''
          }
        ]
      };

      const response = await apperClient.updateRecord('task', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          const updated = successfulUpdates[0].data;
          return {
            id: updated.Id,
            title: updated.title || updated.Name || '',
            description: updated.description || '',
            dueDate: updated.due_date || '',
            priority: updated.priority || 'medium',
            category: updated.category || '',
            completed: updated.completed || false,
            tags: updated.Tags ? updated.Tags.split(',').filter(tag => tag.trim()) : [],
            createdAt: updated.created_at || updated.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error('Failed to update task');
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord('task', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
}

export default taskService