// src/api/auth.js
// Wrapper endpoint Fitur 3 (Register), 4 (Login), 5 (Edit Profil), 6 (Pengaturan)

import apiClient from './client';

export const authApi = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data) => apiClient.put('/auth/profile', data),

  updateSettings: (data) => apiClient.put('/auth/settings', data),

  changePassword: (old_password, new_password) =>
    apiClient.put('/auth/change-password', { old_password, new_password }),
};
