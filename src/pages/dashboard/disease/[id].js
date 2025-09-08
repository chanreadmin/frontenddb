import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Layout from "@/components/Layout";
import {
  ArrowLeft,
  Edit2Icon,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Database,
  AlertCircle,
  CheckCircle,
  Copy,
  Share2,
} from "lucide-react";
import {
  getEntryById,
  deleteEntry,
  getAllEntries,
} from "@/redux/actions/diseaseActions";
import {
  clearEntryError,
  clearDeleteSuccess,
} from "@/redux/slices/diseaseSlice";

const DiseaseDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const {
    currentEntry,
    relatedEntries,
    entryLoading,
    entryError,
    deleteSuccess,
    loading,
  } = useSelector((state) => state.disease);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  // Load entry data when ID is available
  useEffect(() => {
    if (id && id !== "undefined") {
      dispatch(getEntryById(id));
    }
  }, [id, dispatch]);

  // Handle successful deletion
  useEffect(() => {
    if (deleteSuccess) {
      dispatch(clearDeleteSuccess());
      router.push("/dashboard/disease");
    }
  }, [deleteSuccess, dispatch, router]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearEntryError());
    };
  }, [dispatch]);

  const handleDelete = async () => {
    if (currentEntry?._id) {
      await dispatch(deleteEntry(currentEntry._id));
      setShowDeleteConfirm(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareEntry = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Disease Entry: ${currentEntry?.disease}`,
          text: `${currentEntry?.autoantibody} - ${currentEntry?.autoantigen}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyToClipboard(url, "URL");
      }
    } else {
      copyToClipboard(url, "URL");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUniProtLink = (uniprotId) => {
    if (!uniprotId || uniprotId === "Multiple") return null;
    return `https://www.uniprot.org/uniprot/${uniprotId}`;
  };

  const handleRelatedEntryClick = (relatedEntry) => {
    router.push(`/dashboard/disease/${relatedEntry._id}`);
  };

  // Loading state
  if (entryLoading || !id) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading entry details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (entryError) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Entry Not Found
            </h2>
            <p className="text-red-600 mb-4">{entryError}</p>
            <Link
              href="/dashboard/disease"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Database
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // No entry state
  if (!currentEntry) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Entry Found
            </h2>
            <p className="text-gray-600 mb-4">
              The requested entry could not be loaded.
            </p>
            <Link
              href="/dashboard/disease"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Database
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* <Link
              href="/dashboard/disease"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Database
            </Link> */}

            <h1 className="text-lg font-bold text-gray-900">Details</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareEntry}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
            <Link
              href={`/dashboard/disease/edit/${currentEntry._id}`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit2Icon size={16} />
              Edit Entry
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Copy Success Message */}
        {copySuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
            {copySuccess} copied to clipboard!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Primary Information
                </h2>
                {currentEntry.metadata?.verified && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    Verified
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disease
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-blue-900 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        {currentEntry.disease}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(currentEntry.disease, "Disease")
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Autoantibody
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1">
                        {currentEntry.autoantibody}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            currentEntry.autoantibody,
                            "Autoantibody"
                          )
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Autoantigen
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1">
                        {currentEntry.autoantigen}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            currentEntry.autoantigen,
                            "Autoantigen"
                          )
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Epitope
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1">
                        {currentEntry.epitope || (
                          <span className="text-gray-400 italic">
                            Not specified
                          </span>
                        )}
                      </p>
                      {currentEntry.epitope && (
                        <button
                          onClick={() =>
                            copyToClipboard(currentEntry.epitope, "Epitope")
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1">
                        {currentEntry.type || (
                          <span className="text-gray-400 italic">Not specified</span>
                        )}
                      </p>
                      {currentEntry.type && (
                        <button
                          onClick={() => copyToClipboard(currentEntry.type, "Type")}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UniProt Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                UniProt Information
              </h2>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UniPort ID
                  </label>
                  {currentEntry.uniprotId ? (
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-semibold text-blue-700">
                        {currentEntry.uniprotId}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(currentEntry.uniprotId, "UniPort ID")
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Not available</span>
                  )}
                </div>

                {getUniProtLink(currentEntry.uniprotId) && (
                  <a
                    href={getUniProtLink(currentEntry.uniprotId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={16} />
                    View
                  </a>
                )}
              </div>
            </div>

            {/* Related Entries */}
            {relatedEntries && relatedEntries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Related Entries
                </h2>

                <div className="space-y-3">
                  {relatedEntries.map((related) => (
                    <div
                      key={related._id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleRelatedEntryClick(related)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-blue-600">
                              {related.disease}
                            </span>
                            {related.disease !== currentEntry.disease && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Different Disease
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {related.autoantibody} → {related.autoantigen}
                          </p>
                          {related.epitope && (
                            <p className="text-xs text-gray-500 mt-1">
                              Epitope: {related.epitope}
                            </p>
                          )}
                        </div>
                        <ExternalLink size={14} className="text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Entry Metadata
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Date Added
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(currentEntry.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(
                        currentEntry.metadata?.lastUpdated ||
                          currentEntry.updatedAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Source</p>
                    <p className="text-sm text-gray-600">
                      {currentEntry.metadata?.source || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Entry ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 font-mono">
                        {currentEntry._id}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(currentEntry._id, "Entry ID")
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Link
                  href={`/dashboard/disease/edit/${currentEntry._id}`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Edit2Icon size={16} />
                  Edit This Entry
                </Link>

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/disease?disease=${encodeURIComponent(
                        currentEntry.disease
                      )}`
                    )
                  }
                  className="w-full flex items-center gap-2 px-4 py-2 text-left bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Database size={16} />
                  View All {currentEntry.disease} Entries
                </button>

                {currentEntry.uniprotId &&
                  getUniProtLink(currentEntry.uniprotId) && (
                    <a
                      href={getUniProtLink(currentEntry.uniprotId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 px-4 py-2 text-left bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <ExternalLink size={16} />
                      UniProt Database
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Deletion
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this entry? This action cannot
                be undone.
              </p>

              <div className="bg-gray-50 p-3 rounded-lg mb-6 border">
                <p className="text-sm font-medium text-gray-700">
                  Entry to be deleted:
                </p>
                <p className="text-sm text-gray-600">
                  {currentEntry.disease} - {currentEntry.autoantibody}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Deleting..." : "Delete Entry"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DiseaseDetailPage;
