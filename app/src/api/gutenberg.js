// src/api/gutenberg.js
import apiClient from './client';

export const gutenbergApi = {
  checkAvailability: (title, author) =>
    apiClient.get('/gutenberg/check', { params: { title, author } }),
  getBookText: (textUrl) =>
    apiClient.get('/gutenberg/text', { params: { textUrl } }),
};
