// src/api/reviews.js
// Wrapper endpoint Fitur 15 (Rating), 16 (Review), 17 (Lihat Semua Review)

import apiClient from './client';

export const reviewsApi = {
  getAll: () => apiClient.get('/reviews'),

  upsert: (bookId, rating, note) =>
    apiClient.post(`/reviews/${bookId}`, { rating, note }),

  remove: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};
