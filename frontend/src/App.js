import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import AuthCallback from './components/AuthCallback';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute:', { isAuthenticated, isLoading, path: location.pathname });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to home - not authenticated');
    // Save the attempted URL for redirecting after login
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const App = () => {
  const { isLoading, isAuthenticated, getToken } = useKindeAuth();

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('App: Initializing auth...');
        if (isAuthenticated && !isLoading) {
          console.log('App: User is authenticated, getting token...');
          const token = await getToken();
          if (token) {
            console.log('App: Token received, storing...');
            localStorage.setItem('kinde_access_token', token);
          }
        }
      } catch (error) {
        console.error('App: Auth initialization error:', error);
      }
    };

    initAuth();
  }, [isAuthenticated, isLoading, getToken]);

  console.log('App: Auth State:', { isLoading, isAuthenticated });

  // Show loading spinner while initial auth check is happening
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        
        {/* Auth Callback Route */}
        <Route 
          path="/callback" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthCallback />
            )
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

export default App; 