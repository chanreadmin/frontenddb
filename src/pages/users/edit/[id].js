// File: pages/users/edit/[id].js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, fetchUserDetails } from '@/redux/actions/userActions';

import Layout from '@/components/Layout';
import { User, Mail, Phone, Briefcase, GraduationCap, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const EditUser = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  // Redux state
  const { loading, error, success, user } = useSelector((state) => state.users);


  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    contactNumber: '',
    role: '',

    specialization: '',
    consultationCharges: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when unmounting or ID changes
  useEffect(() => {
    return () => {
      setFormData({
        name: '',
        username: '',
        email: '',
        contactNumber: '',
        role: '',
     
        specialization: '',
        consultationCharges: '',
      });
    };
  }, [id]);

  // Fetch user details and departments when component mounts
  useEffect(() => {
    if (!id) {
      router.push('/users');
      return;
    }

    console.log('Fetching user with ID:', id);
    dispatch(fetchUserDetails(id));
 
  }, [id, dispatch, router]);

  // Populate form when user data is fetched
  useEffect(() => {
    if (user) {
      console.log('Setting form data with user:', user);
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        role: user.role || '',
        department: user.department?._id || user.department || '',
        specialization: user.specialization || '',
        consultationCharges: user.consultationCharges || '',
      });
    }
  }, [user]);

  // Handle success and error states
  useEffect(() => {
    if (success) {
      toast.success('User updated successfully!');
      router.push('/users');
    }
    if (error) {
      toast.error(error);
      setErrorMessage(error);
    }
  }, [success, error, router]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.contactNumber) {
      setErrorMessage('Please fill in all required fields');
      return false;
    }

    if (formData.role === 'Doctor' && (!formData.department || !formData.specialization || !formData.consultationCharges)) {
      setErrorMessage('Please fill in all doctor-specific fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setErrorMessage('Please enter a valid 10-digit contact number');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Submitting update for user:', id);
      console.log('Form data:', formData);

      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        department: formData.department,
        specialization: formData.specialization,
        consultationCharges: formData.consultationCharges
      };

      await dispatch(updateUser({ id, data: updateData })).unwrap();
    } catch (err) {
      console.error('Update error:', err);
      setErrorMessage(err.message || 'Failed to update user');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Edit User</h1>
            <p className="text-gray-500 mt-1 text-sm">Update user information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-sm">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700">Name<span className='text-red-500'>*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email<span className='text-red-500'>*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Contact Number<span className='text-red-500'>*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-digit contact number"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.role}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                disabled
              />
            </div>
          </div>

          {formData.role === 'Doctor' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700">Department<span className='text-red-500'>*</span></label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments && departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Specialization<span className='text-red-500'>*</span></label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter specialization"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Consultation Charges<span className='text-red-500'>*</span></label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    name="consultationCharges"
                    value={formData.consultationCharges}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter consultation charges"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditUser;