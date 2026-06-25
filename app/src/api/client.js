// src/api/client.js
// Axios instance terpusat. Semua file src/api/*.js memakai ini supaya
// token JWT otomatis terpasang di setiap request.

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';

export const TOKEN_KEY = 'rakbuku_auth_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper untuk ambil pesan error yang konsisten dari backend kita
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message === 'Network Error') {
    return 'Tidak bisa terhubung ke server. Cek koneksi internet atau pastikan backend sedang berjalan.';
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

export default apiClient;
