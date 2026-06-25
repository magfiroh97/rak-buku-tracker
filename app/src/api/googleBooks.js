// src/api/googleBooks.js
// Wrapper endpoint Fitur 9: Cari Buku via Google Books API & Scan Barcode ISBN

import apiClient from './client';

export const googleBooksApi = {
  search: (query) => apiClient.get('/google-books/search', { params: { q: query } }),
  searchByIsbn: (isbn) => apiClient.get(`/google-books/isbn/${isbn}`),
};
