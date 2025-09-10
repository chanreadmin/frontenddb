import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { createEntry } from '@/redux/actions/diseaseActions';
import { clearCreateSuccess, clearError } from '@/redux/slices/diseaseSlice';
import { Plus, ArrowLeft, Save, X, XCircleIcon, ArchiveRestoreIcon } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/utils/axiosSetup';

const AddDisease = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector((state) => state.disease);
  const STORAGE_KEY = 'autoabdb_additional_keys';

  const [formData, setFormData] = useState({
    disease: '',
    autoantibody: '',
    autoantigen: '',
    epitope: '',
    uniprotId: '',
    type: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [additionalFields, setAdditionalFields] = useState([]);

  // Prefill Additional Information with previously used keys from localStorage and API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let localKeys = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) localKeys = parsed.map((k) => String(k));
    } catch (_) {}

    const loadApiKeys = async () => {
      try {
        const resp = await axiosInstance.get('/api/disease/additional/keys');
        const apiKeys = Array.isArray(resp.data?.data) ? resp.data.data.map((k) => String(k)) : [];
        const merged = Array.from(new Set([...apiKeys, ...localKeys]));
        if (merged.length > 0) {
          setAdditionalFields(merged.map((k) => ({ key: k, value: '' })));
        }
      } catch (_err) {
        if (localKeys.length > 0) {
          setAdditionalFields(localKeys.map((k) => ({ key: k, value: '' })));
        }
      }
    };

    loadApiKeys();
  }, []);

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
      const additional = additionalFields.reduce((acc, pair) => {
        const key = (pair.key || '').trim();
        const value = (pair.value || '').toString().trim();
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Persist used keys to localStorage for future prefill
      if (typeof window !== 'undefined') {
        try {
          const existingRaw = localStorage.getItem(STORAGE_KEY);
          const existing = existingRaw ? JSON.parse(existingRaw) : [];
          const submittedKeys = additionalFields
            .map((p) => (p.key || '').trim())
            .filter((k) => k);
          const merged = Array.from(new Set([...(Array.isArray(existing) ? existing : []), ...submittedKeys]));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {
          // ignore storage errors
        }
      }

      const payload = Object.keys(additional).length > 0
        ? { ...formData, additional }
        : formData;

      await dispatch(createEntry(payload));
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
      uniprotId: '',
      type: ''
    });
    setValidationErrors({});
    setAdditionalFields([]);
  };

  const addAdditionalField = () => {
    setAdditionalFields((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeAdditionalField = (index) => {
    setAdditionalFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAdditionalField = (index, field, value) => {
    setAdditionalFields((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
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
            <div className=''>
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

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., IgG, IgM, subtype, etc."
              />
              <p className="mt-1 text-sm text-gray-500">Optional: Entry classification or antibody type</p>
            </div>

            {/* Additional Information (dynamic key-value pairs) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Information
                </label>
                <button
                  type="button"
                  onClick={addAdditionalField}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>
              {additionalFields.length === 0 && (
                <p className="text-xs text-gray-500 mb-2">Add custom key-value metadata (e.g., source, notes, PMID).</p>
              )}
              <div className="space-y-2">
                {additionalFields.map((pair, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={pair.key}
                      onChange={(e) => updateAdditionalField(index, 'key', e.target.value)}
                      placeholder="Key (e.g., PMID)"
                      className="col-span-5 capitalize px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={pair.value}
                      onChange={(e) => updateAdditionalField(index, 'value', e.target.value)}
                      placeholder={`Write here ${pair.key}`}
                      className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalField(index)}
                      className="col-span-1 flex items-center justify-center h-10 text-red-600 hover:text-red-700"
                      aria-label="Remove field"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-center pt-6 border-t border-gray-200">
              {/* <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <ArchiveRestoreIcon size={18} />
              </button> */}
              
              <div className="flex gap-3">
                <Link
                  href="/dashboard/superadmin"
                  className="px-4 py-2 text-red-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  <XCircleIcon size={18} />
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2  text-black rounded-lg shadow hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                     
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
