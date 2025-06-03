const categoryService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy'];
      
      const params = {
        fields: allFields,
        orderBy: [
          {
            fieldName: "Name",
            SortType: "ASC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('category', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(category => ({
        id: category.Id,
        name: category.Name || '',
        tags: category.Tags ? category.Tags.split(',').filter(tag => tag.trim()) : [],
        createdOn: category.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
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

      const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy'];
      
      const params = {
        fields: allFields
      };

      const response = await apperClient.getRecordById('category', id, params);
      
      if (!response || !response.data) {
        return null;
      }

      const category = response.data;
      return {
        id: category.Id,
        name: category.Name || '',
        tags: category.Tags ? category.Tags.split(',').filter(tag => tag.trim()) : [],
        createdOn: category.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      return null;
    }
  },

  async create(categoryData) {
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
            Name: categoryData.name || '',
            Tags: Array.isArray(categoryData.tags) ? categoryData.tags.join(',') : ''
          }
        ]
      };

      const response = await apperClient.createRecord('category', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const created = successfulRecords[0].data;
          return {
            id: created.Id,
            name: created.Name || '',
            tags: created.Tags ? created.Tags.split(',').filter(tag => tag.trim()) : [],
            createdOn: created.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error('Failed to create category');
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async update(id, categoryData) {
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
            Name: categoryData.name || '',
            Tags: Array.isArray(categoryData.tags) ? categoryData.tags.join(',') : ''
          }
        ]
      };

      const response = await apperClient.updateRecord('category', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          const updated = successfulUpdates[0].data;
          return {
            id: updated.Id,
            name: updated.Name || '',
            tags: updated.Tags ? updated.Tags.split(',').filter(tag => tag.trim()) : [],
            createdOn: updated.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error('Failed to update category');
    } catch (error) {
      console.error("Error updating category:", error);
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

      const response = await apperClient.deleteRecord('category', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}

export default categoryService