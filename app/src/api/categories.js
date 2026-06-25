// src/api/categories.js
// Wrapper endpoint Fitur 18 (Kategori), 19 (Tambah Kategori Custom)

import apiClient from './client';

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  create: (name) => apiClient.post('/categories', { name }),
  remove: (id) => apiClient.delete(`/categories/${id}`),
};
