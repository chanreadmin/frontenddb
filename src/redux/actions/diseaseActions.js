// diseaseActions.js - Improved with better filtering support

import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosSetup';

// Enhanced getAllEntries with better parameter handling
export const getAllEntries = createAsyncThunk(
  'disease/getAllEntries',
  async (params = {}, thunkAPI) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        field, 
        disease, 
        autoantibody,
        autoantigen,
        epitope,
        sortBy = 'disease', 
        sortOrder = 'asc', 
        type
      } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });
      
      // Only add non-empty parameters
      if (search && search.trim()) {
        queryParams.append('search', search.trim());
        if (field && field !== 'all') queryParams.append('field', field);
      }
      if (disease && disease.trim()) queryParams.append('disease', disease.trim());
      if (autoantibody && autoantibody.trim()) queryParams.append('autoantibody', autoantibody.trim());
      if (autoantigen && autoantigen.trim()) queryParams.append('autoantigen', autoantigen.trim());
      if (epitope && epitope.trim()) queryParams.append('epitope', epitope.trim());
      if (type && type.trim()) queryParams.append('type', type.trim());
      
      const response = await axiosInstance.get(`/api/disease?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get all entries error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch entries');
    }
  }
);

// New action for getting filtered unique values
export const getFilteredUniqueValues = createAsyncThunk(
  'disease/getFilteredUniqueValues',
  async ({ field, filters = {} }, thunkAPI) => {
    try {
      if (!field || !['disease', 'autoantibody', 'autoantigen', 'epitope'].includes(field)) {
        throw new Error('Valid field is required (disease, autoantibody, autoantigen, epitope)');
      }
      
      const queryParams = new URLSearchParams();
      
      // Add relevant filters based on field dependencies
      if (field === 'autoantibody' || field === 'autoantigen' || field === 'epitope') {
        if (filters.disease && filters.disease.trim()) {
          queryParams.append('disease', filters.disease.trim());
        }
      }
      
      if (field === 'autoantigen' || field === 'epitope') {
        if (filters.autoantibody && filters.autoantibody.trim()) {
          queryParams.append('autoantibody', filters.autoantibody.trim());
        }
      }

      if (field === 'epitope') {
        if (filters.autoantigen && filters.autoantigen.trim()) {
          queryParams.append('autoantigen', filters.autoantigen.trim());
        }
      }
      
      const response = await axiosInstance.get(`/api/disease/unique-filtered/${field}?${queryParams}`);
      return { field, ...response.data };
    } catch (error) {
      console.error('Get filtered unique values error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch filtered unique values');
    }
  }
);

// Enhanced advanced search
export const advancedSearch = createAsyncThunk(
  'disease/advancedSearch',
  async ({ searchTerm, limit = 50, includeStats = false }, thunkAPI) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters long');
      }
      
      const queryParams = new URLSearchParams({
        q: searchTerm.trim(),
        limit: limit.toString(),
        includeStats: includeStats.toString()
      });
      
      const response = await axiosInstance.get(`/api/disease/search/advanced?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Advanced search error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to perform advanced search');
    }
  }
);

// Keep all existing actions (getEntryById, createEntry, etc.) unchanged
export const getEntryById = createAsyncThunk(
  'disease/getEntryById',
  async (id, thunkAPI) => {
    try {
      if (!id) {
        throw new Error('Entry ID is required');
      }
      
      const response = await axiosInstance.get(`/api/disease/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get entry by ID error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch entry');
    }
  }
);

export const createEntry = createAsyncThunk(
  'disease/createEntry',
  async (entryData, thunkAPI) => {
    try {
      if (!entryData.disease || !entryData.autoantibody || !entryData.autoantigen) {
        throw new Error('Disease, autoantibody, and autoantigen are required');
      }
      
      const response = await axiosInstance.post('/api/disease', entryData);
      return response.data;
    } catch (error) {
      console.error('Create entry error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create entry');
    }
  }
);

export const updateEntry = createAsyncThunk(
  'disease/updateEntry',
  async ({ id, entryData }, thunkAPI) => {
    try {
      if (!id) {
        throw new Error('Entry ID is required');
      }
      
      const response = await axiosInstance.put(`/api/disease/${id}`, entryData);
      return response.data;
    } catch (error) {
      console.error('Update entry error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update entry');
    }
  }
);

export const deleteEntry = createAsyncThunk(
  'disease/deleteEntry',
  async (id, thunkAPI) => {
    try {
      if (!id) {
        throw new Error('Entry ID is required');
      }
      
      const response = await axiosInstance.delete(`/api/disease/${id}`);
      return { ...response.data, deletedId: id };
    } catch (error) {
      console.error('Delete entry error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete entry');
    }
  }
);

// Keep other existing actions (searchEntries, getEntriesByDisease, etc.) unchanged
export const searchEntries = createAsyncThunk(
  'disease/searchEntries',
  async ({ searchTerm, field = 'all', limit = 20 }, thunkAPI) => {
    try {
      if (!searchTerm) {
        throw new Error('Search term is required');
      }
      
      const queryParams = new URLSearchParams({
        q: searchTerm,
        field,
        limit: limit.toString()
      });
      
      const response = await axiosInstance.get(`/api/disease/search/entries?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Search entries error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to search entries');
    }
  }
);

export const getEntriesByDisease = createAsyncThunk(
  'disease/getEntriesByDisease',
  async (disease, thunkAPI) => {
    try {
      if (!disease) {
        throw new Error('Disease name is required');
      }
      
      const response = await axiosInstance.get(`/api/disease/disease/${encodeURIComponent(disease)}`);
      return response.data;
    } catch (error) {
      console.error('Get entries by disease error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch entries by disease');
    }
  }
);

export const getEntriesByUniprotId = createAsyncThunk(
  'disease/getEntriesByUniprotId',
  async (uniprotId, thunkAPI) => {
    try {
      if (!uniprotId) {
        throw new Error('UniProt ID is required');
      }
      
      const response = await axiosInstance.get(`/api/disease/uniprot/${uniprotId}`);
      return response.data;
    } catch (error) {
      console.error('Get entries by UniProt ID error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch entries by UniProt ID');
    }
  }
);

export const getUniqueValues = createAsyncThunk(
  'disease/getUniqueValues',
  async (field, thunkAPI) => {
    try {
      if (!field || !['disease', 'autoantibody', 'autoantigen', 'uniprotId', 'type'].includes(field)) {
        throw new Error('Valid field is required (disease, autoantibody, autoantigen, uniprotId, type)');
      }
      
      const response = await axiosInstance.get(`/api/disease/unique/${field}`);
      return { field, ...response.data };
    } catch (error) {
      console.error('Get unique values error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch unique values');
    }
  }
);

export const getStatistics = createAsyncThunk(
  'disease/getStatistics',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/api/disease/statistics/overview');
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const bulkImport = createAsyncThunk(
  'disease/bulkImport',
  async (entries, thunkAPI) => {
    try {
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        throw new Error('Valid entries array is required');
      }
      
      const response = await axiosInstance.post('/api/disease/bulk/import', { entries });
      return response.data;
    } catch (error) {
      console.error('Bulk import error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to import entries');
    }
  }
);

export const exportEntries = createAsyncThunk(
  'disease/exportEntries',
  async (params = {}, thunkAPI) => {
    try {
      const { format = 'json', disease, autoantibody, autoantigen } = params;
      
      const queryParams = new URLSearchParams({ format });
      if (disease) queryParams.append('disease', disease);
      if (autoantibody) queryParams.append('autoantibody', autoantibody);
      if (autoantigen) queryParams.append('autoantigen', autoantigen);
      
      const response = await axiosInstance.get(`/api/disease/export/data?${queryParams}`);
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'disease_database.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'CSV file downloaded successfully' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Export entries error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to export entries');
    }
  }
);