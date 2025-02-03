import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const AuthCallback = () => {
  const { isAuthenticated, isLoading, getToken, getUser } = useKindeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('AuthCallback: Processing callback...');
        console.log('AuthCallback State:', { isAuthenticated, isLoading });
        console.log('AuthCallback Location:', location);

        // Extract code from URL if present
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        console.log('AuthCallback: Authorization code present:', !!code);

        if (!isLoading) {
          if (code) {
            console.log('AuthCallback: Authorization code found, processing...');
            try {
              console.log('AuthCallback: Getting token...');
              const token = await getToken();
              console.log('AuthCallback: Token received:', !!token);

              if (token) {
                console.log('AuthCallback: Token received, getting user data...');
                const user = await getUser();

                console.log('AuthCallback: User data received:', {
                  hasToken: !!token,
                  user
                });

                localStorage.setItem('kinde_access_token', token);
                if (user) {
                  localStorage.setItem('kinde_user', JSON.stringify(user));
                }

                // Get the intended destination from state or default to dashboard
                const destination = location.state?.from || '/dashboard';
                console.log('AuthCallback: Navigating to:', destination);
                navigate(destination, { replace: true });
              } else {
                throw new Error('No token received after code exchange');
              }
            } catch (error) {
              console.error('AuthCallback: Token exchange error:', error);
              navigate('/', { replace: true });
            }
          } else if (isAuthenticated) {
            console.log('AuthCallback: Already authenticated, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('AuthCallback: No code and not authenticated');
            navigate('/', { replace: true });
          }
        } else {
          console.log('AuthCallback: Still loading...');
        }
      } catch (error) {
        console.error('AuthCallback Error:', error);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [isAuthenticated, isLoading, getToken, getUser, navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
        <p className="text-sm text-gray-500 mt-2">
          {isLoading ? 'Verifying your credentials...' : 'Almost there...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback; 