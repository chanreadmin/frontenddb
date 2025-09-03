import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from '../../redux/actions/userActions';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { ChevronLeft, Mail, Phone, User, Briefcase, Building2, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

const UserDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query; 
  const { user, loading } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  console.log(user);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetails(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="text-md font-medium text-gray-900 mt-4">Loading user details...</h3>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-md font-medium text-gray-900">User not found</h3>
          <p className="text-sm text-gray-500 mt-2">The user you are looking for does not exist or you do not have permission to view it.</p>
          <Link href="/users" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Users
          </Link>
        </div>
      </Layout>
    );
  }

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="mb-8">
        <Link href="/users">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
            <ChevronLeft size={20} />
            <span className="text-sm">Back to Users</span>
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main User Information */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <User size={32} className="text-blue-500" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium">
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
                {(currentUser.role === 'superAdmin' || currentUser.role === 'Admin') && (
                  <Link href={`/users/edit/${user._id}`}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Edit User
                    </button>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Contact Information</h3>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-sm">{user.contactNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Account Information</h3>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Center Information */}
          {user.center && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-gray-400" />
                Center Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.center.name}</p>
                  <p className="text-xs text-gray-500">Center Code: {user.center.centerCode}</p>
                </div>
                
                {user.center.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm">{user.center.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role-specific Information */}
          {user.role === 'Doctor' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Doctor Information</h3>
              
              <div className="space-y-3">
                {user.specialization && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Specialization</p>
                    <p className="text-sm text-gray-600">{user.specialization}</p>
                  </div>
                )}
                
                {user.consultationCharges && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Consultation Charges</p>
                    <p className="text-sm text-gray-600">₹{user.consultationCharges}</p>
                  </div>
                )}
                
                {user.department && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Department</p>
                    <p className="text-sm text-gray-600">{user.department.name || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Account Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-xs text-gray-500">
                  {formatDate(user.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetails;