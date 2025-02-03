import React, { useState, useRef, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { userApi } from '../services/api';

const UserProfile = () => {
  const { user, logout, getToken } = useKindeAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    console.log('UserProfile: User state changed:', { user });
  }, [user]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log('UserProfile: Fetching user details...');
        setIsLoading(true);
        setError(null);
        
        // Get and store the token
        console.log('UserProfile: Getting token...');
        const token = await getToken();
        console.log('UserProfile: Token received:', token ? 'Token exists' : 'No token');
        
        if (!token) {
          throw new Error('No token available');
        }
        
        localStorage.setItem('kinde_access_token', token);
        
        console.log('UserProfile: Making API call to get user details...');
        const response = await userApi.getCurrentUser();
        console.log('UserProfile: User details received:', response.data);
        
        setUserDetails(response.data.data.user);
        setFormData({
          firstName: response.data.data.user.firstName || '',
          lastName: response.data.data.user.lastName || ''
        });
      } catch (err) {
        console.error('UserProfile: Error in fetchUserDetails:', err);
        setError('Error fetching user details');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      console.log('UserProfile: User exists, initiating fetch...');
      fetchUserDetails();
    } else {
      console.log('UserProfile: No user available');
    }
  }, [user, getToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('UserProfile: Input changed:', { field: name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('UserProfile: Submitting profile update:', formData);
      setIsLoading(true);
      setError(null);
      
      // Refresh token before making the request
      console.log('UserProfile: Refreshing token...');
      const token = await getToken();
      if (!token) {
        throw new Error('No token available for update');
      }
      
      localStorage.setItem('kinde_access_token', token);
      
      console.log('UserProfile: Making API call to update profile...');
      const response = await userApi.updateProfile(formData);
      console.log('UserProfile: Profile update successful:', response.data);
      
      setUserDetails(response.data.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error('UserProfile: Error updating profile:', err);
      setError('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('UserProfile: Initiating logout...');
      localStorage.removeItem('kinde_access_token');
      localStorage.removeItem('kinde_refresh_token');
      await logout();
      console.log('UserProfile: Logout successful');
    } catch (err) {
      console.error('UserProfile: Error during logout:', err);
    }
  };

  if (!user) {
    console.log('UserProfile: Component not rendering - no user');
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          console.log('UserProfile: Toggle dropdown');
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
          {userDetails?.firstName?.[0] || user.given_name?.[0] || user.email[0].toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
          {error && (
            <div className="px-4 py-2 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}

          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {userDetails?.fullName || user.given_name || user.email}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="px-4 py-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('UserProfile: Cancel edit');
                      setIsEditing(false);
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  console.log('UserProfile: Start editing');
                  setIsEditing(true);
                }}
                disabled={isLoading}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 