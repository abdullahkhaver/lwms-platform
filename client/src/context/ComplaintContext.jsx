import { createContext, useContext, useCallback, useState } from 'react';
import axios from 'axios';

const ComplaintContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const complaintClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
complaintClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new complaint
  const createComplaint = useCallback(async (complaintData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await complaintClient.post('/complaints', complaintData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create complaint';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's complaints
  const getUserComplaints = useCallback(async (status = null) => {
    try {
      setError(null);
      setLoading(true);
      const url = status
        ? `/complaints/my-complaints?status=${status}`
        : '/complaints/my-complaints';
      const response = await complaintClient.get(url);
      setComplaints(response.data.complaints);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch complaints';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Track complaint by tracking ID
  const trackComplaint = useCallback(async (trackingId) => {
    try {
      setError(null);
      const response = await complaintClient.get(`/complaints/track/${trackingId}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Complaint not found';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin: Get all complaints
  const getAllComplaints = useCallback(async (status = null, sortBy = 'createdAt') => {
    try {
      setError(null);
      setLoading(true);
      const url = status
        ? `/complaints/admin/all?status=${status}&sortBy=${sortBy}`
        : `/complaints/admin/all?sortBy=${sortBy}`;
      const response = await complaintClient.get(url);
      setComplaints(response.data.complaints);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch complaints';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Get complaint by ID
  const getComplaintById = useCallback(async (id) => {
    try {
      setError(null);
      const response = await complaintClient.get(`/complaints/admin/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch complaint';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin: Update complaint status
  const updateComplaintStatus = useCallback(async (id, status) => {
    try {
      setError(null);
      const response = await complaintClient.put(`/complaints/admin/${id}/status`, {
        status,
      });
      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin: Delete complaint
  const deleteComplaint = useCallback(async (id) => {
    try {
      setError(null);
      const response = await complaintClient.delete(`/complaints/admin/${id}`);
      // Update local state
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete complaint';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin: Get complaints by location
  const getComplaintsByLocation = useCallback(async () => {
    try {
      setError(null);
      const response = await complaintClient.get('/complaints/admin/map');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch locations';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin: Get dashboard statistics
  const getDashboardStats = useCallback(async () => {
    try {
      setError(null);
      const response = await complaintClient.get('/complaints/admin/stats');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch statistics';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Admin: Generate report
  const generateReport = useCallback(async (startDate = null, endDate = null, status = null) => {
    try {
      setError(null);
      let url = '/complaints/admin/report';
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (status) params.push(`status=${status}`);
      if (params.length > 0) url += '?' + params.join('&');

      const response = await complaintClient.get(url);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate report';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const value = {
    complaints,
    loading,
    error,
    createComplaint,
    getUserComplaints,
    trackComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    deleteComplaint,
    getComplaintsByLocation,
    getDashboardStats,
    generateReport,
    setError,
  };

  return (
    <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
