// redux/actions/userActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosSetup';

// Create user (Admin creates Doctor/Receptionist, SuperAdmin creates Admin)
export const createUser = createAsyncThunk('users/create', async (userData, thunkAPI) => {
  try {
    const response = await axiosInstance.post('/api/users', userData);
    return response.data.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create user');
  }
});

// Update user
export const updateUser = createAsyncThunk('users/update', async ({ id, data }, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}`, data);
    return response.data.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

// Fetch all users with pagination and filtering
export const fetchUsers = createAsyncThunk('users/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination params
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering params
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = queryParams.toString() ? `/api/users?${queryParams}` : '/api/users';
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

// Delete user (supports both soft and permanent delete)
export const deleteUser = createAsyncThunk('users/delete', async ({ userId, permanent = false }, thunkAPI) => {
  try {
    const url = permanent 
      ? `/api/users/${userId}?permanent=true`
      : `/api/users/${userId}`;
    const response = await axiosInstance.delete(url);
    return { userId, message: response.data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

// Fetch user details by ID
export const fetchUserById = createAsyncThunk('users/fetchUserById', async (id, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

// Fetch users by role with pagination
export const fetchUsersByRole = createAsyncThunk('users/fetchByRole', async ({ role, params = {} }, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    
    const url = queryParams.toString() 
      ? `/api/users/role/${role}?${queryParams}` 
      : `/api/users/role/${role}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch users by role');
  }
});

// Fetch all doctors (shortcut for fetchUsersByRole with role='Doctor')
export const fetchDoctors = createAsyncThunk('users/fetchDoctors', async (params = {}, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    
    const url = queryParams.toString() 
      ? `/api/users/role/Doctor?${queryParams}` 
      : `/api/users/role/Doctor`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
  }
});

// Get user statistics
export const fetchUserStats = createAsyncThunk('users/fetchStats', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/api/users/stats');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user statistics');
  }
});

// Toggle user status (active/inactive)
export const toggleUserStatus = createAsyncThunk('users/toggleStatus', async (id, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}/toggle-status`);
    return response.data.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
  }
});

// Search users (using the main fetchUsers with search parameter)
export const searchUsers = createAsyncThunk('users/search', async (searchQuery, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/api/users?search=${encodeURIComponent(searchQuery)}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to search users');
  }
});

// Update user role
export const updateUserRole = createAsyncThunk('users/updateRole', async ({ id, role }, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}`, { role });
    return response.data.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update user role');
  }
});

// Update user password - separate action for password updates
export const updateUserPassword = createAsyncThunk('users/updatePassword', async ({ id, currentPassword, newPassword }, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}/password`, {
      currentPassword,
      newPassword
    });
    return { userId: id, message: response.data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update password');
  }
});

// Clear user errors (helper action)
export const clearUserErrors = createAsyncThunk('users/clearErrors', async () => {
  return null;
});

// Clear user success (helper action)
export const clearUserSuccess = createAsyncThunk('users/clearSuccess', async () => {
  return null;
});

// Additional actions for backward compatibility (if needed elsewhere)
// These are aliases for the main actions above
export const fetchUserDetails = fetchUserById;
export const fetchDoctorById = fetchUserById;
export const searchDoctors = searchUsers;

// REMOVED: Center-based actions that don't exist in the backend
// export const fetchUsersByCenter
// export const fetchUsersByCurrentUserCenter