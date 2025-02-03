import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import App from './App';
import './index.css';

// Log environment variables for debugging
const envVars = {
  clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
  domain: process.env.REACT_APP_KINDE_DOMAIN,
  redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
  logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,
};

console.log('Environment Variables:', envVars);

// Validate environment variables
if (!envVars.clientId || !envVars.domain || !envVars.redirectUri || !envVars.logoutUri) {
  console.error('Missing required environment variables:', {
    hasClientId: !!envVars.clientId,
    hasDomain: !!envVars.domain,
    hasRedirectUri: !!envVars.redirectUri,
    hasLogoutUri: !!envVars.logoutUri,
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <KindeProvider
      clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
      domain={process.env.REACT_APP_KINDE_DOMAIN}
      redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
      logoutUri={process.env.REACT_APP_KINDE_LOGOUT_URI}
      loginUrl="http://localhost:3001/login"
      onRedirectCallback={(user, appState) => {
        console.log('Redirect Callback:', { user, appState });
        // Store the token immediately if available
        if (user?.access_token) {
          localStorage.setItem('kinde_access_token', user.access_token);
        }
      }}
      onError={(error) => {
        console.error('Kinde Auth Error:', error);
        // Log additional details about the error
        if (error.response) {
          console.error('Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        }
      }}
      scope="openid profile email"
      responseType="code"
      grantType="authorization_code"
      authCallbackRoute="/callback"
      isDangerouslyUseLocalStorage={true}
      logoutParams={{
        returnTo: process.env.REACT_APP_KINDE_LOGOUT_URI
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </KindeProvider>
  </React.StrictMode>
); 