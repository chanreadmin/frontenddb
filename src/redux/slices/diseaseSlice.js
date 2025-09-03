// diseaseSlice.js - Updated with better filtering support

import { createSlice } from '@reduxjs/toolkit';
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
  advancedSearch,
  getEntriesByDisease,
  getEntriesByUniprotId,
  getUniqueValues,
  getFilteredUniqueValues,
  getStatistics,
  bulkImport,
  exportEntries
} from '../actions/diseaseActions';

const initialState = {
  // Main data
  entries: [],
  currentEntry: null,
  relatedEntries: [],
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  
  // Applied filters (what's currently active on backend)
  appliedFilters: {
    search: null,
    field: null,
    disease: null,
    autoantibody: null,
    autoantigen: null,
    epitope: null,
    sortBy: 'disease',
    sortOrder: 'asc'
  },
  
  // Loading states
  loading: false,
  entryLoading: false,
  searchLoading: false,
  advancedSearchLoading: false,
  statisticsLoading: false,
  exportLoading: false,
  bulkImportLoading: false,
  uniqueValuesLoading: false,
  
  // Error states
  error: null,
  entryError: null,
  searchError: null,
  advancedSearchError: null,
  statisticsError: null,
  exportError: null,
  bulkImportError: null,
  uniqueValuesError: null,
  
  // Search results
  searchResults: [],
  searchCount: 0,
  advancedSearchResults: [],
  advancedSearchStats: null,
  
  // Filter data
  uniqueValues: {
    disease: [],
    autoantibody: [],
    autoantigen: [],
    epitope: []
  },
  
  // Filtered unique values (based on current filter dependencies)
  filteredUniqueValues: {
    disease: [],
    autoantibody: [],
    autoantigen: [],
    epitope: []
  },
  
  // Statistics
  statistics: {
    overview: {},
    diseaseBreakdown: [],
    topAntibodies: [],
    topAntigens: []
  },
  
  // UI states
  filters: {
    search: '',
    field: 'all',
    disease: '',
    autoantibody: '',
    autoantigen: '',
    epitope: '',
    sortBy: 'disease',
    sortOrder: 'asc'
  },
  
  // Success states
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  bulkImportSuccess: false,
  exportSuccess: false
};

const diseaseSlice = createSlice({
  name: 'disease',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearEntryError: (state) => {
      state.entryError = null;
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    clearAdvancedSearchError: (state) => {
      state.advancedSearchError = null;
    },
    clearStatisticsError: (state) => {
      state.statisticsError = null;
    },
    clearExportError: (state) => {
      state.exportError = null;
    },
    clearBulkImportError: (state) => {
      state.bulkImportError = null;
    },
    clearUniqueValuesError: (state) => {
      state.uniqueValuesError = null;
    },
    
    // Clear success states
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearDeleteSuccess: (state) => {
      state.deleteSuccess = false;
    },
    clearBulkImportSuccess: (state) => {
      state.bulkImportSuccess = false;
    },
    clearExportSuccess: (state) => {
      state.exportSuccess = false;
    },
    
    // Update filters (UI state only)
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        field: 'all',
        disease: '',
        autoantibody: '',
        autoantigen: '',
        epitope: '',
        sortBy: 'disease',
        sortOrder: 'asc'
      };
      // Also reset filtered unique values when clearing filters
      state.filteredUniqueValues = {
        disease: [...state.uniqueValues.disease],
        autoantibody: [],
        autoantigen: [],
        epitope: []
      };
    },
    
    // Reset dependent filters when parent filter changes
    resetDependentFilters: (state, action) => {
      const { field } = action.payload;
      
      if (field === 'disease') {
        state.filters.autoantibody = '';
        state.filters.autoantigen = '';
        state.filters.epitope = '';
        state.filteredUniqueValues.autoantibody = [];
        state.filteredUniqueValues.autoantigen = [];
        state.filteredUniqueValues.epitope = [];
      } else if (field === 'autoantibody') {
        state.filters.epitope = '';
        state.filteredUniqueValues.epitope = [];
      } else if (field === 'autoantigen') {
        state.filters.epitope = '';
        state.filteredUniqueValues.epitope = [];
      }
    },
    
    // Clear current entry
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
      state.relatedEntries = [];
    },
    
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchCount = 0;
      state.advancedSearchResults = [];
      state.advancedSearchStats = null;
    },
    
    // Reset all states
    resetDiseaseState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all entries
      .addCase(getAllEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.appliedFilters = action.payload.appliedFilters || state.appliedFilters;
        state.error = null;
      })
      .addCase(getAllEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.entries = [];
      })
      
      // Get entry by ID
      .addCase(getEntryById.pending, (state) => {
        state.entryLoading = true;
        state.entryError = null;
      })
      .addCase(getEntryById.fulfilled, (state, action) => {
        state.entryLoading = false;
        state.currentEntry = action.payload.data;
        state.relatedEntries = action.payload.relatedEntries || [];
        state.entryError = null;
      })
      .addCase(getEntryById.rejected, (state, action) => {
        state.entryLoading = false;
        state.entryError = action.payload;
        state.currentEntry = null;
        state.relatedEntries = [];
      })
      
      // Create entry
      .addCase(createEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload.data);
        state.createSuccess = true;
        state.error = null;
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      
      // Update entry
      .addCase(updateEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEntry = action.payload.data;
        const index = state.entries.findIndex(entry => entry._id === updatedEntry._id);
        if (index !== -1) {
          state.entries[index] = updatedEntry;
        }
        if (state.currentEntry && state.currentEntry._id === updatedEntry._id) {
          state.currentEntry = updatedEntry;
        }
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      
      // Delete entry
      .addCase(deleteEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.deletedId;
        state.entries = state.entries.filter(entry => entry._id !== deletedId);
        if (state.currentEntry && state.currentEntry._id === deletedId) {
          state.currentEntry = null;
          state.relatedEntries = [];
        }
        state.deleteSuccess = true;
        state.error = null;
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      })
      
      // Search entries
      .addCase(searchEntries.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchEntries.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data || [];
        state.searchCount = action.payload.count || 0;
        state.searchError = null;
      })
      .addCase(searchEntries.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
        state.searchResults = [];
        state.searchCount = 0;
      })
      
      // Advanced search
      .addCase(advancedSearch.pending, (state) => {
        state.advancedSearchLoading = true;
        state.advancedSearchError = null;
      })
      .addCase(advancedSearch.fulfilled, (state, action) => {
        state.advancedSearchLoading = false;
        state.advancedSearchResults = action.payload.data || [];
        state.advancedSearchStats = action.payload.stats || null;
        state.advancedSearchError = null;
      })
      .addCase(advancedSearch.rejected, (state, action) => {
        state.advancedSearchLoading = false;
        state.advancedSearchError = action.payload;
        state.advancedSearchResults = [];
        state.advancedSearchStats = null;
      })
      
      // Get entries by disease
      .addCase(getEntriesByDisease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEntriesByDisease.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.error = null;
      })
      .addCase(getEntriesByDisease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.entries = [];
      })
      
      // Get entries by UniProt ID
      .addCase(getEntriesByUniprotId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEntriesByUniprotId.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.data || [];
        state.error = null;
      })
      .addCase(getEntriesByUniprotId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.entries = [];
      })
      
      // Get unique values
      .addCase(getUniqueValues.pending, (state) => {
        state.uniqueValuesLoading = true;
        state.uniqueValuesError = null;
      })
      .addCase(getUniqueValues.fulfilled, (state, action) => {
        state.uniqueValuesLoading = false;
        const { field, data } = action.payload;
        if (field && state.uniqueValues.hasOwnProperty(field)) {
          state.uniqueValues[field] = data || [];
          // Initialize filtered values for disease field
          if (field === 'disease') {
            state.filteredUniqueValues[field] = data || [];
          }
        }
        state.uniqueValuesError = null;
      })
      .addCase(getUniqueValues.rejected, (state, action) => {
        state.uniqueValuesLoading = false;
        state.uniqueValuesError = action.payload;
      })
      
      // Get filtered unique values
      .addCase(getFilteredUniqueValues.pending, (state) => {
        state.uniqueValuesLoading = true;
        state.uniqueValuesError = null;
      })
      .addCase(getFilteredUniqueValues.fulfilled, (state, action) => {
        state.uniqueValuesLoading = false;
        const { field, data } = action.payload;
        if (field && state.filteredUniqueValues.hasOwnProperty(field)) {
          state.filteredUniqueValues[field] = data || [];
        }
        state.uniqueValuesError = null;
      })
      .addCase(getFilteredUniqueValues.rejected, (state, action) => {
        state.uniqueValuesLoading = false;
        state.uniqueValuesError = action.payload;
      })
      
      // Get statistics
      .addCase(getStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload.data || state.statistics;
        state.statisticsError = null;
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.payload;
      })
      
      // Bulk import
      .addCase(bulkImport.pending, (state) => {
        state.bulkImportLoading = true;
        state.bulkImportError = null;
        state.bulkImportSuccess = false;
      })
      .addCase(bulkImport.fulfilled, (state, action) => {
        state.bulkImportLoading = false;
        state.bulkImportSuccess = true;
        state.bulkImportError = null;
      })
      .addCase(bulkImport.rejected, (state, action) => {
        state.bulkImportLoading = false;
        state.bulkImportError = action.payload;
        state.bulkImportSuccess = false;
      })
      
      // Export entries
      .addCase(exportEntries.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
        state.exportSuccess = false;
      })
      .addCase(exportEntries.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportSuccess = true;
        state.exportError = null;
      })
      .addCase(exportEntries.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
        state.exportSuccess = false;
      });
  },
});

export const {
  clearError,
  clearEntryError,
  clearSearchError,
  clearAdvancedSearchError,
  clearStatisticsError,
  clearExportError,
  clearBulkImportError,
  clearUniqueValuesError,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  clearBulkImportSuccess,
  clearExportSuccess,
  setFilters,
  clearFilters,
  resetDependentFilters,
  clearCurrentEntry,
  clearSearchResults,
  resetDiseaseState
} = diseaseSlice.actions;

export default diseaseSlice.reducer;