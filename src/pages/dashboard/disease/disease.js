import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "@/components/Layout";
import Link from "next/link";
import { Edit2Icon, Eye, Plus, Search, Filter, X } from "lucide-react";
import {
  getAllEntries,
  getStatistics,
  getUniqueValues,
  getFilteredUniqueValues,
} from "@/redux/actions/diseaseActions";
import { searchEntries } from "@/redux/actions/diseaseActions";
import {
  clearError,
  setFilters,
  clearFilters,
  resetDependentFilters,
} from "@/redux/slices/diseaseSlice";

const DiseasePage = () => {
  const dispatch = useDispatch();
  const {
    entries,
    loading,
    error,
    pagination,
    statistics,
    uniqueValues,
    filteredUniqueValues,
    filters,
    appliedFilters,
    uniqueValuesLoading,
    searchResults,
    searchLoading,
  } = useSelector((state) => state.disease);

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    type: filters.type || "",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.search !== filters.search) {
        dispatch(setFilters({ search: localFilters.search }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters.search, filters.search, dispatch]);

  // Load initial data (do not load entries on mount)
  useEffect(() => {
    dispatch(getStatistics());
    dispatch(getUniqueValues("disease"));
  }, [dispatch]);

  // Handle search and filter changes
  const handleFiltersChange = useCallback(
    (newFilters, applyImmediately = false) => {
      setLocalFilters((prev) => ({ ...prev, ...newFilters }));

      if (applyImmediately) {
        const combinedFilters = { ...localFilters, ...newFilters };
        dispatch(setFilters(combinedFilters));

        // Apply filters to get new entries
        dispatch(
          getAllEntries({
            page: 1,
            limit: 20,
            ...combinedFilters,
          })
        );
        setHasInteracted(true);
      }
    },
    [localFilters, dispatch]
  );

  // Handle disease filter change with cascading effect
  const handleDiseaseChange = useCallback(
    (disease) => {
      const newFilters = {
        disease,
        autoantibody: "",
        autoantigen: "",
        epitope: "",
      };

      // Reset dependent filters in Redux
      dispatch(resetDependentFilters({ field: "disease" }));
      handleFiltersChange(newFilters, true);

      // Load filtered values for dependent fields
      if (disease) {
        dispatch(
          getFilteredUniqueValues({
            field: "autoantibody",
            filters: { disease },
          })
        );
        dispatch(
          getFilteredUniqueValues({
            field: "autoantigen",
            filters: { disease },
          })
        );
      }
    },
    [dispatch, handleFiltersChange]
  );

  // Handle autoantibody filter change
  const handleAutoantibodyChange = useCallback(
    (autoantibody) => {
      // Reset dependent filters in Redux
      dispatch(resetDependentFilters({ field: "autoantibody" }));

      // When autoantibody changes, also reset autoantigen and epitope locally
      const newFilters = { autoantibody, autoantigen: "", epitope: "" };
      handleFiltersChange(newFilters, true);

      // Load autoantigens for selected disease + autoantibody
      if (autoantibody && localFilters.disease) {
        dispatch(
          getFilteredUniqueValues({
            field: "autoantigen",
            filters: {
              disease: localFilters.disease,
              autoantibody,
            },
          })
        );
      }
    },
    [handleFiltersChange, dispatch, localFilters.disease]
  );

  // Handle autoantigen filter change with epitope loading
  const handleAntigenChange = useCallback(
    (autoantigen) => {
      const newFilters = { autoantigen, epitope: "" };
      handleFiltersChange(newFilters, true);

      // Load epitopes for this antigen
      if (autoantigen) {
        dispatch(
          getFilteredUniqueValues({
            field: "epitope",
            filters: {
              disease: localFilters.disease,
              autoantigen,
            },
          })
        );
      }
    },
    [dispatch, handleFiltersChange, localFilters.disease]
  );

  // Handle epitope filter change
  const handleEpitopeChange = useCallback(
    (epitope) => {
      handleFiltersChange({ epitope }, true);
    },
    [handleFiltersChange]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    if (!localFilters.search?.trim()) return;
    dispatch(
      getAllEntries({
        page: 1,
        limit: 20,
        ...localFilters,
      })
    );
    setHasInteracted(true);
    setShowSuggestions(false);
  }, [dispatch, localFilters]);

  // Suggestion search (debounced)
  useEffect(() => {
    const q = localFilters.search?.trim();
    if (!q || q.length < 2) {
      setShowSuggestions(false);
      return;
    }
    const t = setTimeout(() => {
      dispatch(searchEntries({ searchTerm: q, field: "all", limit: 50 }));
      setShowSuggestions(true);
    }, 250);
    return () => clearTimeout(t);
  }, [localFilters.search, dispatch]);

  // Build grouped unique suggestions from search results
  const groupedSuggestions = useMemo(() => {
    const limitPerGroup = 6;
    const addUnique = (set, val) => {
      if (!val) return;
      const v = val.toString().trim();
      if (v && !set.has(v)) set.add(v);
    };
    const diseases = new Set();
    const antibodies = new Set();
    const antigens = new Set();
    const epitopes = new Set();
    (searchResults || []).forEach((r) => {
      addUnique(diseases, r.disease);
      addUnique(antibodies, r.autoantibody);
      addUnique(antigens, r.autoantigen);
      addUnique(epitopes, r.epitope);
    });
    return {
      disease: Array.from(diseases).slice(0, limitPerGroup),
      autoantibody: Array.from(antibodies).slice(0, limitPerGroup),
      autoantigen: Array.from(antigens).slice(0, limitPerGroup),
      epitope: Array.from(epitopes).slice(0, limitPerGroup),
    };
  }, [searchResults]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectSuggestion = useCallback(
    (section, value) => {
      const next = { ...localFilters, field: section, search: value };
      setLocalFilters(next);
      dispatch(setFilters({ field: section, search: value }));
      setShowSuggestions(false);
      dispatch(getAllEntries({ page: 1, limit: 20, ...next }));
      setHasInteracted(true);
    },
    [dispatch, localFilters]
  );

  // Handle sorting
  const handleSort = useCallback(
    (field) => {
      const newOrder =
        filters.sortBy === field && filters.sortOrder === "asc"
          ? "desc"
          : "asc";
      const newFilters = { sortBy: field, sortOrder: newOrder };

      handleFiltersChange(newFilters);
      dispatch(
        getAllEntries({
          page: 1,
          limit: 20,
          ...localFilters,
          ...newFilters,
        })
      );
    },
    [
      filters.sortBy,
      filters.sortOrder,
      handleFiltersChange,
      dispatch,
      localFilters,
    ]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setLocalFilters({
      search: "",
      field: "all",
      disease: "",
      autoantibody: "",
      autoantigen: "",
      epitope: "",
      type: "",
      sortBy: "disease",
      sortOrder: "asc",
    });

    dispatch(clearFilters());
    dispatch(
      getAllEntries({
        page: 1,
        limit: 20,
        sortBy: "disease",
        sortOrder: "asc",
      })
    );
  }, [dispatch]);

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage) => {
      dispatch(
        getAllEntries({
          page: newPage,
          limit: 20,
          ...localFilters,
        })
      );
    },
    [dispatch, localFilters]
  );

  // Check if any filters are active
  const hasActiveFilters =
    localFilters.search ||
    localFilters.disease ||
    localFilters.autoantibody ||
    localFilters.autoantigen ||
    localFilters.epitope ||
    localFilters.type;

  return (
    <Layout>
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Disease Database
          </h1>
          <p className="text-gray-600 text-sm">
            Search and explore disease-related autoantibody, autoantigen, and
            epitope data
          </p>
        </div>
        <Link
          href="/dashboard/disease/add-disease"
          className="inline-flex items-center gap-2 px-4 py-2 shadow text-blue-500 rounded-lg  hover:border-blue-500 hover:border-2 hover:font-bold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus size={18} />
          Add New Disease
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex flex-1 gap-2" ref={searchContainerRef}>
          <select
            value={localFilters.field}
            onChange={(e) => handleFiltersChange({ field: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Fields</option>
            <option value="disease">Disease Name</option>
            <option value="autoantibody">Autoantibody</option>
            <option value="autoantigen">Autoantigen</option>
            <option value="epitope">Epitope</option>
            <option value="type">Type</option>
          </select>

          <input
            type="text"
            placeholder={`Search ${
              localFilters.field === "all" ? "all fields" : localFilters.field
            }...`}
            value={localFilters.search}
            onChange={(e) => handleFiltersChange({ search: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 "
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Search size={16} />
          </button>
          {showSuggestions && (
            <div className="absolute z-20 mt-12 w-full max-w-3xl bg-white border border-gray-200 rounded-md shadow-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["disease", "autoantibody", "autoantigen", "epitope"].map(
                  (section) => (
                    <div key={section}>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        {section}
                      </div>
                      {searchLoading && (
                        <div className="text-xs text-gray-400">Loading...</div>
                      )}
                      {!searchLoading &&
                        groupedSuggestions[section]?.length === 0 && (
                          <div className="text-xs text-gray-400">
                            No suggestions
                          </div>
                        )}
                      <ul className="space-y-1 max-h-40 overflow-auto">
                        {groupedSuggestions[section]?.map((val) => (
                          <li key={`${section}-${val}`}>
                            <button
                              onClick={() => selectSuggestion(section, val)}
                              className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-700"
                            >
                              {val}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            showFilters
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } ${hasActiveFilters ? "ring-2 ring-blue-300" : ""}`}
        >
          <Filter size={16} />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                <X size={14} />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Disease Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Disease
              </label>
              <select
                value={localFilters.disease}
                onChange={(e) => handleDiseaseChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Diseases</option>
                {filteredUniqueValues.disease?.map((disease, index) => (
                  <option key={index} value={disease}>
                    {disease}
                  </option>
                ))}
              </select>
            </div>

            {/* Autoantibody Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Autoantibody
              </label>
              <select
                value={localFilters.autoantibody}
                onChange={(e) => handleAutoantibodyChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !localFilters.disease
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
                disabled={!localFilters.disease || uniqueValuesLoading}
              >
                <option value="">
                  {uniqueValuesLoading
                    ? "Loading..."
                    : !localFilters.disease
                    ? "Select disease first"
                    : "All Autoantibodies"}
                </option>
                {filteredUniqueValues.autoantibody?.map((antibody, index) => (
                  <option key={index} value={antibody}>
                    {antibody}
                  </option>
                ))}
              </select>
            </div>

            {/* Autoantigen Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Autoantigen
              </label>
              <select
                value={localFilters.autoantigen}
                onChange={(e) => handleAntigenChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !localFilters.autoantibody
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
                disabled={!localFilters.autoantibody || uniqueValuesLoading}
              >
                <option value="">
                  {uniqueValuesLoading
                    ? "Loading..."
                    : !localFilters.autoantibody
                    ? "Select autoantibody first"
                    : "All Autoantigens"}
                </option>
                {filteredUniqueValues.autoantigen?.map((antigen, index) => (
                  <option key={index} value={antigen}>
                    {antigen}
                  </option>
                ))}
              </select>
            </div>

            {/* Epitope Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Epitope
              </label>
              <select
                value={localFilters.epitope}
                onChange={(e) => handleEpitopeChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !localFilters.autoantigen
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
                disabled={!localFilters.autoantigen || uniqueValuesLoading}
              >
                <option value="">
                  {uniqueValuesLoading
                    ? "Loading..."
                    : !localFilters.autoantigen
                    ? "Select autoantigen first"
                    : "All Epitopes"}
                </option>
                {filteredUniqueValues.epitope?.map((epitope, index) => (
                  <option key={index} value={epitope}>
                    {epitope}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applied Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {appliedFilters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Search: "{appliedFilters.search}"
                  </span>
                )}
                {appliedFilters.disease && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Disease: {appliedFilters.disease}
                  </span>
                )}
                {appliedFilters.autoantibody && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Autoantibody: {appliedFilters.autoantibody}
                  </span>
                )}
                {appliedFilters.autoantigen && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Autoantigen: {appliedFilters.autoantigen}
                  </span>
                )}
                {appliedFilters.epitope && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                    Epitope: {appliedFilters.epitope}
                  </span>
                )}
                {appliedFilters.type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    Type: {appliedFilters.type}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            {/* <h3 className="text-lg font-semibold text-gray-900">
              Search Results
            </h3> */}
            {/* <span className="text-gray-500 text-sm">
              {loading
                ? "Loading..."
                : `${pagination.total || 0} entries found`}
            </span> */}
          </div>

          {/* <div className="flex items-center gap-2">
            <span className="text-gray-700 text-sm">Sort by:</span>
            {["disease", "autoantibody", "autoantigen"].map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                  filters.sortBy === field
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {filters.sortBy === field && (
                  <span className="ml-1">
                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
          </div> */}
        </div>

        {/* Loading State */}
        {loading && hasInteracted && (
          <div className="flex flex-col items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        )}

        {/* Error State */}
        {error && hasInteracted && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Table */}
        {!loading && !error && hasInteracted && entries.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Disease
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Autoantibody
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Autoantigen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Epitope
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    UniPort ID
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {entry.disease}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.autoantibody}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.autoantigen}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.epitope || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entry.uniprotId ? (
                        <Link
                          href={`https://www.uniprot.org/uniprot/${entry.uniprotId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono text-xs font-bold"
                        >
                          {entry.uniprotId}
                        </Link>
                      ) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    {/* <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.type || (
                        <span className="text-gray-400 italic"></span>
                      )}
                    </td> */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/disease/${entry._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2Icon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Initial Empty State */}
        {!hasInteracted && (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔎</div>
            <h3 className="text-lg font-semibold mb-2">
              Start by searching or using filters
            </h3>
            <p className="text-center">
              Use the search bar or open Advanced Filters to refine your
              results.
            </p>
          </div>
        )}

        {/* No Results State after interaction */}
        {!loading && !error && hasInteracted && entries.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-center mb-4">
              {hasActiveFilters
                ? "Try adjusting your search terms or filters to find more results."
                : "No entries match your current criteria."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {/* Show page numbers */}
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DiseasePage;
