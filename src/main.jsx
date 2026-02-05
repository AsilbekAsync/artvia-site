import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import axios from 'axios';

// axios.defaults.baseURL = 'http://localhost:5000';

// // Verify baseURL is set (for debugging)
// if (process.env.NODE_ENV === 'development') {
//   console.log('Axios baseURL configured:', axios.defaults.baseURL);
// }

// Add request interceptor to ALWAYS set Authorization header if token exists
// This ensures token is included in ALL requests, even before AuthContext initializes
axios.interceptors.request.use(
  (config) => {
    // Ensure baseURL is always set (defensive check)
    if (!config.baseURL && !axios.defaults.baseURL) {
      axios.defaults.baseURL = `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}`;
    }
    
    // Set Authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging in development to verify correct URL
    if (process.env.NODE_ENV === 'development' && config.url?.includes('/api/')) {
      const finalUrl = config.baseURL || axios.defaults.baseURL 
        ? `${config.baseURL || axios.defaults.baseURL}${config.url}`
        : config.url;
      console.log('Axios request:', {
        method: config.method?.toUpperCase(),
        url: finalUrl,
        hasToken: !!token
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
// Note: We don't clear token here - let AuthContext handle it
// This prevents race conditions where interceptor clears token
// before AuthContext can properly handle the error
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass the error to AuthContext to handle
    // AuthContext will clear token if needed
    return Promise.reject(error);
  }
);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
