import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const getMe = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.get('/auth/me');
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (name, email) => {
    try {
      setError(null);
      const response = await apiClient.put('/auth/me', {
        name,
        email,
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin functions
  const getAllUsers = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.get('/auth/users');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiClient.get(`/auth/users/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateUserRole = useCallback(async (id, role) => {
    try {
      setError(null);
      const response = await apiClient.put(`/auth/users/${id}/role`, { role });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update role';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiClient.delete(`/auth/users/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    getMe,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
