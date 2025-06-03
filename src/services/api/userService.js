const userService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'FirstName', 'LastName', 'AvatarUrl', 'ProfileId'];
      
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

      const response = await apperClient.fetchRecords('User', params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(user => ({
        id: user.Id,
        name: user.Name || '',
        firstName: user.FirstName || '',
        lastName: user.LastName || '',
        avatarUrl: user.AvatarUrl || '',
        profileId: user.ProfileId || '',
        tags: user.Tags ? user.Tags.split(',').filter(tag => tag.trim()) : [],
        createdOn: user.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
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

      const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'FirstName', 'LastName', 'AvatarUrl', 'ProfileId'];
      
      const params = {
        fields: allFields
      };

      const response = await apperClient.getRecordById('User', id, params);
      
      if (!response || !response.data) {
        return null;
      }

      const user = response.data;
      return {
        id: user.Id,
        name: user.Name || '',
        firstName: user.FirstName || '',
        lastName: user.LastName || '',
        avatarUrl: user.AvatarUrl || '',
        profileId: user.ProfileId || '',
        tags: user.Tags ? user.Tags.split(',').filter(tag => tag.trim()) : [],
        createdOn: user.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  },

  async create(userData) {
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
            Name: userData.name || '',
            FirstName: userData.firstName || '',
            LastName: userData.lastName || '',
            AvatarUrl: userData.avatarUrl || '',
            ProfileId: userData.profileId || 0,
            Tags: Array.isArray(userData.tags) ? userData.tags.join(',') : ''
          }
        ]
      };

      const response = await apperClient.createRecord('User', params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const created = successfulRecords[0].data;
          return {
            id: created.Id,
            name: created.Name || '',
            firstName: created.FirstName || '',
            lastName: created.LastName || '',
            avatarUrl: created.AvatarUrl || '',
            profileId: created.ProfileId || '',
            tags: created.Tags ? created.Tags.split(',').filter(tag => tag.trim()) : [],
            createdOn: created.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async update(id, userData) {
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
            Name: userData.name || '',
            FirstName: userData.firstName || '',
            LastName: userData.lastName || '',
            AvatarUrl: userData.avatarUrl || '',
            ProfileId: userData.profileId || 0,
            Tags: Array.isArray(userData.tags) ? userData.tags.join(',') : ''
          }
        ]
      };

      const response = await apperClient.updateRecord('User', params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          const updated = successfulUpdates[0].data;
          return {
            id: updated.Id,
            name: updated.Name || '',
            firstName: updated.FirstName || '',
            lastName: updated.LastName || '',
            avatarUrl: updated.AvatarUrl || '',
            profileId: updated.ProfileId || '',
            tags: updated.Tags ? updated.Tags.split(',').filter(tag => tag.trim()) : [],
            createdOn: updated.CreatedOn || new Date().toISOString()
          };
        }
      }
      
      throw new Error('Failed to update user');
    } catch (error) {
      console.error("Error updating user:", error);
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

      const response = await apperClient.deleteRecord('User', params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

export default userService;