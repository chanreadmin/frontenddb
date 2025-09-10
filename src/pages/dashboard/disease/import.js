import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { importEntriesFromFile } from '../../../redux/actions/diseaseActions';
import Layout from '@/components/Layout';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function ImportDiseaseData() {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || 
          droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          droppedFile.type === 'application/vnd.ms-excel') {
        setFile(droppedFile);
        setStatus(null);
      } else {
        setStatus({ type: 'error', message: 'Please select a valid CSV or XLSX file' });
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a CSV or XLSX file' });
      return;
    }
    setLoading(true);
    try {
      const resultAction = await dispatch(importEntriesFromFile(file));
      if (importEntriesFromFile.fulfilled.match(resultAction)) {
        setStatus({ 
          type: 'success', 
          message: resultAction.payload.message || 'Import completed successfully! Data has been added to the database.' 
        });
        setFile(null); // Clear file after successful import
      } else {
        setStatus({ type: 'error', message: resultAction.payload || 'Import failed. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Import failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Import Disease Data
          </h1>
          <p className="text-gray-600 text-sm">
            Upload CSV or XLSX files to bulk import disease-related data into the database
          </p>
        </div>
        <Link
          href="/dashboard/disease"
          className="inline-flex items-center gap-2 px-4 py-2 shadow text-blue-500 rounded-lg hover:border-blue-500 hover:border-2 hover:font-bold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <FileText size={18} />
          View Database
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
            
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Upload size={24} className="text-gray-600" />
                </div>
                
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Selected file: {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports CSV and XLSX files up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload & Import
                  </>
                )}
              </button>
              
              {file && !loading && (
                <button
                  onClick={() => {
                    setFile(null);
                    setStatus(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Clear File
                </button>
              )}
            </div>

            {/* Status Messages */}
            {status && (
              <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 ${
                status.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-red-600 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {status.type === 'success' ? 'Success!' : 'Error'}
                  </p>
                  <p className="text-sm">{status.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Current Data</h2>
            <p className="text-gray-600 text-sm mb-4">
              Download the current database contents to use as a template or for backup purposes.
            </p>
            
            <a
              href="/api/disease/export/data?format=csv"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <Download size={16} />
              Download as CSV
            </a>
          </div>
        </div>

        {/* Sidebar - Instructions */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">File Requirements</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Supported Formats</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSV (.csv)</li>
                  <li>• Excel (.xlsx, .xls)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Columns</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <span className="font-medium">Disease</span> - Disease name</li>
                  <li>• <span className="font-medium">Autoantibody</span> - Autoantibody name</li>
                  <li>• <span className="font-medium">Autoantigen</span> - Autoantigen name</li>
                  <li>• <span className="font-medium">Epitope</span> - Epitope sequence</li>
                  <li>• <span className="font-medium">UniProt ID</span> - UniProt identifier</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  You may include any other columns; they will be stored as dynamic fields.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tips</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use exact column names as shown above</li>
                  <li>• First row should contain column headers</li>
                  <li>• Empty cells are allowed for optional fields</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sample Data Preview */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Format</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Disease</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Autoantibody</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700">Autoantigen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-2 py-2 text-gray-600">Type 1 Diabetes</td>
                    <td className="px-2 py-2 text-gray-600">Anti-GAD</td>
                    <td className="px-2 py-2 text-gray-600">GAD65</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-600">Celiac Disease</td>
                    <td className="px-2 py-2 text-gray-600">Anti-tTG</td>
                    <td className="px-2 py-2 text-gray-600">Transglutaminase 2</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This shows the expected data structure for your import file.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}