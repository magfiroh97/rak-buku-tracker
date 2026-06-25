// src/api/books.js
// Wrapper endpoint Fitur 7,8,10,11,12,13,14,20,21

import apiClient from './client';

export const booksApi = {
  // Fitur 7 (Home) & 13 (Filter): params bisa { status, category_id, wishlist, favorite, search }
  getAll: (params = {}) => apiClient.get('/books', { params }),

  getById: (id) => apiClient.get(`/books/${id}`),

  // Fitur 8: Tambah Buku Manual (juga dipakai untuk simpan hasil dari Google Books/scan)
  create: (bookData) => apiClient.post('/books', bookData),

  // Fitur 11: Edit Buku
  update: (id, bookData) => apiClient.put(`/books/${id}`, bookData),

  // Fitur 12: Hapus Buku
  remove: (id) => apiClient.delete(`/books/${id}`),

  // Fitur 14: Update Progress Baca
  updateProgress: (id, current_page) =>
    apiClient.patch(`/books/${id}/progress`, { current_page }),

  // Fitur 21: Toggle Favorit
  toggleFavorite: (id) => apiClient.patch(`/books/${id}/favorite`),

  // Fitur 20: Toggle Wishlist
  toggleWishlist: (id) => apiClient.patch(`/books/${id}/wishlist`),
};
