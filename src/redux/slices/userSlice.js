// redux/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsers,
  fetchUserById,
  fetchUsersByRole,
  fetchDoctors,
  fetchUserStats,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
  updateUserPassword,
  searchUsers,
  clearUserErrors,
  clearUserSuccess
} from '../actions/userActions';

const initialState = {
  users: [], // All users list
  user: null, // Single user details
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  stats: {
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0
    },
    roleStats: []
  },
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statsLoading: false,
  success: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Synchronous reducers for immediate state updates
    resetUserState: (state) => {
      state.user = null;
      state.error = null;
      state.success = false;
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetUsers: (state) => {
      state.users = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users with pagination
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
        state.pagination = initialState.pagination;
      })

      // Fetch users by role
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
        state.pagination = initialState.pagination;
      })

      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
        state.pagination = initialState.pagination;
      })

      // Fetch user statistics
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.error = null;
        
        // Add to users array
        if (Array.isArray(state.users)) {
          state.users.unshift(action.payload);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.error = null;
        
        const updatedUser = action.payload;
        
        // Update in users array
        if (Array.isArray(state.users)) {
          const index = state.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        }
        
        // Update single user if it's the same
        if (state.user && state.user._id === updatedUser._id) {
          state.user = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update user password
      .addCase(updateUserPassword.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserPassword.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.error = null;
        
        const { userId } = action.payload;
        
        // Remove from users array
        if (Array.isArray(state.users)) {
          state.users = state.users.filter(user => user._id !== userId);
        }
        
        // Clear single user if it was deleted
        if (state.user && state.user._id === userId) {
          state.user = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Toggle user status
      .addCase(toggleUserStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.error = null;
        
        const updatedUser = action.payload;
        
        // Update in users array
        if (Array.isArray(state.users)) {
          const index = state.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        }
        
        // Update single user if it's the same
        if (state.user && state.user._id === updatedUser._id) {
          state.user = updatedUser;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.error = null;
        
        const updatedUser = action.payload;
        
        // Update in users array
        if (Array.isArray(state.users)) {
          const index = state.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        }
        
        // Update single user if it's the same
        if (state.user && state.user._id === updatedUser._id) {
          state.user = updatedUser;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Clear errors
      .addCase(clearUserErrors.fulfilled, (state) => {
        state.error = null;
      })

      // Clear success
      .addCase(clearUserSuccess.fulfilled, (state) => {
        state.success = false;
      });
  },
});

export const { resetUserState, clearError, clearSuccess, resetUsers } = userSlice.actions;
export default userSlice.reducer;