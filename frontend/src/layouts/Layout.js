import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import UserProfile from '../components/UserProfile';

const Layout = () => {
  const { isAuthenticated, isLoading, login, register, user } = useKindeAuth();

  useEffect(() => {
    console.log('Auth State:', {
      isAuthenticated,
      isLoading,
      user: user || 'No user',
    });
  }, [isAuthenticated, isLoading, user]);

  const handleLogin = () => {
    console.log('Initiating login...');
    login();
  };

  const handleRegister = () => {
    console.log('Initiating registration...');
    register();
  };

  if (isLoading) {
    console.log('Layout: Loading state active');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-800">SaaS App</span>
              </Link>
            </div>

            <div className="flex items-center">
              {isLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <div className="ml-4">
                    <UserProfile />
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogin}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleRegister}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 SaaS App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 