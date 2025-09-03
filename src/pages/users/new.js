import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/redux/actions/userActions';
import Layout from '../../components/Layout';
import { UserPlus, User, Mail, Phone, Briefcase, EyeClosed } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const AddUser = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Redux state
  const { createLoading, error, success } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    contactNumber: '',
    role: '',
    password: '',
    consultationCharges: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Reset form on successful submission
  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        username: '',
        email: '',
        contactNumber: '',
        role: '',
        password: '',
        consultationCharges: '',
      });
      toast.success('User created successfully!');
      router.push('/users');
    }
  }, [success, router]);

  // Display error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
      setErrorMessage(error);
    }
  }, [error]);

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (currentUser?.role === 'superAdmin') {
      return [
        { label: 'Admin', value: 'Admin' },
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Receptionist', value: 'Receptionist' },
        { label: 'Accountant', value: 'Accountant' }
      ];
    } else if (currentUser?.role === 'Admin') {
      return [
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Receptionist', value: 'Receptionist' },
        { label: 'Accountant', value: 'Accountant' }
      ];
    }
    return [];
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.role || !formData.contactNumber) {
      setErrorMessage('Please fill in all required fields');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    // Contact number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setErrorMessage('Please enter a valid 10-digit contact number');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }

    // Consultation charges validation for doctors
    if (formData.role === 'Doctor' && formData.consultationCharges && isNaN(formData.consultationCharges)) {
      setErrorMessage('Please enter a valid consultation charge amount');
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
      const userData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        contactNumber: formData.contactNumber.trim(),
      };

      // Add consultation charges for doctors
      if (formData.role === 'Doctor' && formData.consultationCharges) {
        userData.consultationCharges = parseFloat(formData.consultationCharges);
      }

      await dispatch(createUser(userData)).unwrap();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create user');
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Add New User</h1>
            <p className="text-gray-500 mt-1 text-sm">
              {currentUser?.role === 'superAdmin' 
                ? 'Create and manage users across the system'
                : 'Create users in the system'
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-sm">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Name<span className='text-red-500'>*</span>
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Username<span className='text-red-500'>*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email<span className='text-red-500'>*</span>
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password<span className='text-red-500'>*</span>
            </label>
            <div className="relative">
              <EyeClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password (min 6 characters)"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Contact Number<span className='text-red-500'>*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-digit contact number"
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Role<span className='text-red-500'>*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Consultation Charges field for Doctors */}
          {formData.role === 'Doctor' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Consultation Charges (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  name="consultationCharges"
                  value={formData.consultationCharges}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter consultation charges"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if not applicable or to be set later
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm ${
                createLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus size={18} />
              <span>{createLoading ? 'Creating...' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddUser;