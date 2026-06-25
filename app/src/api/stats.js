// src/api/stats.js
// Wrapper endpoint Fitur 22 (Statistik), 23 (Target Tahunan), 24 (Riwayat Aktivitas)

import apiClient from './client';

export const statsApi = {
  getStats: (year) => apiClient.get('/stats', { params: { year } }),
  getGoal: (year) => apiClient.get('/stats/goal', { params: { year } }),
  setGoal: (year, target_books) => apiClient.post('/stats/goal', { year, target_books }),
  getActivities: (limit = 50) => apiClient.get('/stats/activities', { params: { limit } }),
};
