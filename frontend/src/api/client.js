// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Her istekte token'ı otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ts_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
 