import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
  getStatistics,
  getUniqueValues
} from '../redux/actions/diseaseActions';
import {
  clearError,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  setFilters,
  clearFilters,
  clearCurrentEntry
} from '../redux/slices/diseaseSlice';
import Link from 'next/link';

const DiseaseExample = () => {
  const dispatch = useDispatch();
  const {
    entries,
    loading,
    error,
    pagination,
    createSuccess,
    updateSuccess,
    deleteSuccess,
    filters,
    statistics,
    uniqueValues
  } = useSelector((state) => state.disease);

  const [formData, setFormData] = useState({
    disease: '',
    autoantibody: '',
    autoantigen: '',
    epitope: '',
    uniprotId: '',
    type: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data
  useEffect(() => {
    dispatch(getAllEntries({ page: 1, limit: 10 }));
    dispatch(getStatistics());
    dispatch(getUniqueValues('disease'));
  }, [dispatch]);

  // Handle success messages
  useEffect(() => {
    if (createSuccess) {
      setFormData({ disease: '', autoantibody: '', autoantigen: '', epitope: '', uniprotId: '', type: '' });
      dispatch(clearCreateSuccess());
      dispatch(getAllEntries({ page: 1, limit: 10 })); // Refresh list
    }
  }, [createSuccess, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setEditingId(null);
      setFormData({ disease: '', autoantibody: '', autoantigen: '', epitope: '', uniprotId: '', type: '' });
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      dispatch(clearDeleteSuccess());
      dispatch(getAllEntries({ page: 1, limit: 10 })); // Refresh list
    }
  }, [deleteSuccess, dispatch]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.disease || !formData.autoantibody || !formData.autoantigen) {
      alert('Disease, autoantibody, and autoantigen are required');
      return;
    }

    if (editingId) {
      dispatch(updateEntry({ id: editingId, entryData: formData }));
    } else {
      dispatch(createEntry(formData));
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      dispatch(deleteEntry(id));
    }
  };

  // Handle edit
  const handleEdit = (entry) => {
    setFormData({
      disease: entry.disease,
      autoantibody: entry.autoantibody,
      autoantigen: entry.autoantigen,
      epitope: entry.epitope || '',
      uniprotId: entry.uniprotId || '',
      type: entry.type || ''
    });
    setEditingId(entry._id);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ disease: '', autoantibody: '', autoantigen: '', epitope: '', uniprotId: '', type: '' });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchEntries({ searchTerm: searchTerm.trim(), field: 'all', limit: 20 }));
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    dispatch(getAllEntries({ ...filters, page, limit: pagination.limit }));
  };

  // Clear error
  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Disease Database Management</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between">
            <span>{error}</span>
            <button onClick={handleClearError} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Statistics Display */}
      {statistics.overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="font-semibold">Total Entries</h3>
            <p className="text-2xl">{statistics.overview.totalEntries || 0}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-semibold">Unique Diseases</h3>
            <p className="text-2xl">{statistics.overview.uniqueDiseasesCount || 0}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <h3 className="font-semibold">Unique Antibodies</h3>
            <p className="text-2xl">{statistics.overview.uniqueAntibodiesCount || 0}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <h3 className="font-semibold">Unique Antigens</h3>
            <p className="text-2xl">{statistics.overview.uniqueAntigensCount || 0}</p>
          </div>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? 'Edit Entry' : 'Add New Entry'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Disease *</label>
            <input
              type="text"
              required
              value={formData.disease}
              onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Autoantibody *</label>
            <input
              type="text"
              required
              value={formData.autoantibody}
              onChange={(e) => setFormData({ ...formData, autoantibody: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Autoantigen *</label>
            <input
              type="text"
              required
              value={formData.autoantigen}
              onChange={(e) => setFormData({ ...formData, autoantigen: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Epitope</label>
            <input
              type="text"
              value={formData.epitope}
              onChange={(e) => setFormData({ ...formData, epitope: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">UniProt ID</label>
            <input
              type="text"
              value={formData.uniprotId}
              onChange={(e) => setFormData({ ...formData, uniprotId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingId ? 'Update Entry' : 'Add Entry'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Entries Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left">Disease</th>
              <th className="px-4 py-2 border-b text-left">Autoantibody</th>
              <th className="px-4 py-2 border-b text-left">Autoantigen</th>
              <th className="px-4 py-2 border-b text-left">Epitope</th>
              <th className="px-4 py-2 border-b text-left">UniProt ID</th>
              <th className="px-4 py-2 border-b text-left">Type</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No entries found
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{entry.disease}</td>
                  <td className="px-4 py-2 border-b">{entry.autoantibody}</td>
                  <td className="px-4 py-2 border-b">{entry.autoantigen}</td>
                  <td className="px-4 py-2 border-b">{entry.epitope || '-'}</td>
                  <td className="px-4 py-2 border-b cursor-pointer">
                    <Link href={"https://www.uniprot.org/uniprotkb/"+entry.uniprotId+"/entry"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {entry.uniprotId}
                    </Link>
                   </td>
                  <td className="px-4 py-2 border-b">{entry.type || '-'}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DiseaseExample;
