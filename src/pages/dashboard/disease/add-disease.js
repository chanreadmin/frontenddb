import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { createEntry } from '@/redux/actions/diseaseActions';
import { clearCreateSuccess, clearError } from '@/redux/slices/diseaseSlice';
import { Plus, ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

const AddDisease = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector((state) => state.disease);

  const [formData, setFormData] = useState({
    disease: '',
    autoantibody: '',
    autoantigen: '',
    epitope: '',
    uniprotId: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Clear success message and redirect after successful creation
  useEffect(() => {
    if (createSuccess) {
      dispatch(clearCreateSuccess());
      router.push('/dashboard/superadmin');
    }
  }, [createSuccess, dispatch, router]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.disease.trim()) {
      errors.disease = 'Disease name is required';
    }
    
    if (!formData.autoantibody.trim()) {
      errors.autoantibody = 'Autoantibody is required';
    }
    
    if (!formData.autoantigen.trim()) {
      errors.autoantigen = 'Autoantigen is required';
    }

    // Validate UniProt ID format if provided
    if (formData.uniprotId.trim() && !/^[A-Z0-9]{6,10}$/.test(formData.uniprotId.trim())) {
      errors.uniprotId = 'UniProt ID should be 6-10 alphanumeric characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createEntry(formData));
    } catch (error) {
      console.error('Failed to create disease entry:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const resetForm = () => {
    setFormData({
      disease: '',
      autoantibody: '',
      autoantigen: '',
      epitope: '',
      uniprotId: ''
    });
    setValidationErrors({});
  };

  return (
    <Layout>
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/superadmin"
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Add New Disease Entry</h1>
              <p className="text-gray-600 text-xs">Create a new disease-autoantibody-autoantigen association</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={handleClearError} 
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Disease Name */}
            <div>
              <label htmlFor="disease" className="block text-sm font-medium text-gray-700 mb-2">
                Disease Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="disease"
                name="disease"
                value={formData.disease}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.disease ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Systemic Lupus Erythematosus"
              />
              {validationErrors.disease && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.disease}</p>
              )}
            </div>

            {/* Autoantibody */}
            <div>
              <label htmlFor="autoantibody" className="block text-sm font-medium text-gray-700 mb-2">
                Autoantibody <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="autoantibody"
                name="autoantibody"
                value={formData.autoantibody}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.autoantibody ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Anti-dsDNA"
              />
              {validationErrors.autoantibody && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.autoantibody}</p>
              )}
            </div>

            {/* Autoantigen */}
            <div>
              <label htmlFor="autoantigen" className="block text-sm font-medium text-gray-700 mb-2">
                Autoantigen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="autoantigen"
                name="autoantigen"
                value={formData.autoantigen}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.autoantigen ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Double-stranded DNA"
              />
              {validationErrors.autoantigen && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.autoantigen}</p>
              )}
            </div>

            {/* Epitope */}
            <div>
              <label htmlFor="epitope" className="block text-sm font-medium text-gray-700 mb-2">
                Epitope
              </label>
              <input
                type="text"
                id="epitope"
                name="epitope"
                value={formData.epitope}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Specific binding site on the antigen"
              />
              <p className="mt-1 text-sm text-gray-500">Optional: Specific epitope or binding site</p>
            </div>

            {/* UniProt ID */}
            <div>
              <label htmlFor="uniprotId" className="block text-sm font-medium text-gray-700 mb-2">
                UniProt ID
              </label>
              <input
                type="text"
                id="uniprotId"
                name="uniprotId"
                value={formData.uniprotId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.uniprotId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., P12345"
              />
              {validationErrors.uniprotId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.uniprotId}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Optional: UniProt database identifier for the antigen protein
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reset Form
              </button>
              
              <div className="flex gap-3">
                <Link
                  href="/dashboard/superadmin"
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Disease Entry
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Tips for adding disease entries:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use standard medical terminology for disease names</li>
            <li>• Include the specific autoantibody type (e.g., IgG, IgM)</li>
            <li>• Provide the most specific antigen information available</li>
            <li>• UniProt ID should be in the format P12345 or A1B2C3</li>
            <li>• All required fields must be filled before submission</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default AddDisease;
