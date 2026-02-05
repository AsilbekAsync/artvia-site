import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Set up axios request interceptor to ALWAYS include token if it exists
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Always check localStorage for token on every request
        // This ensures token is set even if it was added after axios was initialized
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Remove Authorization header if no token
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  const fetchUser = async () => {
    try {
      // Ensure baseURL is set (defensive check)
      if (!axios.defaults.baseURL) {
        axios.defaults.baseURL = 'http://localhost:5000';
        console.warn('Axios baseURL was missing, set to:', axios.defaults.baseURL);
      }
      
      // Verify token exists before making request
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage during fetchUser');
        if (isMountedRef.current) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      // Make request - axios will combine baseURL + '/api/auth/me'
      const res = await axios.get('/api/auth/me');
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      // Backend returns user object directly in res.data
      // If response is successful (status 200-299), set the user
      if (res.status >= 200 && res.status < 300 && res.data) {
        // Set user data - backend guarantees _id, name, email, role, isAdmin
        setUser(res.data);
      } else {
        // Invalid response
        console.warn('Invalid response from /api/auth/me:', res);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        if (isMountedRef.current) {
          setUser(null);
        }
      }
    } catch (error) {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      // Enhanced error logging to debug URL issues
      const requestUrl = error.config?.url || '/api/auth/me';
      const baseURL = error.config?.baseURL || axios.defaults.baseURL;
      const fullUrl = baseURL ? `${baseURL}${requestUrl}` : requestUrl;
      
      console.error('Fetch user failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        requestUrl: fullUrl,
        baseURL: baseURL,
        errorType: error.code || 'unknown'
      });
      
      // Clear token on any auth error (401/403) or if token is invalid
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Auth error - clearing token');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } else if (!error.response) {
        // Network error - check if we have a token
        // If token exists, keep it and don't clear user (allows retry)
        // If no token, user stays null (which is correct)
        const token = localStorage.getItem('token');
        if (token) {
          console.warn('Network error during fetchUser - token exists, keeping for retry');
          // Don't set user to null - keep existing user if any, or leave null if initial load
          // This prevents redirect on network errors
        } else {
          console.warn('Network error during fetchUser - no token, user remains null');
          // No token, so user should be null (correct state)
        }
      } else {
        // Other errors - clear token to be safe
        console.warn('Unexpected error during fetchUser - clearing token');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } finally {
      // Always set loading to false after fetch attempt (if mounted)
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Set axios header before making request (backup, interceptor also handles this)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch user data
        await fetchUser();
      } else {
        // No token - user is not authenticated
        if (isMountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    initAuth();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      // Save token
      const token = res.data.token;
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', token);
      // Set axios header (backup, interceptor also handles this)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user object - ensure it has required fields
      const userData = res.data.user;
      if (userData && userData._id) {
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid user data received from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });

      const token = res.data.token;
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', token);
      // Set axios header (backup, interceptor also handles this)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userData = res.data.user;
      if (userData && userData._id) {
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid user data received from server');
      }
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
