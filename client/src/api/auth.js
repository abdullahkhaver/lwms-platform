import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const registerUser = (data) => axios.post(`${API}/register`, data);

export const loginUser = (data) => axios.post(`${API}/login`, data);

export const getProfile = (token) =>
  axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (token, data) =>
  axios.put(`${API}/me`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllUsers = (token) =>
  axios.get(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

