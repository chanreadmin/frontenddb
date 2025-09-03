import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../redux/actions/userActions';
import Layout from '../../components/Layout';
import { Search, UserPlus, Phone, Mail, User, Pencil, Eye, Filter } from 'lucide-react';

const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, pagination } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Build query parameters based on filters
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search if provided
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    // Add role filter if selected
    if (selectedRole !== 'all') {
      params.role = selectedRole;
    }

    // Only show active users by default
    params.isActive = true;

    // Fetch users with parameters
    dispatch(fetchUsers(params));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, selectedRole]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  // Get available role options based on current user's permissions
  const getRoleOptions = () => {
    const baseOptions = [{ label: 'All Users', value: 'all' }];
    
    if (currentUser?.role === 'superAdmin') {
      return [
        ...baseOptions,
        { label: 'Super Admins', value: 'superAdmin' },
        { label: 'Admins', value: 'Admin' },
        { label: 'Doctors', value: 'Doctor' },
        { label: 'Receptionists', value: 'Receptionist' },
        { label: 'Accountants', value: 'Accountant' },
      ];
    } else if (currentUser?.role === 'Admin') {
      return [
        ...baseOptions,
        { label: 'Doctors', value: 'Doctor' },
        { label: 'Receptionists', value: 'Receptionist' },
        { label: 'Accountants', value: 'Accountant' },
      ];
    }
    
    return baseOptions;
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination?.totalPages || 1)));
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(pagination?.totalPages || 1, prev + 1));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Doctor':
        return 'bg-blue-50 text-blue-600';
      case 'Admin':
        return 'bg-purple-50 text-purple-600';
      case 'Receptionist':
        return 'bg-green-50 text-green-600';
      case 'Accountant':
        return 'bg-yellow-50 text-yellow-600';
      case 'superAdmin':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const canCreateUsers = currentUser?.role === 'superAdmin' || currentUser?.role === 'Admin';
  const canEditUsers = currentUser?.role === 'superAdmin' || currentUser?.role === 'Admin';

  const roleOptions = getRoleOptions();

  // Calculate statistics from current users array
  const stats = [
    { 
      label: 'Total Users', 
      value: pagination?.totalUsers || users?.length || 0, 
      color: 'blue',
      show: true 
    },
    { 
      label: 'Doctors', 
      value: users?.filter(user => user.role === 'Doctor').length || 0, 
      color: 'green',
      show: true 
    },
    { 
      label: 'Admins', 
      value: users?.filter(user => user.role === 'Admin').length || 0, 
      color: 'purple',
      show: currentUser?.role === 'superAdmin' 
    },
    { 
      label: 'Receptionists', 
      value: users?.filter(user => user.role === 'Receptionist').length || 0, 
      color: 'yellow',
      show: true 
    },
    { 
      label: 'Accountants', 
      value: users?.filter(user => user.role === 'Accountant').length || 0, 
      color: 'red',
      show: true 
    },
  ].filter(stat => stat.show);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="text-md font-medium text-gray-900 mt-4">Loading users...</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Users</h1>
            <p className="mt-1 text-sm text-gray-600">
              {currentUser?.role === 'superAdmin' 
                ? 'Manage all users across the system'
                : 'Manage users in the system'
              }
            </p>
          </div>
          {canCreateUsers && (
            <Link href="/users/new">
              <span className="inline-flex items-center gap-2 px-4 rounded-2xl hover:shadow-md py-2 border transition-colors cursor-pointer">
                <UserPlus size={20} />
                <span className='text-sm'>Add User</span>
              </span>
            </Link>
          )}
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className={`grid grid-cols-5 md:grid-cols-${stats.length} gap-4 mb-6`}>
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg border p-4 text-center">
            <div className={`text-${stat.color}-600 text-lg font-semibold`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <User size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{user.contactNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/users/${user._id}`}>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} className="text-gray-500" />
                        </button>
                      </Link>
                      {canEditUsers && (
                        <Link href={`/users/edit/${user._id}`}>
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit User"
                          >
                            <Pencil size={16} className="text-gray-500" />
                          </button>
                        </Link>
                      )}
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Call User"
                        onClick={() => window.open(`tel:${user.contactNumber}`)}
                      >
                        <Phone size={16} className="text-gray-500" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Email User"
                        onClick={() => window.open(`mailto:${user.email}`)}
                      >
                        <Mail size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {(!users || users.length === 0) && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
          <h3 className="text-md font-medium text-gray-900">No users found</h3>
          <p className="text-sm mt-1 text-gray-500">
            {searchTerm || selectedRole !== 'all'
              ? "Try adjusting your search or filter to find what you're looking for."
              : canCreateUsers 
                ? "Get started by creating your first user."
                : "No users have been created yet."
            }
          </p>
          {canCreateUsers && !searchTerm && selectedRole === 'all' && (
            <Link href="/users/new">
              <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus size={18} />
                <span>Add First User</span>
              </button>
            </Link>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {users && users.length > 0 && pagination && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalUsers} total users)
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm hover:bg-gray-50"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                </>
              )}

              {/* Current page and neighbors */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page >= currentPage - 2 && page <= currentPage + 2;
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                      page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Last page */}
              {currentPage < pagination.totalPages - 2 && (
                <>
                  {currentPage < pagination.totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => goToPage(pagination.totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm hover:bg-gray-50"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserList;